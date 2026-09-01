import { useAuth } from "@/providers/AuthProvider";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

import { toast } from "sonner";

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
      toast.success("Profile updated successfully");
    } catch {
      // Error toasted by axios interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-8">
      <h4 className="mb-6 font-medium">Edit Account Information</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
        <Field>
          <FieldLabel htmlFor="name" className="text-xs font-normal">
            Name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email" className="text-xs font-normal">
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          className="mt-2"
          disabled={saving || !hasChanges}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
