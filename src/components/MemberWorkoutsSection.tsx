"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkoutRecordCard } from "@/components/WorkoutRecordCard";
import { fetchMemberWorkoutRecords } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { WorkoutRecord } from "@/lib/types";

export function MemberWorkoutsSection() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchMemberWorkoutRecords(supabase);
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>;
  }

  return (
    <>
      <section className="mb-5">
        <h1 className="text-2xl font-bold">운동 기록</h1>
        <p className="mt-1 text-sm text-muted">트레이너가 남긴 수업 기록입니다</p>
      </section>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
          아직 기록이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4">
          {records.map((record) => (
            <li key={record.id}>
              <WorkoutRecordCard
                record={record}
                onEdit={() => undefined}
                onDelete={() => undefined}
                readOnly
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
