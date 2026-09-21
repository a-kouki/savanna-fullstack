// app/admin/layout.tsx
import { AdminSidebar } from './_components/AdminSidebar'
import { AdminProvider } from './_components/AdminContext'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <div className="bg-neutral-50 md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr]">

        <AdminSidebar />

        <main className="
          min-h-screen
          pb-24 md:pb-0
          md:h-screen md:overflow-y-auto
        ">
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6">
            {children}
          </div>
        </main>

      </div>
    </AdminProvider>
  )
}