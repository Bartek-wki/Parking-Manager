import { useForm } from "@tanstack/react-form";
import { createClientSchema } from "@/lib/validation/clients";
import type { ClientDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClientMutation, useUpdateClientMutation } from "@/lib/queries/clients";
import { ApiError } from "@/lib/api/client-utils";
import { toast } from "sonner";

interface ClientFormProps {
  defaultValues?: Partial<ClientDTO>;
  clientId?: string;
  onSuccess?: () => void;
}

export function ClientForm({ defaultValues, clientId, onSuccess }: ClientFormProps) {
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();

  const isEditing = !!clientId;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
      email: defaultValues?.email ?? null,
      phone: defaultValues?.phone ?? null,
    },
    validators: {
      onChange: createClientSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing && clientId) {
          await updateMutation.mutateAsync({ id: clientId, data: value });
          toast.success("Klient zaktualizowany");
        } else {
          await createMutation.mutateAsync(value);
          toast.success("Klient dodany");
        }
        onSuccess?.();
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          const payload = error.payload as { errors?: { path: string[]; message: string }[] };
          if (payload?.errors) {
            payload.errors.forEach((err) => {
              if (err.path && err.path.length > 0) {
                // TanStack Form expects specific field names
                // Assuming err.path[0] matches the field name
                const fieldName = err.path[0] as "first_name" | "last_name" | "email" | "phone";
                form.setFieldMeta(fieldName, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    onChange: { message: err.message },
                  },
                }));
              } else {
                toast.error(err.message);
              }
            });
          }
          return;
        }

        // Handle other errors
        toast.error("Wystąpił błąd podczas zapisywania");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="first_name">
        {(field) => (
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
                {field.state.meta.errors
                  .map((e) => (e as unknown as { message: string }).message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="last_name">
        {(field) => (
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
                {field.state.meta.errors
                  .map((e) => (e as unknown as { message: string }).message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors ? (
              <p className="text-sm text-red-500">
                {field.state.meta.errors
                  .map((e) => (e as unknown as { message: string }).message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Telefon</Label>
            <Input
              id={field.name}
              name={field.name}
              type="tel"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors ? (
              <p className="text-sm text-red-500">
                {field.state.meta.errors
                  .map((e) => (e as unknown as { message: string }).message)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>
    </form>
  );
}
