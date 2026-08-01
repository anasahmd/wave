import { Separator } from "../ui/separator";
import ChangePassword from "./ChangePassword";
import EditAccountInfo from "./EditAccountInfo";

export default function AccountSection() {
  return (
    <div>
      <h3 className="my-4 font-semibold">Account</h3>
      <EditAccountInfo />
      <Separator />
      <ChangePassword />
    </div>
  );
}
