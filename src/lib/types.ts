export const WORD_TYPES = [
  "wanderword",
  "hidden_english",
  "psychology",
] as const;

export type WordType = (typeof WORD_TYPES)[number];

export type Word = {
  id: string;
  slug: string;
  word: string;
  pronunciation: string;
  language: string;
  type: WordType;
  level: number;
  definition: string;
  wisdom: string;
  is_free: boolean;
  published: boolean;
  published_at: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WordFormInput = {
  id?: string;
  slug: string;
  word: string;
  pronunciation: string;
  language: string;
  type: WordType;
  level: number;
  definition: string;
  wisdom: string;
  is_free: boolean;
  published: boolean;
  audio_url: string | null;
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
