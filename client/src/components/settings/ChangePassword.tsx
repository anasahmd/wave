import { changePasswordSchema } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "@/services/apiClient";
import { toast } from "sonner";

export default function ChangePassword() {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await api.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully");
      form.reset();
    } catch {
      // Error toasted by axios interceptor
    }
  });

  return (
    <div className="my-8">
      <h4 className="mb-6 font-medium">Change Password</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="text-xs font-normal">
                Current Password
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
                placeholder="Current Password"
                className="rounded-md"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="text-xs font-normal">
                New Password
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                placeholder="New Password"
                className="rounded-md"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="text-xs font-normal">
                Confirm New Password
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                placeholder="Confirm New Password"
                className="rounded-md"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="mt-2 rounded-md"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
