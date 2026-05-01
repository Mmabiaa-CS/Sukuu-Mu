import { promises as fs } from 'node:fs';
import path from 'node:path';

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDeterministicManifest(nextDir) {
  const routesManifest = path.join(nextDir, 'routes-manifest.json');
  const deterministicManifest = path.join(nextDir, 'routes-manifest-deterministic.json');

  const hasRoutesManifest = await exists(routesManifest);
  const hasDeterministicManifest = await exists(deterministicManifest);

  if (hasRoutesManifest && !hasDeterministicManifest) {
    await fs.copyFile(routesManifest, deterministicManifest);
    console.log('Created .next/routes-manifest-deterministic.json');
  }
}

async function main() {
  const nextDir = path.resolve(process.cwd(), '.next');
  const hasNextDir = await exists(nextDir);

  if (!hasNextDir) {
    console.warn('No .next directory found after build; skipping postbuild fixes.');
    return;
  }

  await ensureDeterministicManifest(nextDir);
}

main().catch((error) => {
  console.error('vercel-postbuild failed:', error);
  process.exit(1);
});
