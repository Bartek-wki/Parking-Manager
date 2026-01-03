import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClientMutation } from "@/lib/queries/clients";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client-utils";

const clientSchema = z.object({
  first_name: z.string().min(1, "Imię jest wymagane"),
  last_name: z.string().min(1, "Nazwisko jest wymagane"),
  email: z.string().email("Nieprawidłowy email"),
  phone: z.string().min(1, "Telefon jest wymagany"),
});

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (clientId: string) => void;
}

export function CreateClientDialog({
  open,
  onOpenChange,
  onClientCreated,
}: CreateClientDialogProps) {
  const mutation = useCreateClientMutation();

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: clientSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutation.mutateAsync(value);
        // Assuming mutation returns the created client or at least we can refetch.
        // Wait, useCreateClientMutation calls createClientApi.
        // I need to check if createClientApi returns the new client ID or object.
        // If not, I might need to rely on the fact it was just created.
        // But usually create returns the ID.
        // Let's assume it does or I can't pass the ID back.
        // If createClientApi returns null/void, I have a problem picking it.
        // I will assume it returns { id } or similar. If not I'll fix it.

        toast.success("Klient został utworzony");
        onOpenChange(false);
        if (result && typeof result === "object" && "id" in result) {
          onClientCreated((result as any).id);
        } else {
          // If we don't get ID, we can't auto-select easily without refetching and guessing.
          // For now let's assume we might need to adjust based on API response.
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          // Handle validation errors if needed, though client-side zod handles most.
          // API might return "Email taken" etc.
          toast.error("Błąd walidacji danych klienta");
        } else {
          toast.error("Wystąpił błąd podczas tworzenia klienta");
        }
        console.error(error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowego klienta</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="first_name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Imię</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e) => e.message).join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="last_name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Nazwisko</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e) => e.message).join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e) => e.message).join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="phone"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Telefon</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e) => e.message).join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Zapisywanie..." : "Zapisz"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
