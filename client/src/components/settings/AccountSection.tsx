import { Separator } from "../ui/separator";
import ChangePassword from "./ChangePassword";
import EditAccountInfo from "./EditAccountInfo";

export default function AccountSection() {
  return (
    <div className="overflow-y-auto px-4">
      <h3 className="mb-6 font-semibold">Account</h3>
      <EditAccountInfo />
      <Separator />
      <ChangePassword />
    </div>
  );
}
