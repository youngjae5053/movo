import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
          <span className="text-2xl font-bold text-emerald-400">M</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Movo</h1>
        <p className="mt-2 text-sm text-muted">
          트레이너 계정으로 로그인하세요
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Supabase Auth로 로그인합니다
      </p>
    </div>
  );
}
