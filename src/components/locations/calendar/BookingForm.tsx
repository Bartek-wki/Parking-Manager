import React, { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useBookingPreview,
} from "@/lib/queries/bookings";
import type {
  BookingDetailDTO,
  CreateBookingCmd,
  UpdateBookingCmd,
  PreviewBookingCmd,
  ReservationType,
  PaymentStatus,
} from "@/types";
import { ClientSelect } from "./ClientSelect";
import { SpotSelect } from "./SpotSelect";
import { BookingTypeToggle } from "./BookingTypeToggle";
import { DateRangePicker } from "./DateRangePicker";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { CostPreviewCard } from "./CostPreviewCard";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client-utils";

interface FieldError {
  message: string;
}

interface BookingFormProps {
  locationId: string;
  mode: "create" | "edit";
  initialData?: BookingDetailDTO;
  initialDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const bookingSchema = z
  .object({
    client_id: z.string().min(1, "Klient jest wymagany"),
    spot_id: z.string().min(1, "Miejsce jest wymagane"),
    start_date: z.string().min(1, "Data rozpoczęcia jest wymagana"),
    end_date: z.string().nullable(),
    type: z.enum(["periodic", "permanent"] as const),
    payment_status: z.enum(["nieoplacone", "oplacone"] as const),
  })
  .superRefine((data, ctx) => {
    if (data.type === "periodic" && !data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data zakończenia jest wymagana dla rezerwacji okresowej",
        path: ["end_date"],
      });
    }
    if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia",
        path: ["end_date"],
      });
    }
  });

interface PreviewLogicProps {
  values: z.infer<typeof bookingSchema>;
  isInvalid: boolean;
  onParamsChange: (params: PreviewBookingCmd | null) => void;
  locationId: string;
  mode: "create" | "edit";
  initialDataId?: string;
}

