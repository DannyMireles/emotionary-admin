"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  assertAdminSession,
  clearAdminSession,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";
import { setWordPublished, upsertWord } from "@/lib/supabase-admin";
import type { ActionState } from "@/lib/types";
import { formDataToWordInput } from "@/lib/word-schema";

const defaultState: ActionState = {
  ok: false,
  message: "",
};

function formatError(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: error.flatten().fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: false,
    message: "Something went wrong.",
  };
}

export async function loginAction(
  previousState: ActionState = defaultState,
  formData: FormData,
): Promise<ActionState> {
  void previousState;

  try {
    const password = String(formData.get("password") ?? "");

    if (!verifyAdminPassword(password)) {
      return {
        ok: false,
        message: "Password is incorrect.",
      };
    }

    await createAdminSession();
  } catch (error) {
    return formatError(error);
  }

  redirect("/");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function saveWordAction(
  previousState: ActionState = defaultState,
  formData: FormData,
): Promise<ActionState> {
  void previousState;

  try {
    await assertAdminSession();
    const input = formDataToWordInput(formData);
    const word = await upsertWord(input);

    revalidatePath("/");

    return {
      ok: true,
      message: input.published
        ? `${word.word} is published.`
        : `${word.word} is saved as a draft.`,
    };
  } catch (error) {
    return formatError(error);
  }
}

export async function togglePublishedAction(
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdminSession();
    const id = z.string().uuid().parse(String(formData.get("id") ?? ""));
    const published = String(formData.get("published") ?? "") === "true";
    const word = await setWordPublished(id, published);

    revalidatePath("/");

    return {
      ok: true,
      message: published
        ? `${word.word} is published.`
        : `${word.word} is unpublished.`,
    };
  } catch (error) {
    return formatError(error);
  }
}
