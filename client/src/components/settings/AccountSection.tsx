import { Separator } from "../ui/separator";
import ChangePassword from "./ChangePassword";
import EditAccountInfo from "./EditAccountInfo";
import DeleteAccount from "./DeleteAccount";

export default function AccountSection() {
  return (
    <div className="overflow-y-auto px-4">
      <h3 className="mb-6 font-semibold">Account</h3>
      <EditAccountInfo />
      <Separator />
      <ChangePassword />
      <Separator />
      <DeleteAccount />
    </div>
  );
}
