import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-emerald-400">404</p>
      <h1 className="mt-4 text-xl font-semibold">회원을 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-muted">
        요청하신 회원 정보가 존재하지 않습니다.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
      >
        회원 목록으로
      </Link>
    </div>
  );
}
