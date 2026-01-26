import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yauzl from 'yauzl';

export const info = {
    id: 'server-plugin-manager',
    name: 'Server Plugin Manager',
    description: 'Manage SillyTavern server plugins (install/uninstall/list/get) and restart server.',
};

/**
 * @param {unknown} value
 * @returns {string}
 */
function asTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function asBool(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const s = value.trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(s)) return true;
        if (['0', 'false', 'no', 'off'].includes(s)) return false;
    }
    return fallback;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function asFiniteNumber(value) {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {string[]} keys
 */
function pickEnv(env, keys) {
    /** @type {Record<string, string>} */
    const out = {};
    for (const k of keys) {
        const v = env[k];
        if (typeof v === 'string') out[k] = v;
    }
    return out;
}

const DEFAULT_ENV_KEYS = [
    'PATH',
    'PATHEXT',
    'SHELL',
    'NODE_ENV',
    'SILLYTAVERN_ENABLESERVERPLUGINS',
];

/**
 * Spawns a process and captures stdout/stderr.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {{
 *   cwd?: string,
 *   env?: Record<string, string>,
 *   stdin?: string,
 *   timeoutMs?: number,
 * }} options
 * @returns {Promise<{
 *   ok: boolean,
 *   exitCode: number | null,
 *   signal: NodeJS.Signals | string | null,
 *   stdout: string,
 *   stderr: string,
 *   timedOut: boolean,
 *   durationMs: number,
 *   error?: string,
 * }>}
 */
function spawnAndCapture(command, args, options = {}) {
    return new Promise((resolve) => {
        const start = Date.now();
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        /** @type {string | undefined} */
        let errorMessage;
        /** @type {number | null} */
        let exitCode = null;
        /** @type {NodeJS.Signals | string | null} */
        let signal = null;
        let settled = false;

        /** @param {any} result */
        const settle = (result) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        /** @type {import('node:child_process').ChildProcessWithoutNullStreams} */
        let child;
        try {
            child = spawn(command, args, {
                cwd: options.cwd || undefined,
                env: options.env || process.env,
                shell: false,
                windowsHide: true,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            settle({
                ok: false,
                exitCode: null,
                signal: null,
                stdout: '',
                stderr: '',
                timedOut: false,
                durationMs: Date.now() - start,
                error: msg,
            });
            return;
        }

        if (typeof options.stdin === 'string') {
            try {
                child.stdin.write(options.stdin);
                child.stdin.end();
            } catch {
                // ignore
            }
        }

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });

        /** @type {NodeJS.Timeout | undefined} */
        let timeout;
        const timeoutMs = Number(options.timeoutMs);
        if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
            timeout = setTimeout(() => {
                timedOut = true;
                try {
                    child.kill('SIGTERM');
                } catch {
                    // ignore
                }
                setTimeout(() => {
                    try {
                        child.kill('SIGKILL');
                    } catch {
                        // ignore
                    }
                }, 1000);
            }, timeoutMs);
        }

        child.on('error', (e) => {
            errorMessage = e instanceof Error ? e.message : String(e);
            settle({
                ok: false,
                exitCode: null,
                signal: null,
                stdout,
                stderr,
                timedOut,
                durationMs: Date.now() - start,
                error: errorMessage,
            });
        });

        child.on('close', (code, sig) => {
            if (timeout) clearTimeout(timeout);
            exitCode = typeof code === 'number' ? code : null;
            signal = sig ?? null;
            const ok = exitCode === 0 && !timedOut;
            settle({
                ok,
                exitCode,
                signal,
                stdout,
                stderr,
                timedOut,
                durationMs: Date.now() - start,
                ...(errorMessage ? { error: errorMessage } : {}),
            });
        });
    });
}

function getPluginsRootDir() {
    // This plugin lives in: <SillyTavern>/plugins/server-plugin-manager/index.mjs
    // plugins root is its parent directory.
    const selfDir = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(selfDir, '..');
}

function isSafeEntryName(name) {
    if (!name) return false;
    if (name.includes('..')) return false;
    if (name.includes('/') || name.includes('\\')) return false;
    if (name.startsWith('.')) return false;
    return true;
}

/**
 * @param {unknown} base64
 * @returns {Buffer}
 */
function decodeBase64ToBuffer(base64) {
    const raw = asTrimmedString(base64);
    if (!raw) throw new Error('zipBase64 is required');
    const clean = raw.includes(',') ? raw.split(',', 2)[1] : raw;
    return Buffer.from(clean, 'base64');
}

