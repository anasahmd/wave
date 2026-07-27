import { cn } from "@/lib/utils";

interface SettingsNavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function SettingsNavButton({
  active,
  children,
  ...props
}: SettingsNavButtonProps) {
  return (
    <button
      className={cn(
        "mb-0.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
        active && "bg-accent"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
