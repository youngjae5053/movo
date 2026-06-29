"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function useScheduleRealtime(onInsert: () => void) {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel("schedules-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "schedules" },
        onInsert,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert]);
}
