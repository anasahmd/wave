import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { registerSchema } from "@/validations/auth";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { api } from "@/services/apiClient";
import { useAuth } from "@/providers/AuthProvider";
import type { RegisterPayload } from "@/types";
import { Spinner } from "@/components/ui/spinner";

const Register = () => {
  const { handleLogin } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async ({ email, password, name }: RegisterPayload) => {
    try {
      // Api call
      const { user, token } = await api.register({ email, password, name });

      handleLogin(user, token);
    } catch {
      // error toasted by interceptor
    }
  };

  return (
    <section className="my-8 flex w-full items-center justify-center py-8 text-start">
      <div className="w-full max-w-md space-y-6">
        <h2 className="my-10 text-center text-3xl font-medium">Register</h2>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-md font-medium"
                >
                  Full Name
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  placeholder="Full Name"
                  autoComplete="name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-md font-medium"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  placeholder="Email"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-md font-medium"
                >
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  placeholder="Password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-md font-medium"
                >
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-md mt-4 w-full font-medium"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Register;
