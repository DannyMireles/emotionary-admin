import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseConfigStatus, listWords } from "@/lib/supabase-admin";
import type { Word } from "@/lib/types";

export default async function Home() {
  await requireAdmin();

  const supabaseStatus = getSupabaseConfigStatus();
  let words: Word[] = [];
  let loadError: string | null = null;

  try {
    words = await listWords();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load words.";
  }

  return (
    <AdminShell
      words={words}
      loadError={loadError}
      supabaseConfigured={supabaseStatus.hasServiceRoleKey}
    />
  );
}
