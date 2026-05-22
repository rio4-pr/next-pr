"use client";

export function Sidebar({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <div
      className={`
        ${collapsed ? "w-20" : "w-64"}
        sticky top-0 self-start
        h-screen
        bg-gradient-to-b from-[#0B3C5D] to-[#0F4C81]
        text-white p-4
        transition-all duration-300
      `}
    >
      {children}
    </div>
  );
}

export function SidebarBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarItem({
  children,
  active = false,
  collapsed = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"}
        py-2 rounded-lg cursor-pointer
        transition-all duration-200
        
        ${
          active
            ? "bg-white text-[#0B3C5D] shadow-md"
            : "text-white/90 hover:bg-white/10"
        }
      `}
    >
      {children}
    </div>
  );
}

export function SidebarLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return <span className="text-sm">{children}</span>;
}