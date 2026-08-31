import { createReadStream } from "node:fs";
import { open, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_IGNORED_DIRECTORIES,
  DEFAULT_IGNORED_FILES,
  DEFAULT_REPO_ROOT,
  HARD_LIMIT,
  REVIEW_LIMIT,
  ROOTS,
  SOURCE_EXTENSIONS,
  SOURCE_FILENAMES,
} from "./file-size-policy.mjs";
export {
  DEFAULT_IGNORED_DIRECTORIES,
  DEFAULT_IGNORED_FILES,
  DEFAULT_REPO_ROOT,
  HARD_LIMIT,
  REVIEW_LIMIT,
  ROOTS,
  SOURCE_EXTENSIONS,
  SOURCE_FILENAMES,
} from "./file-size-policy.mjs";
const SHEBANG_LANGUAGE = /\b(?:bash|bun|dash|deno|elixir|fish|groovy|julia|kotlin|ksh|lua|node|nodejs|perl|php|python(?:2|3)?|raku|ruby|Rscript|sh|swift|tclsh|wish|zsh)\b/i;

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function extensionSet(extraExtensions = []) {
  const extensions = new Set(SOURCE_EXTENSIONS);
  for (const extension of extraExtensions) {
    const normalized = extension.startsWith(".") ? extension : `.${extension}`;
    extensions.add(normalized);
  }
  return extensions;
}

async function hasSourceShebang(file) {
  let handle;
  try {
    handle = await open(file, "r");
    const buffer = Buffer.alloc(256);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead < 2 || buffer[0] !== 0x23 || buffer[1] !== 0x21) return false;
    return SHEBANG_LANGUAGE.test(buffer.subarray(0, bytesRead).toString("utf8"));
  } finally {
    await handle?.close();
  }
}

export async function isSourceFile(
  file,
  { extensions = SOURCE_EXTENSIONS, filenames = SOURCE_FILENAMES } = {},
) {
  const basename = path.basename(file);
  if (filenames.has(basename)) return true;
  const extension = path.extname(basename);
  if (extensions.has(extension) || extensions.has(extension.toLowerCase())) return true;
  if (!extension) return hasSourceShebang(file);
  return false;
}

export async function sourceFiles(
  root,
  {
    repoRoot = process.cwd(),
    extraExtensions = [],
    ignoredDirectories = DEFAULT_IGNORED_DIRECTORIES,
    ignoredFiles = DEFAULT_IGNORED_FILES,
    filenames = SOURCE_FILENAMES,
  } = {},
) {
  const absoluteRoot = path.resolve(repoRoot, root);
  const extensions = extensionSet(extraExtensions);
  const files = [];

  async function visit(absoluteDir) {
    let entries;
    try {
      entries = await readdir(absoluteDir, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }

    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolutePath = path.join(absoluteDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) await visit(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (ignoredFiles.has(entry.name)) continue;
      if (await isSourceFile(absolutePath, { extensions, filenames })) files.push(absolutePath);
    }
  }

  await visit(absoluteRoot);
  return files;
}

export async function countPhysicalLines(file) {
  return new Promise((resolveCount, reject) => {
    const stream = createReadStream(file);
    let bytes = 0;
    let breaks = 0;
    let pendingCarriageReturn = false;
    let lastByte = null;

    stream.on("data", (chunk) => {
      bytes += chunk.length;
      for (const byte of chunk) {
        if (pendingCarriageReturn) {
          if (byte === 0x0a) {
            breaks += 1;
            pendingCarriageReturn = false;
            lastByte = byte;
            continue;
          }
          breaks += 1;
          pendingCarriageReturn = false;
        }
        if (byte === 0x0d) pendingCarriageReturn = true;
        else if (byte === 0x0a) breaks += 1;
        lastByte = byte;
      }
    });
    stream.on("error", reject);
    stream.on("end", () => {
      if (pendingCarriageReturn) breaks += 1;
      if (bytes === 0) return resolveCount(0);
      const endsWithTerminator = lastByte === 0x0a || lastByte === 0x0d;
      resolveCount(breaks + (endsWithTerminator ? 0 : 1));
    });
  });
}

export async function checkFileSizes({
  repoRoot = DEFAULT_REPO_ROOT,
  roots = ROOTS,
  hardLimit = HARD_LIMIT,
  reviewLimit = REVIEW_LIMIT,
  extraExtensions = [],
  ignoredDirectories = DEFAULT_IGNORED_DIRECTORIES,
  ignoredFiles = DEFAULT_IGNORED_FILES,
} = {}) {
  if (!Number.isInteger(reviewLimit) || reviewLimit < 1) {
    throw new Error("reviewLimit must be a positive integer");
  }
  if (!Number.isInteger(hardLimit) || hardLimit < reviewLimit) {
    throw new Error("hardLimit must be an integer >= reviewLimit");
  }

  const discovered = (
    await Promise.all(
      roots.map((root) =>
        sourceFiles(root, { repoRoot, extraExtensions, ignoredDirectories, ignoredFiles }),
      ),
    )
  ).flat();
  const unique = [...new Set(discovered.map((file) => path.resolve(file)))].sort();
  const results = await Promise.all(
    unique.map(async (file) => ({
      file: normalizePath(path.relative(repoRoot, file) || path.basename(file)),
      lines: await countPhysicalLines(file),
    })),
  );

  return {
    files: results,
    review: results.filter(({ lines }) => lines > reviewLimit && lines <= hardLimit),
    oversized: results.filter(({ lines }) => lines > hardLimit),
  };
}

export function formatFileSizeReport(
  result,
  { hardLimit = HARD_LIMIT, reviewLimit = REVIEW_LIMIT } = {},
) {
  const lines = [
    `file-size policy: review > ${reviewLimit} lines; fail > ${hardLimit} lines`,
    ...result.review.map(({ file, lines: count }) => `review: ${file} (${count} lines)`),
    ...result.oversized.map(
      ({ file, lines: count }) => `error: ${file} has ${count} lines (limit ${hardLimit})`,
    ),
  ];
  if (result.oversized.length === 0) {
    lines.push(`file-size gate passed: ${result.files.length} source files <= ${hardLimit} lines`);
  }
  return lines.join("\n");
}

export async function main() {
  const result = await checkFileSizes({ repoRoot: DEFAULT_REPO_ROOT });
  const report = formatFileSizeReport(result);
  (result.oversized.length ? console.error : console.log)(report);
  return result.oversized.length ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
