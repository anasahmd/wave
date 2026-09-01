import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addDatabaseSchema } from "@/validations/database";
import { addConnection as addConnectionAction } from "@/slices/connectionSlice";
import { useConnection } from "@/providers/ConnectionProvider";
import { toast } from "sonner";

interface AddDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDatabaseDialog({
  open,
  onOpenChange,
}: AddDatabaseDialogProps) {
  const { addConnection } = useConnection();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(addDatabaseSchema),
    defaultValues: {
      name: "",
      uri: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async ({ name, uri }: { name: string; uri: string }) => {
    const result = await addConnection({ name, uri });
    if (addConnectionAction.fulfilled.match(result)) {
      toast.success("Database added successfully");
      onOpenChange(false);
      form.reset({ name: "", uri: "" });
      navigate("/new");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Add Database</DialogTitle>
          <DialogDescription className="mt-2">
            Recommended: Use a database user with read-only (SELECT) privileges.
            This prevents executed queries from modifying or deleting your data.
          </DialogDescription>
        </DialogHeader>
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
                <FieldLabel htmlFor={field.name} className="text-md font-bold">
                  Name
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  placeholder="Name"
                  autoComplete="name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="uri"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="text-md font-bold">
                  Database URI
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  placeholder="Database URI"
                  autoComplete="url"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              }
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Connecting..." : "Add Database"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
