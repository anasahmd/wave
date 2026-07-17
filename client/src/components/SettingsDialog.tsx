import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    email: string
    avatar: string
  }
}

export default function SettingsDialog({
  open,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile & Preferences</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