/**
 * @param {string} fileName
 */
function inferFolderNameFromFileName(fileName) {
    const base = path.basename(String(fileName || '')).trim();
    if (!base) return '';
    const noExt = base.toLowerCase().endsWith('.zip') ? base.slice(0, -4) : base;
    return noExt || '';
}

/**
 * Normalize zip entry name to posix-like.
 * @param {string} name
 */
function normalizeZipEntryName(name) {
    return String(name || '').replace(/\\/g, '/');
}

/**
 * Prevent zip-slip: ensure final path stays within baseDir.
 *
 * @param {string} baseDir Absolute base directory
 * @param {string} relPath Relative path inside zip
 */
function safeJoin(baseDir, relPath) {
    const clean = normalizeZipEntryName(relPath).replace(/^\/+/, '');
    const normalized = path.normalize(clean);
    const full = path.resolve(baseDir, normalized);
    const base = path.resolve(baseDir) + path.sep;
    if (!full.startsWith(base)) {
        throw new Error(`Zip entry path traversal blocked: ${relPath}`);
    }
    return full;
}

/**
 * Analyze zip to decide whether to strip a single top-level folder.
 * If all entries are under a single folder and there are no root-level files, strip it.
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>} prefix to strip, e.g. "myplugin/" or ""
 */
function detectStripPrefix(buffer) {
    return new Promise((resolve, reject) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
            if (err || !zipfile) return reject(err || new Error('Failed to open zip'));

            const tops = new Set();
            let hasRootFile = false;

            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                const name = normalizeZipEntryName(entry.fileName);
                if (!name || name.startsWith('__MACOSX/')) {
                    zipfile.readEntry();
                    return;
                }
                const parts = name.split('/').filter(Boolean);
                if (parts.length <= 1) {
                    // file or dir at root -> do not strip
                    if (!name.endsWith('/')) hasRootFile = true;
                } else {
                    tops.add(parts[0]);
                }
                zipfile.readEntry();
            });
            zipfile.on('end', () => {
                try {
                    zipfile.close();
                } catch {
                    // ignore
                }
                if (!hasRootFile && tops.size === 1) {
                    const [top] = Array.from(tops);
                    resolve(`${top}/`);
                } else {
                    resolve('');
                }
            });
            zipfile.on('error', (e) => {
                try {
                    zipfile.close();
                } catch {
                    // ignore
                }
                reject(e);
            });
        });
    });
}

/**
 * Extract zip buffer into targetDir.
 * @param {Buffer} buffer
 * @param {string} targetDir
 * @returns {Promise<{ extractedCount: number, stripPrefix: string }>}
 */
async function extractZip(buffer, targetDir) {
    const stripPrefix = await detectStripPrefix(buffer);
    const baseDir = path.resolve(targetDir);
    fs.mkdirSync(baseDir, { recursive: true });

    return await new Promise((resolve, reject) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
            if (err || !zipfile) return reject(err || new Error('Failed to open zip'));

            let extractedCount = 0;
            let done = false;

            const fail = (e) => {
                if (done) return;
                done = true;
                try {
                    zipfile.close();
                } catch {
                    // ignore
                }
                reject(e);
            };

            const next = () => {
                try {
                    zipfile.readEntry();
                } catch (e) {
                    fail(e);
                }
            };

            zipfile.on('entry', (entry) => {
                const rawName = normalizeZipEntryName(entry.fileName);

                // Skip OS metadata
                if (!rawName || rawName.startsWith('__MACOSX/')) return next();
                if (rawName.endsWith('/.DS_Store') || rawName.endsWith('/Thumbs.db') || rawName === '.DS_Store' || rawName === 'Thumbs.db') {
                    return next();
                }

                // Optionally strip a single top-level folder
                const name = stripPrefix && rawName.startsWith(stripPrefix) ? rawName.slice(stripPrefix.length) : rawName;
                if (!name) return next();

                // Directory entry
                if (name.endsWith('/')) {
                    try {
                        const dirPath = safeJoin(baseDir, name);
                        fs.mkdirSync(dirPath, { recursive: true });
                        return next();
                    } catch (e) {
                        return fail(e);
                    }
                }

                let destPath;
                try {
                    destPath = safeJoin(baseDir, name);
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                } catch (e) {
                    return fail(e);
                }

                zipfile.openReadStream(entry, (streamErr, readStream) => {
                    if (streamErr || !readStream) return fail(streamErr || new Error('Failed to open zip entry stream'));

                    const writeStream = fs.createWriteStream(destPath);
                    readStream.on('error', fail);
                    writeStream.on('error', fail);

                    writeStream.on('close', () => {
                        extractedCount++;
                        next();
                    });

                    readStream.pipe(writeStream);
                });
            });

            zipfile.on('end', () => {
                if (done) return;
                done = true;
                try {
                    zipfile.close();
                } catch {
                    // ignore
                }
                resolve({ extractedCount, stripPrefix });
            });

            zipfile.on('error', fail);

            next();
        });
    });
}

