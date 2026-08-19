import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Waves />
        </div>

        <h2 className="mt-8 mb-2 text-xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you are looking for doesn't exist, was removed, or is
          temporarily unavailable.
        </p>

        <Button onClick={() => navigate("/")}>Go back home</Button>
      </div>
    </div>
  );
}
