import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

function isYearDirectory(name) {
  return /^\d{4}$/.test(name);
}

function shouldCopyAsset(filename) {
  return path.extname(filename).toLowerCase() !== ".html";
}

async function copyAssetTree(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  await fs.mkdir(targetDir, { recursive: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await copyAssetTree(sourcePath, targetPath);
        return;
      }

      if (entry.isFile() && shouldCopyAsset(entry.name)) {
        await fs.copyFile(sourcePath, targetPath);
      }
    })
  );
}

async function main() {
  const rootEntries = await fs.readdir(root, { withFileTypes: true });
  const yearDirectories = rootEntries.filter((entry) => entry.isDirectory() && isYearDirectory(entry.name));

  await Promise.all(
    yearDirectories.map(async (entry) => {
      const targetDir = path.join(publicDir, entry.name);
      await fs.rm(targetDir, { recursive: true, force: true });
      await copyAssetTree(path.join(root, entry.name), targetDir);
    })
  );

  console.log(`Synced legacy static assets for ${yearDirectories.length} year directories.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
