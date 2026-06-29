-- =====================================================
-- Movo Feature Additions Migration
-- 회차/결제, 체성분, 출석, 템플릿
-- =====================================================

-- 1. schedules: 출석 체크 컬럼 추가
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ;

-- 2. 세션 패키지 (PT 회차 + 결제 기록)
CREATE TABLE IF NOT EXISTS session_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  trainer_id UUID NOT NULL REFERENCES trainers(id),
  total_sessions INT NOT NULL,
  remaining_sessions INT NOT NULL,
  price INT,                        -- 총 결제 금액 (원)
  payment_method TEXT,              -- 'card' | 'cash' | 'transfer'
  paid_at TIMESTAMPTZ,
  note TEXT,
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE session_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_owns_packages" ON session_packages
  FOR ALL
  USING (trainer_id = (SELECT current_trainer_id()))
  WITH CHECK (trainer_id = (SELECT current_trainer_id()));

CREATE POLICY "member_reads_own_packages" ON session_packages
  FOR SELECT
  USING (member_id = (SELECT current_member_id()));

-- 3. 체성분 기록
CREATE TABLE IF NOT EXISTS body_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  trainer_id UUID NOT NULL REFERENCES trainers(id),
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,1),              -- kg
  muscle_mass DECIMAL(5,1),         -- kg
  body_fat_percent DECIMAL(4,1),    -- %
  bmi DECIMAL(4,1),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE body_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_owns_body_records" ON body_records
  FOR ALL
  USING (trainer_id = (SELECT current_trainer_id()))
  WITH CHECK (trainer_id = (SELECT current_trainer_id()));

CREATE POLICY "member_reads_own_body_records" ON body_records
  FOR SELECT
  USING (member_id = (SELECT current_member_id()));

-- 4. 운동 기록 템플릿
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id),
  name TEXT NOT NULL,
  body_parts TEXT[],
  duration INT,
  content TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_owns_templates" ON workout_templates
  FOR ALL
  USING (trainer_id = (SELECT current_trainer_id()))
  WITH CHECK (trainer_id = (SELECT current_trainer_id()));

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_session_packages_member ON session_packages(member_id);
CREATE INDEX IF NOT EXISTS idx_session_packages_trainer ON session_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_body_records_member ON body_records(member_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_templates_trainer ON workout_templates(trainer_id, sort_order);

-- 6. 세션 차감 함수 (출석 처리 시 잔여 횟수 자동 차감)
CREATE OR REPLACE FUNCTION deduct_session_on_attend(p_schedule_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
  v_trainer_id UUID;
  v_package_id UUID;
BEGIN
  SELECT member_id, trainer_id INTO v_member_id, v_trainer_id
  FROM schedules WHERE id = p_schedule_id;

  UPDATE schedules SET attended_at = NOW() WHERE id = p_schedule_id;

  SELECT id INTO v_package_id
  FROM session_packages
  WHERE member_id = v_member_id
    AND trainer_id = v_trainer_id
    AND remaining_sessions > 0
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_package_id IS NOT NULL THEN
    UPDATE session_packages
    SET remaining_sessions = remaining_sessions - 1,
        updated_at = NOW()
    WHERE id = v_package_id;
  END IF;
END;
$$;
