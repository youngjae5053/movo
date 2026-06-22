import { AppShell } from "@/components/AppShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AppShell showHeader={false}>
      <div className="mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-muted">가입 이메일로 재설정 링크를 보냅니다</p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </AppShell>
  );
}