/**
 * Copy file or directory recursively.
 * @param {string} src
 * @param {string} dest
 */
function copyRecursiveSync(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const e of entries) {
            if (e.name === '.' || e.name === '..') continue;
            const s = path.join(src, e.name);
            const d = path.join(dest, e.name);
            if (e.isDirectory()) {
                copyRecursiveSync(s, d);
            } else if (e.isFile()) {
                fs.mkdirSync(path.dirname(d), { recursive: true });
                fs.copyFileSync(s, d);
            } else if (e.isSymbolicLink()) {
                // best-effort: dereference
                const real = fs.realpathSync(s);
                copyRecursiveSync(real, d);
            }
        }
        return;
    }
    if (stat.isFile()) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        return;
    }
    throw new Error('Unsupported source type');
}

/**
 * @param {string} dirPath
 */
function resolveDirectoryEntryFile(dirPath) {
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg && typeof pkg.main === 'string' && pkg.main.trim()) {
                const mainPath = path.join(dirPath, pkg.main);
                if (fs.existsSync(mainPath)) {
                    return { entryFile: mainPath, packageJson: { name: pkg.name, version: pkg.version, main: pkg.main } };
                }
                return { entryFile: mainPath, packageJson: { name: pkg.name, version: pkg.version, main: pkg.main }, entryMissing: true };
            }
            return { packageJson: { name: pkg?.name, version: pkg?.version, main: pkg?.main } };
        } catch {
            // ignore bad json
        }
    }

    for (const f of ['index.js', 'index.cjs', 'index.mjs']) {
        const p = path.join(dirPath, f);
        if (fs.existsSync(p)) return { entryFile: p };
    }

    return {};
}

/**
 * @param {string} entryFile
 */
async function tryReadPluginInfo(entryFile) {
    try {
        const mod = await import(pathToFileURL(entryFile).toString());
        const rawInfo = mod?.info || mod?.default?.info;
        if (rawInfo && typeof rawInfo === 'object') {
            return {
                info: {
                    id: String(rawInfo.id ?? ''),
                    name: String(rawInfo.name ?? ''),
                    description: String(rawInfo.description ?? ''),
                },
            };
        }
        return { info: null };
    } catch (e) {
        return { info: null, infoError: e instanceof Error ? e.message : String(e) };
    }
}

/**
 * @param {string} gitUrl
 */
function inferFolderNameFromGitUrl(gitUrl) {
    const base = path.basename(String(gitUrl).replace(/\/+$/, ''));
    return base.endsWith('.git') ? base.slice(0, -4) : base;
}

function getServerRootDir() {
    const argv1 = String(process.argv?.[1] ?? '').trim();
    const abs = argv1
        ? (path.isAbsolute(argv1) ? argv1 : path.resolve(process.cwd(), argv1))
        : process.cwd();
    return path.dirname(abs);
}

/**
 * @param {'exit'|'respawn'} mode
 * @param {number} delayMs
 */
