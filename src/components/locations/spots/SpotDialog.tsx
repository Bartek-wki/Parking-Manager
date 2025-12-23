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
import type { CreateSpotCmd } from "@/types";
import { useEffect } from "react";
import { ApiError } from "@/lib/api/client-utils";

interface SpotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSpotCmd) => Promise<void>;
  defaultValues?: Partial<CreateSpotCmd>;
  title: string;
  description: string;
  submitLabel: string;
}

const spotSchema = z.object({
  spot_number: z.string().min(1, "Numer miejsca jest wymagany"),
});

export function SpotDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
  description,
  submitLabel,
}: SpotDialogProps) {
  const form = useForm({
    defaultValues: {
      spot_number: defaultValues?.spot_number || "",
    },
    validators: {
      onChange: spotSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
        onOpenChange(false);
        form.reset();
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          form.setFieldMeta("spot_number", (prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              onChange: {
                message: (error.payload as { errors?: { message: string }[] })?.errors?.[0]
                  ?.message,
              },
            },
          }));
          return;
        }
        // Rethrow other errors for parent to handle
        throw error;
      }
    },
  });

  // Reset form when dialog opens/closes or defaultValues change
  const defaultSpotNumber = defaultValues?.spot_number;
  useEffect(() => {
    if (open) {
      form.reset({
        spot_number: defaultSpotNumber || "",
      });
    }
  }, [open, defaultSpotNumber, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          <form.Field name="spot_number">
            {(field) => {
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Numer miejsca</Label>
                  <Input
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
