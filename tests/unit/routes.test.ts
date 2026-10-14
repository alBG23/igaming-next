import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const SRC_APP_DIR = path.resolve(__dirname, '../../src/app');

function getFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

test('Route Rules - API routes declare dynamic = force-dynamic', () => {
  const allFiles = getFilesRecursively(SRC_APP_DIR);
  const apiRoutes = allFiles.filter(f => f.includes('/api/') && (f.endsWith('/route.ts') || f.endsWith('/route.js')));

  assert.ok(apiRoutes.length > 0, 'Should find API routes in src/app/api');

  const missingForceDynamic: string[] = [];
  for (const routeFile of apiRoutes) {
    const content = fs.readFileSync(routeFile, 'utf8');
    // Check for dynamic export
    if (!content.includes("export const dynamic = 'force-dynamic'") && !content.includes('export const dynamic = "force-dynamic"')) {
      missingForceDynamic.push(path.relative(SRC_APP_DIR, routeFile));
    }
  }

  assert.deepStrictEqual(
    missingForceDynamic,
    [],
    `The following API routes are missing export const dynamic = 'force-dynamic': ${missingForceDynamic.join(', ')}`
  );
});

test('Route Rules - All page routes have default export', () => {
  const allFiles = getFilesRecursively(SRC_APP_DIR);
  const pageFiles = allFiles.filter(f => f.endsWith('/page.tsx') || f.endsWith('/page.jsx'));

  assert.ok(pageFiles.length > 0, 'Should find page.tsx files');

  const missingDefaultExport: string[] = [];
  for (const pageFile of pageFiles) {
    const content = fs.readFileSync(pageFile, 'utf8');
    if (!content.includes('export default')) {
      missingDefaultExport.push(path.relative(SRC_APP_DIR, pageFile));
    }
  }

  assert.deepStrictEqual(
    missingDefaultExport,
    [],
    `The following pages are missing default export: ${missingDefaultExport.join(', ')}`
  );
});