function scheduleRestart(mode, delayMs) {
    const delay = Math.max(50, Math.min(60_000, Math.trunc(delayMs || 800)));

    // Best-effort respawn: spawn a tiny helper that waits, then starts a new server process.
    // This avoids port conflicts caused by starting the new server before the old one exits.
    if (mode === 'respawn') {
        try {
            const execPath = process.execPath;
            const argv = process.argv.slice(1);
            const cwd = process.cwd();

            // Windows: try to keep the same "Start.bat terminal" behavior by launching Start.bat in a new console window.
            const serverRoot = getServerRootDir();
            const startBat = path.join(serverRoot, 'Start.bat');
            const hasStartBat = process.platform === 'win32' && fs.existsSync(startBat);

            const helperCode = hasStartBat
                ? [
                    "const { spawn } = require('child_process');",
                    `const serverRoot = ${JSON.stringify(serverRoot)};`,
                    `const startBat = ${JSON.stringify(startBat)};`,
                    `const delay = ${JSON.stringify(delay)};`,
                    "setTimeout(() => {",
                    "  try {",
                    "    // Run Start.bat in a NEW console window (detached + no inherited stdio).",
                    "    // Start.bat itself keeps the window open (it ends with `pause`).",
                    "    const p = spawn('cmd.exe', ['/c', startBat], { cwd: serverRoot, env: process.env, detached: true, stdio: 'ignore', windowsHide: false });",
                    "    p.unref();",
                    "  } catch (e) {",
                    "    // ignore",
                    "  }",
                    "}, delay);",
                ].join('\n')
                : [
                    "const { spawn } = require('child_process');",
                    `const execPath = ${JSON.stringify(execPath)};`,
                    `const argv = ${JSON.stringify(argv)};`,
                    `const cwd = ${JSON.stringify(cwd)};`,
                    `setTimeout(() => {`,
                    `  const child = spawn(execPath, argv, { cwd, env: process.env, detached: true, stdio: 'ignore', windowsHide: true });`,
                    `  child.unref();`,
                    `}, ${JSON.stringify(delay)});`,
                ].join('\n');

            const helper = spawn(execPath, ['-e', helperCode], {
                cwd,
                env: process.env,
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
            });
            helper.unref();
        } catch {
            // ignore respawn failures; still attempt exit below
        }
    }

    // Exit sooner; helper (if any) will start the new server later.
    const exitDelay = Math.min(500, delay);
    setTimeout(() => {
        try {
            // Trigger SillyTavern graceful shutdown handler if present.
            process.kill(process.pid, 'SIGTERM');
        } catch {
            try {
                process.exit(0);
            } catch {
                // ignore
            }
        }
    }, exitDelay);

    return delay;
}

/**
 * Initialize plugin.
 * @param {import('express').Router} router Express router
 */
