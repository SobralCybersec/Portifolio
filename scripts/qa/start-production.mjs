import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const standaloneRoot = resolve(root, '.next/standalone');
const standaloneStatic = resolve(standaloneRoot, '.next/static');
const buildStatic = resolve(root, '.next/static');
const buildPublic = resolve(root, 'public');
const standalonePublic = resolve(standaloneRoot, 'public');

if (existsSync(buildStatic)) {
  mkdirSync(resolve(standaloneRoot, '.next'), { recursive: true });
  cpSync(buildStatic, standaloneStatic, { recursive: true, force: true });
}

if (existsSync(buildPublic)) {
  cpSync(buildPublic, standalonePublic, { recursive: true, force: true });
}

await import(pathToFileURL(resolve(standaloneRoot, 'server.js')).href);
