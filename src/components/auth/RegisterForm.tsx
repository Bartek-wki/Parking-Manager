import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validation/auth";

export function RegisterForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.password !== value.confirmPassword) {
          form.setFieldMeta("confirmPassword", (prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              onChange: { message: "Hasła muszą być identyczne" },
            },
          }));
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: value.email,
            password: value.password,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 400 && data.error === "User already registered") {
            form.setFieldMeta("email", (prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                onChange: { message: "Użytkownik o podanym adresie email już istnieje" },
              },
            }));
            return;
          }
          throw new Error(data.error || "Błąd rejestracji");
        }

        const data = await res.json();

        // If session is returned, we are logged in.
        // We assume auto-login or success based on user requirements.

        toast.success("Konto zostało utworzone!");

        if (data.session) {
          window.location.href = "/";
        } else {
          toast.info("Sprawdź swoją skrzynkę email, aby potwierdzić konto.");
        }
      } catch (error) {
        toast.error("Błąd rejestracji", {
          description: error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji",
        });
      }
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>Utwórz nowe konto, aby korzystać z aplikacji.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message as string}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Hasło</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message as string}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Potwierdź hasło</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message as string}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Tworzenie konta..." : "Zarejestruj się"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Masz już konto?{" "}
          <a href="/login" className="text-primary underline-offset-4 hover:underline">
            Zaloguj się
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
