# Movo

트레이너·회원 양방향 PT 관리 앱 (Next.js 16 + Supabase)

## 기능

- **트레이너**: 회원 관리, 운동 기록(사진/영상), 채팅, 예약
- **회원**: 운동 기록 열람, 채팅, 예약 확인
- Supabase Auth, RLS, Storage(signed URL), Realtime 채팅

## 로컬 실행

```bash
cp env.local.template .env.local
# .env.local 에 Supabase URL/키 입력
npm install
npm run dev
```

## Supabase 마이그레이션 (순서대로 SQL Editor에서 실행)

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_workout_media.sql`
3. `supabase/migrations/003_production_foundation.sql`
4. `supabase/migrations/004_storage_private.sql`

## Supabase 추가 설정

- **Authentication → URL Configuration**: Site URL + Redirect URLs에 앱 도메인 등록
- **Database → Replication**: `messages` 테이블 Realtime 활성화
- **Storage**: `workout-media` 버킷이 private인지 확인

## 역할 / 라우트

| 역할 | 경로 |
|------|------|
| 트레이너 | `/`, `/schedule`, `/chats`, `/members/[id]`, `/settings` |
| 회원 | `/member`, `/member/workouts`, `/member/chat`, `/member/schedule` |
| 공개 | `/login`, `/signup`, `/privacy`, `/terms`, `/invite/[token]` |

## 회원 앱 초대

1. 트레이너가 회원 상세 → **링크 생성**
2. 회원이 `/invite/[token]`에서 가입
3. 회원 앱(`/member`) 로그인

## 배포

- Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 설정
- GitHub Actions CI: lint + build

## 데이터 보관 (PIPA)

- 개인정보 동의 시각 DB 저장
- 설정에서 데이터보내기/삭제 요청
- soft delete: `members`, `workout_records`, `schedules`

## 아직 수동 설정 필요

- Stripe 결제 연동 (`session_packages`, `payments` 테이블만 준비됨)
- Sentry 등 에러 모니터링 (선택)
- Supabase 스테이징 프로젝트 분리 (권장)
