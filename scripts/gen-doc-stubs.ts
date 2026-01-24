import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ModuleInfo = {
  namespace: string;
  endpoints: string[];
  definitionFile: string;
};

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walk(full);
      continue;
    }
    if (ent.isFile() && ent.name === 'definition.ts') {
      yield full;
    }
  }
}

function parseDefinitionTs(content: string, definitionFile: string): ModuleInfo | null {
  const nsMatch = content.match(/namespace\s*:\s*['"`]([^'"`]+)['"`]/);
  const namespace = nsMatch?.[1];
  if (!namespace) return null;

  const endpoints = Array.from(content.matchAll(/name\s*:\s*['"`]([^'"`]+)['"`]/g))
    .map(m => m[1])
    .filter(Boolean);

  // 去重
  const uniq = Array.from(new Set(endpoints));
  if (uniq.length === 0) return null;

  return { namespace, endpoints: uniq, definitionFile };
}

function makeDocStub(namespace: string, endpoint: string) {
  return `# ${namespace}.${endpoint}\n\n## 描述\n\nTODO\n\n## 输入\n\nTODO\n\n## 输出\n\nTODO\n`;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = path.resolve(__dirname, '..');

  const apisDir = path.join(root, 'src', 'apis');
  const docsDir = path.join(root, 'docs');

  if (!(await fileExists(apisDir))) {
    throw new Error(`src/apis not found: ${apisDir}`);
  }

  const modules: ModuleInfo[] = [];
  for await (const defFile of walk(apisDir)) {
    const content = await fs.readFile(defFile, 'utf8');
    const info = parseDefinitionTs(content, defFile);
    if (info) modules.push(info);
  }

  if (modules.length === 0) {
    console.log('[gen-doc-stubs] No modules found.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const mod of modules) {
    for (const ep of mod.endpoints) {
      const outDir = path.join(docsDir, mod.namespace);
      const outFile = path.join(outDir, `${ep}.md`);

      await fs.mkdir(outDir, { recursive: true });

      if (await fileExists(outFile)) {
        skipped++;
        continue;
      }

      await fs.writeFile(outFile, makeDocStub(mod.namespace, ep), 'utf8');
      created++;
    }
  }

  console.log(`[gen-doc-stubs] Done. created=${created}, skipped=${skipped}`);
}

main().catch((e) => {
  console.error('[gen-doc-stubs] Failed:', e);
  process.exitCode = 1;
});
