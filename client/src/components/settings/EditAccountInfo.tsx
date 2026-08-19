import { useAuth } from "@/providers/AuthProvider";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

export default function EditAccountInfo() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanges = name !== user?.name || email !== user?.email;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
    } catch {
      // Error toasted by axios interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-8">
      <h4 className="mb-6 font-medium">Edit Account Information</h4>
      <form onSubmit={handleSubmit}>
        <FieldGroup className="flex gap-6">
          <Field className="flex flex-row">
            <FieldLabel htmlFor="name" className="flex-1/2">
              Name
            </FieldLabel>
            <Input
              id="name"
              name="name"
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field className="flex flex-row">
            <FieldLabel htmlFor="email" className="flex-1/2">
              Email
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </FieldGroup>
        {hasChanges && (
          <Button type="submit" className="mt-4" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </form>
    </div>
  );
}
