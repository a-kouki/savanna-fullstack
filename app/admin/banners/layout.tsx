// app/admin/banners/layout.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function BannersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isEditing = /^\/admin\/banners\/[^/]+$/.test(pathname) && !pathname.endsWith('/new');

  return (
    <div>
      <div className={isEditing ? 'hidden' : ''}>{children}</div>
    </div>
  );
}
