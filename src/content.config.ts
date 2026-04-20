import { defineCollection, z } from "astro:content";
import { postSchema } from "./lib/content/post-schema";
import { labEntrySchema, projectEntrySchema, researchEntrySchema } from "./lib/content/entry-schemas";

const posts = defineCollection({
  schema: postSchema
});

const research = defineCollection({
  schema: researchEntrySchema
});

const lab = defineCollection({
  schema: labEntrySchema
});

const projects = defineCollection({
  schema: projectEntrySchema
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
  projects,
  site
};
