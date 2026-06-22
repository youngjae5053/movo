import { AppShell } from "@/components/AppShell";

export default function TermsPage() {
  return (
    <AppShell title="이용약관" showBackButton backFallback="/login">
      <article className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-300">
        <p className="text-muted">시행일: 2026년 6월 14일</p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">1. 서비스</h2>
        <p>
          Movo는 트레이너와 회원이 운동 기록, 예약, 채팅을 관리할 수 있는
          서비스입니다.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">2. 계정</h2>
        <p>
          트레이너와 회원은 각각 별도 계정으로 로그인하며, 계정 공유는
          금지됩니다.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">3. 책임</h2>
        <p>
          운동 프로그램 및 건강 관련 판단의 최종 책임은 트레이너와 회원에게
          있습니다.
        </p>
      </article>
    </AppShell>
  );
}
