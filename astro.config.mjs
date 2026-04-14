import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";

export default defineConfig({
  output: "static",
  site: "https://blacksheepxu.github.io",
  integrations: [mdx(), preact()]
});

