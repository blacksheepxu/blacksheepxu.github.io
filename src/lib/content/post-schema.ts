import { z } from "zod";

export const postSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    legacyUrl: z.string().optional(),
    legacySlug: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    source: z.enum(["legacy", "native"]).default("native"),
    featured: z.boolean().default(false),
    topic: z.string().optional()
  })
  .superRefine((data, context) => {
    if (data.source === "legacy" && !data.legacyUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["legacyUrl"],
        message: "legacy posts must define a legacyUrl"
      });
    }

    if (data.source === "legacy" && !data.legacySlug) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["legacySlug"],
        message: "legacy posts must define a legacySlug"
      });
    }
  });
