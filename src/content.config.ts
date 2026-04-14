import { defineCollection, z } from "astro:content";
import { postSchema } from "./lib/content/post-schema";

const posts = defineCollection({
  schema: postSchema
});

const research = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    focus: z.string(),
    status: z.enum(["active", "seed", "archive"]).default("active"),
    relatedPosts: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().int().default(100)
  })
});

const lab = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(["stats", "demo", "tool"]).default("demo"),
    status: z.enum(["ready", "prototype", "planned"]).default("prototype"),
    featured: z.boolean().default(false),
    order: z.number().int().default(100)
  })
});

const site = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string()
  })
});

export const collections = {
  posts,
  research,
  lab,
  site
};
