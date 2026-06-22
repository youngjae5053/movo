import type { SupabaseBrowserClient } from "@/lib/supabase";

export const WORKOUT_MEDIA_BUCKET = "workout-media";

export function getWorkoutMediaPublicUrl(
  supabase: SupabaseBrowserClient,
  storagePath: string,
) {
  const { data } = supabase.storage
    .from(WORKOUT_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export function buildWorkoutMediaPath(
  trainerId: string,
  memberId: string,
  recordId: string,
  fileName: string,
) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase()
    : "bin";

  return `${trainerId}/${memberId}/${recordId}/${crypto.randomUUID()}.${extension}`;
}

export function getMediaTypeFromFile(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}
