"use client";

import { useActionState } from "react";
import { addPostAction, deletePostAction, type ActionResult } from "./actions";

const empty: ActionResult = { ok: true };

export function AddPostForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, fd) => addPostAction(fd),
    empty,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Admin token" name="token" type="password" required />
      <Field
        label="Slug"
        name="slug"
        required
        placeholder="my-new-post"
        hint="lowercase letters, digits, hyphens"
      />
      <Field label="Date" name="date" required placeholder="2026-05-06" />
      <Field
        label="huozi share URL"
        name="url"
        required
        placeholder="https://cloud.huozi.app/p/<slug>"
      />
      <Field label="Title" name="title" required />
      <TextArea label="Excerpt" name="excerpt" required rows={3} />
      <Field label="Title (secondary, optional)" name="titleSecondary" />
      <TextArea
        label="Excerpt (secondary, optional)"
        name="excerptSecondary"
        rows={2}
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-full border border-border bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Add post"}
        </button>
        {state && !state.ok && (
          <span className="text-sm text-red-500">{state.error}</span>
        )}
        {state && state.ok && !pending && (
          <span className="text-sm text-emerald-500">Saved.</span>
        )}
      </div>
    </form>
  );
}

export function DeletePostForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, fd) => deletePostAction(fd),
    empty,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="password"
        name="token"
        placeholder="token"
        className="rounded border border-border bg-background px-2 py-1 text-xs w-28"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-500 hover:underline disabled:opacity-40"
      >
        {pending ? "…" : "delete"}
      </button>
      {state && !state.ok && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-serif">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
      />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function TextArea({
  label,
  name,
  required,
  rows = 3,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-serif">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-foreground/40 resize-y"
      />
    </label>
  );
}
