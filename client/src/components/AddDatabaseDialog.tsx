import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { addDatabaseSchema } from "@/validations/database"

interface AddDatabaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddDatabaseDialog({
  open,
  onOpenChange,
}: AddDatabaseDialogProps) {
  const form = useForm({
    resolver: zodResolver(addDatabaseSchema),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = async (data) => {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
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
          {/* <Controller
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        /> */}

          <div>
            <Button
              type="submit"
              className="text-md w-full cursor-pointer rounded-md font-bold"
            >
              Add Database
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
