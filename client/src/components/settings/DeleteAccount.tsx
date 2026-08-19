import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/apiClient";
import { deleteAccountSchema } from "@/validations/auth";

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export default function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const { handleLogout } = useAuth();

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await api.deleteAccount(data.password);
      toast.success("Account deleted successfully");
      setOpen(false);
      handleLogout();
    } catch {
      // Error toasted by axios interceptor
    }
  });

  return (
    <div className="my-8 flex items-center justify-between">
      <div>
        <div className="font-semibold">Delete Account?</div>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all associated data
        </p>
      </div>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger
          render={<Button variant="destructive">Delete</Button>}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <AlertTriangleIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account, database connections, and chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={onSubmit} className="my-2 space-y-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-normal"
                  >
                    Enter your password to confirm
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner className="mr-2" /> Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

