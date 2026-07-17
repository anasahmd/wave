import { ExternalLink, Waves } from "lucide-react"

const AuthHeader = () => {
  return (
    <header className="z-10 mx-auto flex h-12 w-full max-w-2xl items-center justify-between border-b bg-background py-10">
      <div className="flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Waves className="size-4" />
        </div>
        <div className="text-xl font-bold">Wave</div>
      </div>

      <a
        href="https://anasahmad.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <span>Built by Anas</span>
        <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
      </a>
    </header>
  )
}

export default AuthHeader
