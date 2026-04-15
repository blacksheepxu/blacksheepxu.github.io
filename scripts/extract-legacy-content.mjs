import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseLegacyEntries, toFrontmatter } from "../src/lib/content/extract-legacy.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceFile = path.join(root, "legacy-source", "search.xml");
const outputDir = path.join(root, "src", "content", "posts", "legacy");

async function main() {
  const xml = await fs.readFile(sourceFile, "utf8");
  const entries = parseLegacyEntries(xml);

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all(
    entries.map(async (entry, index) => {
      const filename = `${entry.pubDate}-${String(index + 1).padStart(3, "0")}.md`;
      const content = `${toFrontmatter(entry)}${entry.body}\n`;
      await fs.writeFile(path.join(outputDir, filename), content, "utf8");
    })
  );

  console.log(`Generated ${entries.length} legacy post files in src/content/posts/legacy.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
