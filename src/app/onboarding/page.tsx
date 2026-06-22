import { AppShell } from "@/components/AppShell";
import { OnboardingForm } from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <AppShell title="시작하기" showHeader>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">프로필 설정</h1>
        <p className="mt-2 text-sm text-muted">센터 정보를 입력하고 Movo를 시작하세요</p>
        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </AppShell>
  );
}
