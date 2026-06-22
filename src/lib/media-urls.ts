import type { SupabaseBrowserClient } from "@/lib/supabase";
import { WORKOUT_MEDIA_BUCKET } from "./storage";
import type { WorkoutMedia } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function createSignedMediaUrl(
  supabase: SupabaseBrowserClient,
  storagePath: string,
) {
  const { data, error } = await supabase.storage
    .from(WORKOUT_MEDIA_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("미디어 URL을 생성하지 못했습니다.");
  }

  return data.signedUrl;
}

export async function attachSignedUrlsToMedia(
  supabase: SupabaseBrowserClient,
  media: WorkoutMedia[],
): Promise<WorkoutMedia[]> {
  return Promise.all(
    media.map(async (item) => ({
      ...item,
      url: await createSignedMediaUrl(supabase, item.storagePath),
    })),
  );
}

export async function attachSignedUrlsToRecords<
  T extends { media?: WorkoutMedia[] },
>(supabase: SupabaseBrowserClient, records: T[]): Promise<T[]> {
  return Promise.all(
    records.map(async (record) => {
      if (!record.media?.length) {
        return record;
      }

      return {
        ...record,
        media: await attachSignedUrlsToMedia(supabase, record.media),
      };
    }),
  );
}