export async function init(router) {
    router.post('/probe', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const includeEnv = asBool(req.body?.includeEnv, false);
        const includeEnvAll = asBool(req.body?.includeEnvAll, false);

        res.json({
            ok: true,
            plugin: info,
            platform: process.platform,
            node: { version: process.version },
            pluginsRoot,
            ...(includeEnv ? { env: includeEnvAll ? process.env : pickEnv(process.env, DEFAULT_ENV_KEYS) } : {}),
        });
    });

    router.post('/list', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const includeInfo = asBool(req.body?.includeInfo, true);

        /** @type {any[]} */
        const items = [];
        const entries = fs.readdirSync(pluginsRoot, { withFileTypes: true })
            .filter((d) => !d.name.startsWith('.'));

        for (const d of entries) {
            // Skip the plugins package.json itself, etc.
            if (d.isFile() && d.name === 'package.json') continue;

            const fullPath = path.join(pluginsRoot, d.name);
            if (d.isDirectory()) {
                const resolved = resolveDirectoryEntryFile(fullPath);
                const entryFile = resolved.entryFile || null;
                const record = {
                    name: d.name,
                    kind: 'directory',
                    path: fullPath,
                    entryFile,
                    entryMissing: !!resolved.entryMissing,
                    packageJson: resolved.packageJson || null,
                    info: null,
                    infoError: null,
                };
                if (includeInfo && entryFile && !resolved.entryMissing) {
                    const r = await tryReadPluginInfo(entryFile);
                    record.info = r.info ?? null;
                    record.infoError = r.infoError ?? null;
                }
                items.push(record);
                continue;
            }

            // file plugin (.js/.cjs/.mjs)
            if (d.isFile() && /\.(mjs|cjs|js)$/i.test(d.name)) {
                const entryFile = fullPath;
                const record = {
                    name: d.name,
                    kind: 'file',
                    path: fullPath,
                    entryFile,
                    info: null,
                    infoError: null,
                };
                if (includeInfo) {
                    const r = await tryReadPluginInfo(entryFile);
                    record.info = r.info ?? null;
                    record.infoError = r.infoError ?? null;
                }
                items.push(record);
                continue;
            }
        }

        res.json({ ok: true, pluginsRoot, plugins: items });
    });

    router.post('/get', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const name = asTrimmedString(req.body?.name);
        const includeInfo = asBool(req.body?.includeInfo, true);

        if (!isSafeEntryName(name)) {
            res.status(400).json({ ok: false, error: 'Invalid plugin name' });
            return;
        }

        const fullPath = path.join(pluginsRoot, name);
        if (!fs.existsSync(fullPath)) {
            res.status(404).json({ ok: false, error: 'Plugin not found' });
            return;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const resolved = resolveDirectoryEntryFile(fullPath);
            const entryFile = resolved.entryFile || null;
            const record = {
                ok: true,
                name,
                kind: 'directory',
                path: fullPath,
                entryFile,
                entryMissing: !!resolved.entryMissing,
                packageJson: resolved.packageJson || null,
                info: null,
                infoError: null,
            };
            if (includeInfo && entryFile && !resolved.entryMissing) {
                const r = await tryReadPluginInfo(entryFile);
                record.info = r.info ?? null;
                record.infoError = r.infoError ?? null;
            }
            res.json(record);
            return;
        }

        if (stat.isFile()) {
            const record = {
                ok: true,
                name,
                kind: 'file',
                path: fullPath,
                entryFile: fullPath,
                info: null,
                infoError: null,
            };
            if (includeInfo) {
                const r = await tryReadPluginInfo(fullPath);
                record.info = r.info ?? null;
                record.infoError = r.infoError ?? null;
            }
            res.json(record);
            return;
        }

        res.status(400).json({ ok: false, error: 'Unsupported entry type' });
    });

    router.post('/add', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const gitUrl = asTrimmedString(req.body?.gitUrl);
        const folderNameInput = asTrimmedString(req.body?.folderName);
        const restart = asBool(req.body?.restart, true);
        const restartMode = asTrimmedString(req.body?.restartMode).toLowerCase() === 'exit' ? 'exit' : 'respawn';
        const restartDelayMs = asFiniteNumber(req.body?.restartDelayMs) ?? 800;
        const branch = asTrimmedString(req.body?.branch);

        if (!gitUrl) {
            res.status(400).json({ ok: false, error: 'gitUrl is required' });
            return;
        }

        const folderName = folderNameInput || inferFolderNameFromGitUrl(gitUrl);
        if (!isSafeEntryName(folderName)) {
            res.status(400).json({ ok: false, error: 'Invalid folderName' });
            return;
        }

        const targetPath = path.join(pluginsRoot, folderName);
        if (fs.existsSync(targetPath)) {
            res.status(409).json({ ok: false, error: 'Target already exists', folderName, path: targetPath });
            return;
        }

        const args = ['clone', '--depth', '1'];
        if (branch) {
            args.push('--branch', branch, '--single-branch');
        }
        args.push(gitUrl, targetPath);

        const r = await spawnAndCapture('git', args, { cwd: pluginsRoot, timeoutMs: 10 * 60 * 1000 });
        const out = {
            ok: r.ok,
            folderName,
            path: targetPath,
            git: r,
            restart: null,
        };

        if (!r.ok) {
            // best-effort cleanup
            try {
                if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
            } catch {
                // ignore
            }
            res.status(500).json(out);
            return;
        }

        if (restart) {
            const delay = scheduleRestart(restartMode, restartDelayMs);
            out.restart = { scheduled: true, mode: restartMode, delayMs: delay };
        }

        res.json(out);
    });

    /**
     * Upload & install from a zip (base64).
     * Body: { zipBase64, fileName?, folderName?, restart?, restartMode?, restartDelayMs? }
     */
    router.post('/addZip', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const fileName = asTrimmedString(req.body?.fileName);
        const folderNameInput = asTrimmedString(req.body?.folderName) || inferFolderNameFromFileName(fileName);

        const restart = asBool(req.body?.restart, true);
        const restartMode = asTrimmedString(req.body?.restartMode).toLowerCase() === 'exit' ? 'exit' : 'respawn';
        const restartDelayMs = asFiniteNumber(req.body?.restartDelayMs) ?? 800;

        if (!isSafeEntryName(folderNameInput)) {
            res.status(400).json({ ok: false, error: 'Invalid folderName' });
            return;
        }

        const targetPath = path.join(pluginsRoot, folderNameInput);
        if (fs.existsSync(targetPath)) {
            res.status(409).json({ ok: false, error: 'Target already exists', folderName: folderNameInput, path: targetPath });
            return;
        }

        let buffer;
        try {
            buffer = decodeBase64ToBuffer(req.body?.zipBase64);
        } catch (e) {
            res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
            return;
        }

        fs.mkdirSync(targetPath, { recursive: true });

        try {
            const { extractedCount, stripPrefix } = await extractZip(buffer, targetPath);
            /** @type {any} */
            const out = {
                ok: true,
                folderName: folderNameInput,
                path: targetPath,
                extractedCount,
                stripPrefix,
                restart: null,
            };

            if (restart) {
                const delay = scheduleRestart(restartMode, restartDelayMs);
                out.restart = { scheduled: true, mode: restartMode, delayMs: delay };
            }

            res.json(out);
        } catch (e) {
            // cleanup on failure
            try {
                if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
            } catch {
                // ignore
            }
            res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
        }
    });

    /**
     * Import from local path on server.
     * Body: { sourcePath, folderName?, restart?, restartMode?, restartDelayMs? }
     */
    router.post('/addPath', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const sourcePath = asTrimmedString(req.body?.sourcePath);
        const folderNameInput = asTrimmedString(req.body?.folderName) || path.basename(sourcePath);

        const restart = asBool(req.body?.restart, true);
        const restartMode = asTrimmedString(req.body?.restartMode).toLowerCase() === 'exit' ? 'exit' : 'respawn';
        const restartDelayMs = asFiniteNumber(req.body?.restartDelayMs) ?? 800;

        if (!sourcePath) {
            res.status(400).json({ ok: false, error: 'sourcePath is required' });
            return;
        }

        if (!isSafeEntryName(folderNameInput)) {
            res.status(400).json({ ok: false, error: 'Invalid folderName' });
            return;
        }

        if (!fs.existsSync(sourcePath)) {
            res.status(404).json({ ok: false, error: 'sourcePath not found' });
            return;
        }

        const targetPath = path.join(pluginsRoot, folderNameInput);
        if (fs.existsSync(targetPath)) {
            res.status(409).json({ ok: false, error: 'Target already exists', folderName: folderNameInput, path: targetPath });
            return;
        }

        try {
            const stat = fs.statSync(sourcePath);
            let kind = 'unknown';
            if (stat.isDirectory()) {
                kind = 'directory';
                copyRecursiveSync(sourcePath, targetPath);
            } else if (stat.isFile()) {
                kind = 'file';
                fs.copyFileSync(sourcePath, targetPath);
            } else {
                res.status(400).json({ ok: false, error: 'Unsupported source type' });
                return;
            }

            /** @type {any} */
            const out = { ok: true, sourcePath, folderName: folderNameInput, path: targetPath, kind, restart: null };
            if (restart) {
                const delay = scheduleRestart(restartMode, restartDelayMs);
                out.restart = { scheduled: true, mode: restartMode, delayMs: delay };
            }
            res.json(out);
        } catch (e) {
            // cleanup on failure
            try {
                if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
            } catch {
                // ignore
            }
            res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
        }
    });

    router.post('/delete', async (req, res) => {
        const pluginsRoot = getPluginsRootDir();
        const name = asTrimmedString(req.body?.name);
        const restart = asBool(req.body?.restart, true);
        const restartMode = asTrimmedString(req.body?.restartMode).toLowerCase() === 'exit' ? 'exit' : 'respawn';
        const restartDelayMs = asFiniteNumber(req.body?.restartDelayMs) ?? 800;

        if (!isSafeEntryName(name)) {
            res.status(400).json({ ok: false, error: 'Invalid plugin name' });
            return;
        }

        const targetPath = path.join(pluginsRoot, name);
        if (!fs.existsSync(targetPath)) {
            res.status(404).json({ ok: false, error: 'Plugin not found' });
            return;
        }

        let kind = 'unknown';
        try {
            const stat = fs.statSync(targetPath);
            if (stat.isDirectory()) {
                kind = 'directory';
                fs.rmSync(targetPath, { recursive: true, force: true });
            } else if (stat.isFile()) {
                kind = 'file';
                fs.unlinkSync(targetPath);
            } else {
                res.status(400).json({ ok: false, error: 'Unsupported entry type' });
                return;
            }
        } catch (e) {
            res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
            return;
        }

        /** @type {any} */
        const out = { ok: true, name, kind, restart: null };
        if (restart) {
            const delay = scheduleRestart(restartMode, restartDelayMs);
            out.restart = { scheduled: true, mode: restartMode, delayMs: delay };
        }
        res.json(out);
    });

    router.post('/restart', async (req, res) => {
        const mode = asTrimmedString(req.body?.mode).toLowerCase() === 'exit' ? 'exit' : 'respawn';
        const delayMs = asFiniteNumber(req.body?.delayMs) ?? 800;
        const delay = scheduleRestart(mode, delayMs);
        res.json({ ok: true, restart: { scheduled: true, mode, delayMs: delay } });
    });
}

