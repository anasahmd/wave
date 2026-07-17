import { Navigate, Outlet } from "react-router-dom"
import AuthHeader from "../AuthHeader"

export function AuthLayout({ user }: { user: any }) {
  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col px-6 sm:px-12">
      <AuthHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
