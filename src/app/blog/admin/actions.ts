"use server";

import { revalidatePath } from "next/cache";
import {
  deleteDynamicPost,
  getAdminToken,
  putDynamicPost,
  validateDate,
  validateSlug,
  validateUrl,
  type DynamicPost,
} from "@/lib/blog/store";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function checkToken(token: string): Promise<string | null> {
  const expected = await getAdminToken();
  if (!expected) return "BLOG_ADMIN_TOKEN is not configured on this deployment.";
  if (token !== expected) return "Wrong admin token.";
  return null;
}

export async function addPostAction(formData: FormData): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "");
  const tokenErr = await checkToken(token);
  if (tokenErr) return { ok: false, error: tokenErr };

  const slug = String(formData.get("slug") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const titleSecondary = String(formData.get("titleSecondary") ?? "").trim();
  const excerptSecondary = String(formData.get("excerptSecondary") ?? "").trim();

  for (const [name, err] of [
    ["slug", validateSlug(slug)],
    ["date", validateDate(date)],
    ["url", validateUrl(url)],
  ] as const) {
    if (err) return { ok: false, error: `${name}: ${err}` };
  }
  if (!title) return { ok: false, error: "title is required." };
  if (!excerpt) return { ok: false, error: "excerpt is required." };

  const post: DynamicPost = {
    slug,
    date,
    url,
    title,
    excerpt,
    ...(titleSecondary ? { titleSecondary } : {}),
    ...(excerptSecondary ? { excerptSecondary } : {}),
    createdAt: Date.now(),
  };

  await putDynamicPost(post);
  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "");
  const tokenErr = await checkToken(token);
  if (tokenErr) return { ok: false, error: tokenErr };

  const slug = String(formData.get("slug") ?? "").trim();
  if (validateSlug(slug)) return { ok: false, error: "Bad slug." };

  await deleteDynamicPost(slug);
  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  return { ok: true };
}
