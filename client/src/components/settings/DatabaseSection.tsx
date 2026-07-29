import { useConnection } from "@/providers/ConnectionProvider";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";

export default function DatabaseSection() {
  const { connections } = useConnection();
  return (
    <div>
      <h3 className="mt-2 mb-6 font-semibold">Databases</h3>
      {connections.map((connection) => (
        <div
          key={connection.id}
          className="flex items-center justify-between border-b py-3"
        >
          <div className="flex items-center gap-4">
            <span>{connection.name}</span>
            <span className="rounded-full border-2 border-accent px-2 py-1 text-xs">
              {connection.db_type}
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant={"outline"}>
              <Edit />
            </Button>
            <Button variant={"destructive"}>
              <Trash />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
