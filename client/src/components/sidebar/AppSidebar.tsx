import { ChevronsUpDown, LogOut, Settings, SettingsIcon } from "lucide-react"
import DatabaseSwitcherMenu from "@/components/sidebar/DatabaseSwitcherMenu"
import AppSidebarFooter from "@/components/sidebar/AppSidebarFooter"
import SchemaExplorer from "./SchemaExplorer"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "../ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Link } from "react-router-dom"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  databases: [
    {
      id: "db-ecommerce-prod-001",
      name: "Production E-Commerce",
      db_type: "postgres",
      createdAt: "2024-05-12T10:00:00Z",
      updatedAt: "2024-05-15T11:23:00Z",
      schema: {
        users: [
          { name: "id", type: "UUID", primaryKey: true },
          { name: "email", type: "VARCHAR(255)", primaryKey: false },
          { name: "password_hash", type: "VARCHAR(255)", primaryKey: false },
          { name: "created_at", type: "TIMESTAMP", primaryKey: false },
        ],
        products: [
          { name: "id", type: "INTEGER", primaryKey: true },
          { name: "sku", type: "VARCHAR(50)", primaryKey: false },
          { name: "name", type: "VARCHAR(200)", primaryKey: false },
          { name: "price", type: "DECIMAL(10,2)", primaryKey: false },
          { name: "stock_quantity", type: "INTEGER", primaryKey: false },
        ],
        orders: [
          { name: "order_id", type: "UUID", primaryKey: true },
          { name: "user_id", type: "UUID", primaryKey: false },
          { name: "total_amount", type: "DECIMAL(10,2)", primaryKey: false },
          { name: "status", type: "VARCHAR(20)", primaryKey: false },
        ],
      },
    },
    {
      id: "db-hr-internal-002",
      name: "Internal HR System",
      db_type: "mysql",
      createdAt: "2024-06-01T08:15:00Z",
      updatedAt: "2024-06-01T08:15:00Z",
      schema: {
        employees: [
          { name: "emp_no", type: "INT", primaryKey: true },
          { name: "first_name", type: "VARCHAR(14)", primaryKey: false },
          { name: "last_name", type: "VARCHAR(16)", primaryKey: false },
          { name: "hire_date", type: "DATE", primaryKey: false },
        ],
        departments: [
          { name: "dept_no", type: "CHAR(4)", primaryKey: true },
          { name: "dept_name", type: "VARCHAR(40)", primaryKey: false },
        ],
        salaries: [
          { name: "emp_no", type: "INT", primaryKey: true },
          { name: "salary", type: "INT", primaryKey: false },
          { name: "from_date", type: "DATE", primaryKey: true },
        ],
      },
    },
    {
      id: "db-blog-dev-003",
      name: "Local Dev Blog",
      db_type: "better-sqlite3",
      createdAt: "2024-07-10T14:30:00Z",
      updatedAt: "2024-07-14T09:45:00Z",
      schema: {
        posts: [
          { name: "id", type: "INTEGER", primaryKey: true },
          { name: "title", type: "TEXT", primaryKey: false },
          { name: "content", type: "TEXT", primaryKey: false },
          { name: "published", type: "BOOLEAN", primaryKey: false },
        ],
        comments: [
          { name: "id", type: "INTEGER", primaryKey: true },
          { name: "post_id", type: "INTEGER", primaryKey: false },
          { name: "author_name", type: "TEXT", primaryKey: false },
          { name: "body", type: "TEXT", primaryKey: false },
        ],
      },
    },
  ],

  // Separate history tracker to keep operations modular
  queryHistory: [
    {
      id: "q-1",
      databaseId: "db-ecommerce-prod",
      title: "Active users this month",
      timestamp: "2 mins ago",
    },
    {
      id: "q-2",
      databaseId: "db-ecommerce-prod",
      title: "Total revenue from active customers",
      timestamp: "1 hour ago",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = data.user
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu databases={data.databases} />
      </SidebarHeader>
      <SidebarContent>
        <SchemaExplorer schema={data.databases[0].schema} />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
