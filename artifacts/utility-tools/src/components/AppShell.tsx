interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="w-full min-h-screen bg-[#07090c] text-white selection:bg-[#3BDDB2]/20">
      <main className="app-main flex min-h-screen w-full min-w-0 justify-center">
        <div className="mx-auto w-full max-w-[1480px]">{children}</div>
      </main>
    </div>
  );
}
