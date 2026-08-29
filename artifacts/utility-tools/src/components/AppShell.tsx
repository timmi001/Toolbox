interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-[#3BDDB2]/20">
      <main className="min-h-screen min-w-0">{children}</main>
    </div>
  );
}
