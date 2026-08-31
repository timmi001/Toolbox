interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="w-full min-h-screen bg-[#07090c] text-white selection:bg-[#3BDDB2]/20">
      <main className="min-h-screen w-full min-w-0">{children}</main>
    </div>
  );
}
