import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { loginSchema } from "@/validations/auth";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/apiClient";
import { useAuth } from "@/providers/AuthProvider";
import type { LoginPayload } from "@/types";

const Login = () => {
  const { handleLogin, handleGuestLogin } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: LoginPayload) => {
    try {
      const { token, user } = await api.login({ email, password });

      handleLogin(user, token);
    } catch {
      // error toasted by interceptor
    }
  };

  const onGuestLogin = async () => {
    try {
      const { user, token } = await api.guestLogin();
      handleGuestLogin(user, token);
    } catch {
      // error toasted by interceptor
    }
  };

  return (
    <section className="my-8 flex w-full items-center justify-center py-8 text-start">
      <div className="w-full max-w-md space-y-6">
        <h2 className="my-10 text-center text-3xl font-medium">Login</h2>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
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
                  placeholder="Email"
                  autoComplete="email"
                  className="rounded-md"
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
                  autoComplete="current-password"
                  placeholder="Password"
                  className="rounded-md"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm hover:underline">
              Forgot password?
            </Link>
          </div> */}

          <div>
            <Button
              type="submit"
              className="text-md mt-4 w-full cursor-pointer rounded-md font-medium"
            >
              Login
            </Button>
          </div>
        </form>

        <Button
          type="submit"
          className="text-md w-full cursor-pointer rounded-md font-medium"
          onClick={onGuestLogin}
        >
          Login as Guest
        </Button>
        <div className="mt-8 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Login;
