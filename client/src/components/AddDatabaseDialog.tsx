import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { addDatabaseSchema } from "@/validations/database";
import { useConnection } from "@/context/ConnectionContext";
import { api } from "@/services/apiClient";
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

  const form = useForm({
    resolver: zodResolver(addDatabaseSchema),
    defaultValues: {
      name: "",
      uri: "",
    },
  });

  const onSubmit = async ({ name, uri }: { name: string; uri: string }) => {
    try {
      const response = await api.connectDb({ name, uri });
      addConnection(response.connection);
      onOpenChange(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.log(error);
      } else {
        toast.error("An unexpected error occurred");
        console.log("An unexpected error occurred", error);
      }
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
                  type="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Name"
                  autoComplete="name"
                  className="rounded-md"
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
                  placeholder="Database URI"
                  autoComplete="url"
                  className="rounded-md"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />

            <Button type="submit" className="">
              Add Database
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
