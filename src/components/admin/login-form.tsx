"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import { loginAction } from "@/app/actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  ok: false,
  message: "",
};

type LoginFormProps = {
  config: {
    hasPassword: boolean;
    hasSessionSecret: boolean;
  };
};

export function LoginForm({ config }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const isConfigured = config.hasPassword && config.hasSessionSecret;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
            <LockKeyhole aria-hidden="true" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">
              Emotionary Admin
            </h1>
            <p className="text-sm text-slate-500">Word database access</p>
          </div>
        </div>

        {!isConfigured ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            Missing admin environment variables.
          </div>
        ) : null}

        <form action={formAction} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!isConfigured || isPending}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {state.message ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!isConfigured || isPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
