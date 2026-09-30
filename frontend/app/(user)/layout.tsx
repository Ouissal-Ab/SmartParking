import { Navbar } from '@/components/layout/Navbar';
import { MeshBackdrop } from '@/components/layout/MeshBackdrop';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <MeshBackdrop />
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
