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
        ${collapsed
          ? "w-20"
          : "w-64"
        }

        sticky
        top-0
        self-start

        h-screen

        bg-gradient-to-b
        from-[#0B3C5D]
        to-[#0F4C81]

        text-white
        p-4

        overflow-hidden

        shadow-xl

        transition-all
        duration-500
        ease-in-out
      `}
    >
      {children}
    </div>
  );
}

export function SidebarBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}

export function SidebarSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {children}
    </div>
  );
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
        group

        flex
        items-center

        ${collapsed
          ? "justify-center"
          : "gap-3 px-3"
        }

        py-3
        rounded-xl

        cursor-pointer

        transition-all
        duration-300

        hover:translate-x-1
        hover:scale-[1.02]

        ${active
          ? `
              bg-white
              text-[#0B3C5D]
              shadow-lg
              font-medium
            `
          : `
              text-white/90
              hover:bg-white/10
            `
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
  return (
    <span
      className={`
        overflow-hidden
        whitespace-nowrap

        transition-all
        duration-200
        ease-in-out

        ${collapsed
          ? "max-w-0 opacity-0"
          : "max-w-xs opacity-100"
        }
      `}
    >
      <span className="text-sm">
        {children}
      </span>
    </span>
  );
}