const PreviewLogic = ({
  values,
  isInvalid,
  onParamsChange,
  locationId,
  mode,
  initialDataId,
}: PreviewLogicProps) => {
  useEffect(() => {
    if (isInvalid || !values.spot_id || !values.start_date) {
      onParamsChange(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      onParamsChange({
        location_id: locationId,
        spot_id: values.spot_id,
        start_date: values.start_date,
        type: values.type,
        exclude_booking_id: mode === "edit" ? initialDataId : undefined,
        ...(values.type === "periodic" && { end_date: values.end_date }),
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    values.spot_id,
    values.start_date,
    values.end_date,
    values.type,
    isInvalid,
    locationId,
    mode,
    initialDataId,
    onParamsChange,
  ]);

  return null;
};

export function BookingForm({
  locationId,
  mode,
  initialData,
  initialDate,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const createMutation = useCreateBookingMutation();
  const updateMutation = useUpdateBookingMutation();

  const [debouncedPreviewParams, setDebouncedPreviewParams] = useState<PreviewBookingCmd | null>(
    null
  );

  const form = useForm({
    defaultValues: {
      client_id: initialData?.client_id || "",
      spot_id: initialData?.spot_id || "",
      start_date: initialData?.start_date || initialDate || new Date().toISOString().split("T")[0],
      end_date: initialData?.end_date || null,
      type: (initialData?.type as ReservationType) || "periodic",
      payment_status: (initialData?.payment_status as PaymentStatus) || "nieoplacone",
    },
    validators: {
      onChange: bookingSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (mode === "create") {
          const cmd: CreateBookingCmd = {
            location_id: locationId,
            client_id: value.client_id,
            spot_id: value.spot_id,
            start_date: value.start_date,
            type: value.type,
            ...(value.type === "periodic" && { end_date: value.end_date }),
          };
          await createMutation.mutateAsync(cmd);
          toast.success("Rezerwacja została utworzona");
        } else if (mode === "edit" && initialData) {
          const cmd: UpdateBookingCmd = {
            start_date: value.start_date,
            payment_status: value.payment_status,
            type: value.type,
            ...(value.type === "periodic" && { end_date: value.end_date }),
          };
          await updateMutation.mutateAsync({ id: initialData.id, data: cmd });
          toast.success("Rezerwacja została zaktualizowana");
        }
        onSuccess();
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          // Basic mapping of backend errors to form fields if structure matches
          // Since we use Zod on frontend, this catches most.
          // Backend specific logical errors (like availability) are 409 usually?
          // Plan says 409 Conflict map to form field.
        } else if (
          error instanceof Error &&
          error.message.includes("Wybbrane miejsce jest już zajęte w tym terminie")
        ) {
          // This might come from createBooking implementation which throws Error
          toast.error("Wybrane miejsce jest już zajęte w tym terminie.");
          // We could also set form error
          form.setFieldMeta("spot_id", (prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onSubmit: "Miejsce zajęte" }, // simplified
          }));
        } else {
          toast.error("Wystąpił błąd podczas zapisywania rezerwacji");
        }
      }
    },
  });

  // Handle type change to reset end_date for permanent bookings
  const handleTypeChange = (newType: "periodic" | "permanent") => {
    form.setFieldValue("type", newType);
    if (newType === "permanent") {
      form.setFieldValue("end_date", null);
    }
  };

  // Watch for changes to trigger preview
  // We use a Subscribe component to avoid accessing form.store directly if types are issues
  const PreviewWatcher = () => (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        isInvalid:
          (state.fieldMeta.spot_id?.errors?.length ?? 0) > 0 ||
          (state.fieldMeta.start_date?.errors?.length ?? 0) > 0 ||
          (state.fieldMeta.end_date?.errors?.length ?? 0) > 0 ||
          (state.fieldMeta.type?.errors?.length ?? 0) > 0,
      })}
    >
      {({ values, isInvalid }) => (
        <PreviewLogic
          values={values}
          isInvalid={isInvalid}
          onParamsChange={setDebouncedPreviewParams}
          locationId={locationId}
          mode={mode}
          initialDataId={initialData?.id}
        />
      )}
    </form.Subscribe>
  );

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useBookingPreview(
    debouncedPreviewParams || { location_id: "", spot_id: "", start_date: "", type: "periodic" }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <PreviewWatcher />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client - disabled in edit mode if not allowed to change client (usually booking is tied to client) */}
        {mode === "create" && (
          <form.Field name="client_id">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="flex gap-1">
                  Klient <span className="text-destructive">*</span>
                </Label>
                <ClientSelect
                  value={field.state.value}
                  onChange={field.handleChange}
                  error={!!field.state.meta.errors.length}
                />
                {field.state.meta.errors ? (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors
                      .map((e) => (e as FieldError)?.message || "")
                      .join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
        )}
        {mode === "edit" && (
          <div className="space-y-2">
            <Label>Klient</Label>
            <div className="p-2 border rounded-md bg-muted text-sm">
              {initialData?.client?.first_name} {initialData?.client?.last_name}
            </div>
          </div>
        )}

        {/* Spot */}
        <form.Field name="spot_id">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="flex gap-1">
                Miejsce <span className="text-destructive">*</span>
              </Label>
              <SpotSelect
                locationId={locationId}
                value={field.state.value}
                onChange={field.handleChange}
                error={!!field.state.meta.errors.length}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.map((e) => (e as FieldError)?.message || "").join(", ")}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
      </div>

      {/* Booking Type */}
      <form.Field name="type">
        {(field) => (
          <div className="space-y-2">
            <Label>Typ Rezerwacji</Label>
            <BookingTypeToggle value={field.state.value} onChange={handleTypeChange} />
          </div>
        )}
      </form.Field>

      {/* Date Range */}
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) => (
          <form.Field name="start_date">
            {(startField) => (
              <form.Field name="end_date">
                {(endField) => (
                  <DateRangePicker
                    startDate={startField.state.value}
                    endDate={endField.state.value}
                    onStartDateChange={startField.handleChange}
                    onEndDateChange={endField.handleChange}
                    isPermanent={type === "permanent"}
                    errors={{
                      start: startField.state.meta.errors
                        .map((e) => (e as FieldError)?.message || "")
                        .join(", "),
                      end: endField.state.meta.errors
                        .map((e) => (e as FieldError)?.message || "")
                        .join(", "),
                    }}
                  />
                )}
              </form.Field>
            )}
          </form.Field>
        )}
      </form.Subscribe>

      {/* Payment Status - only in Edit mode */}
      {mode === "edit" && (
        <form.Field name="payment_status">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Status Płatności</Label>
              <PaymentStatusSelect
                value={field.state.value || "nieoplacone"}
                onChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>
      )}

      {/* Cost Preview - only for periodic bookings */}
      <form.Subscribe selector={(state) => state.values.type}>
        <CostPreviewCard
          isLoading={isPreviewLoading}
          error={previewError as Error | null}
          data={previewData}
        />
      </form.Subscribe>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Anuluj
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || (previewData && !previewData.available)}
            >
              {isSubmitting
                ? "Zapisywanie..."
                : mode === "create"
                  ? "Utwórz rezerwację"
                  : "Zapisz zmiany"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
