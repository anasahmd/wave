import { useAuth } from "@/providers/AuthProvider";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function EditAccountInfo() {
  const { user } = useAuth();
  return (
    <div className="my-8">
      <h4 className="mb-4 font-medium">Edit Account Information</h4>
      <FieldGroup className="flex gap-6">
        <Field className="flex flex-row">
          <FieldLabel htmlFor="name" className="flex-1/2">
            Name
          </FieldLabel>
          <Input name="name" className="w-full rounded-md" value={user?.name} />
        </Field>
        <Field className="flex flex-row">
          <FieldLabel htmlFor="email" className="flex-1/2">
            Email
          </FieldLabel>
          <Input
            name="email"
            className="w-full rounded-md"
            value={user?.email}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
