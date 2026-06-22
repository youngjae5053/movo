import { AppShell } from "@/components/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell title="개인정보처리방침" showBackButton backFallback="/login">
      <article className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-300">
        <p className="text-muted">시행일: 2026년 6월 14일</p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">1. 수집 항목</h2>
        <p>이름, 이메일, 연락처, 나이, 운동 목표, 운동 기록, 채팅 내용, 사진·영상</p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">2. 이용 목적</h2>
        <p>PT 회원 관리, 운동 기록 제공, 예약·채팅 서비스 운영</p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">3. 보관 기간</h2>
        <p>
          회원 관계 종료 후 3년간 보관하며, 관련 법령에 따라 일부 정보는 추가
          보관될 수 있습니다.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-foreground">4. 이용자 권리</h2>
        <p>
          설정 화면에서 데이터보내기·삭제 요청이 가능합니다. 문의:
          privacy@movo.app
        </p>
      </article>
    </AppShell>
  );
}
