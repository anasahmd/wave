import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema } from "@/validations/auth";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { AxiosError } from "axios";

const Login = () => {
  const { handleLogin } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      const user = response.data.user;
      handleLogin(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        response.data.token
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data.error) {
          toast.error(error.response.data.error);
        }
        console.log(error);
      } else {
        console.log("An unexpected error occurred", error);
      }
    }
  };

  return (
    <section className="my-8 flex w-full items-center justify-center py-8 text-start">
      <div className="w-full max-w-md space-y-6">
        <h2 className="my-10 text-center text-3xl font-bold">Login</h2>
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
                <FieldLabel htmlFor={field.name} className="text-md font-bold">
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
                <FieldLabel htmlFor={field.name} className="text-md font-bold">
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

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <Button
              type="submit"
              className="text-md w-full cursor-pointer rounded-md font-bold"
            >
              Login
            </Button>
          </div>
        </form>

        <Button
          type="submit"
          className="text-md w-full cursor-pointer rounded-md font-bold"
        >
          Login as guest
        </Button>
        <div className="mt-10 text-center">
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
