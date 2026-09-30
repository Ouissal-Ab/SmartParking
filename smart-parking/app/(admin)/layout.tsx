import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { MeshBackdrop } from '@/components/layout/MeshBackdrop';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <MeshBackdrop />
      <AdminSidebar />
      <main className="relative md:ml-64">
        <div className="px-4 pb-12 pt-16 sm:px-6 md:pt-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
