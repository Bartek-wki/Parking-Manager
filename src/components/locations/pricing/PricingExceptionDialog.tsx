import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreatePricingExceptionCmd } from "@/types";
import { useEffect } from "react";
import { ApiError } from "@/lib/api/client-utils";

interface PricingExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePricingExceptionCmd) => Promise<void>;
  defaultValues?: Partial<CreatePricingExceptionCmd>;
  title: string;
  description: string;
  submitLabel: string;
}

const pricingSchema = z
  .object({
    start_date: z.string().min(1, "Data początkowa jest wymagana"),
    end_date: z.string().min(1, "Data końcowa jest wymagana"),
    percentage_change: z.coerce.number().int().min(-100, "Min -100%").max(1000, "Max 1000%"),
    description: z.string(),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "Data końcowa musi być późniejsza lub równa dacie początkowej",
    path: ["end_date"],
  });

export function PricingExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
  description,
  submitLabel,
}: PricingExceptionDialogProps) {
  const form = useForm({
    defaultValues: {
      start_date: defaultValues?.start_date || "",
      end_date: defaultValues?.end_date || "",
      percentage_change: defaultValues?.percentage_change || 0,
      description: defaultValues?.description || "",
    },
    validators: {
      onChange: pricingSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
        onOpenChange(false);
        form.reset();
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          // Handle conflict errors
          form.setFieldMeta("start_date", (prev) => ({
            ...prev,
            errorMap: {
              onChange: {
                message: (error.payload as { errors?: { message: string }[] })?.errors?.[0]
                  ?.message,
              },
            },
          }));
          return;
        }
        throw error;
      }
    },
  });

  // Reset form when dialog opens/closes or defaultValues change
  useEffect(() => {
    if (open) {
      form.reset({
        start_date: defaultValues?.start_date || "",
        end_date: defaultValues?.end_date || "",
        percentage_change: defaultValues?.percentage_change || 0,
        description: defaultValues?.description || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_date">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Od</Label>
                  <Input
                    type="date"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field name="end_date">
              {(field) => {
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Do</Label>
                    <Input
                      type="date"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors
                          .map((e) => (e as { message: string }).message)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="percentage_change">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Zmiana ceny (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>

                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Opis (opcjonalnie)</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Zapisywanie..." : submitLabel}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
