"use client";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white p-4">
      {children}
    </div>
  );
}

export function SidebarBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function SidebarItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded hover:bg-blue-800 cursor-pointer">
      {children}
    </div>
  );
}

export function SidebarLabel({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}