import { useForm } from "@tanstack/react-form";
import { createLocationSchema } from "@/lib/validation/locations";
import type { CreateLocationCmd, LocationDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationFormProps {
  defaultValues?: Partial<LocationDTO>;
  onSubmit: (values: CreateLocationCmd) => Promise<void>;
  isSubmitting?: boolean;
}

export function LocationForm({ defaultValues, onSubmit, isSubmitting }: LocationFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      daily_rate: defaultValues?.daily_rate ?? 0,
      monthly_rate: defaultValues?.monthly_rate ?? 0,
    },
    validators: {
      onChange: createLocationSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
      <form.Field name="name">
        {(field) => {
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nazwa</Label>
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

      <form.Field name="daily_rate">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Stawka dzienna (PLN)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
            {field.state.meta.errors ? (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.map((e) => (e as { message: string }).message).join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="monthly_rate">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Stawka miesięczna (PLN)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
            {field.state.meta.errors ? (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.map((e) => (e as { message: string }).message).join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie..." : "Zapisz"}
      </Button>
    </form>
  );
}
