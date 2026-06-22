import { AppShell } from "@/components/AppShell";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <AppShell showHeader={false}>
      <div className="mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold">트레이너 가입</h1>
        <p className="mt-2 text-sm text-muted">Movo로 회원 관리를 시작하세요</p>
        <div className="mt-8">
          <SignupForm />
        </div>
      </div>
    </AppShell>
  );
}
