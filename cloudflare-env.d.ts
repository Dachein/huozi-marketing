/// <reference types="@cloudflare/workers-types/2023-07-01" />

// Ambient declarations for the Cloudflare Worker env this app deploys onto.
// Picked up by the OpenNext `getCloudflareContext()` typings.

declare global {
  interface CloudflareEnv {
    /** Dynamic blog posts written via /blog/admin. Read by /blog. */
    BLOG_POSTS?: KVNamespace;
    /** Shared secret that gates the /blog/admin server actions. */
    BLOG_ADMIN_TOKEN?: string;
  }
}

export {};
