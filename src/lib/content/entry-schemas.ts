import { z } from "zod";

export const researchEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  focus: z.string(),
  status: z.enum(["active", "seed", "archive"]).default("active"),
  relatedPosts: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(100),
  updatedAt: z.coerce.date().optional()
});

export const labEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  kind: z.enum(["stats", "demo", "tool"]).default("demo"),
  status: z.enum(["ready", "prototype", "planned"]).default("prototype"),
  featured: z.boolean().default(false),
  order: z.number().int().default(100),
  updatedAt: z.coerce.date().optional()
});

export const projectEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  projectId: z.string(),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  startedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  sourceRepos: z.array(z.string()).default([]),
  relatedResearch: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false)
});
