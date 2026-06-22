import { AppShell } from "@/components/AppShell";
import { InviteAcceptForm } from "@/components/InviteAcceptForm";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  return (
    <AppShell showHeader={false}>
      <div className="mx-auto max-w-md py-10">
        <h1 className="text-2xl font-bold">회원 앱 가입</h1>
        <p className="mt-2 text-sm text-muted">
          트레이너 초대 링크로 Movo 회원 앱을 시작합니다
        </p>
        <div className="mt-8">
          <InviteAcceptForm token={token} />
        </div>
      </div>
    </AppShell>
  );
}
