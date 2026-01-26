import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

export const info = {
    id: 'command-exec',
    name: 'Command Exec',
    description: 'Execute backend commands via SillyTavern server plugin.',
};

// Optional dependency: SillyTavern server already includes iconv-lite.
// If unavailable, we fall back to utf8 decoding.
const require = createRequire(import.meta.url);
/** @type {any | null} */
let iconv = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    iconv = require('iconv-lite');
} catch {
    iconv = null;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asString(value) {
    return value === undefined || value === null ? '' : String(value);
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function asStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map((v) => String(v)).filter((s) => s.length > 0);
}

/**
 * @param {string} text
 * @returns {string[]}
 */
function splitLines(text) {
    return String(text || '')
        .split(/\r?\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * @param {string[]} items
 * @returns {string[]}
 */
function unique(items) {
    return Array.from(new Set(items));
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
    // user-defined defaults
    'ST_TERMINAL',
    'ST_TERMINAL_COMMAND',
    'ST_TERMINAL_ARGS',
    // common python-related (still useful)
    'ST_PYTHON',
    'PYTHON',
    'PYTHON_EXECUTABLE',
    // common shells / envs
    'PYTHONHOME',
    'PYTHONPATH',
    'VIRTUAL_ENV',
    'CONDA_PREFIX',
    'CONDA_DEFAULT_ENV',
    // windows basics
    'PROCESSOR_ARCHITECTURE',
    'SystemRoot',
    'COMSPEC',
];

/**
 * @param {string} s
 */
function countReplacementChars(s) {
    return (s.match(/\uFFFD/g) || []).length;
}

/**
 * @param {string} s
 */
function countNulChars(s) {
    return (s.match(/\u0000/g) || []).length;
}

/**
 * @param {Buffer} buf
 * @param {string} encoding
 */
function decodeWithEncoding(buf, encoding) {
    const enc = String(encoding || '').trim().toLowerCase();
    if (!enc || enc === 'auto') return null;

    // iconv-lite supports many Windows codepages (e.g. gbk/cp936).
    if (iconv && typeof iconv.decode === 'function') {
        try {
            if (!iconv.encodingExists || iconv.encodingExists(enc)) {
                return iconv.decode(buf, enc);
            }
        } catch {
            // ignore
        }
    }

    // Node built-in encodings
    try {
        return buf.toString(enc);
    } catch {
        return null;
    }
}

/**
 * Best-effort decode:
 * - default to utf8
 * - on win32, if utf8 produces many replacement chars, try gbk
 * - if utf8 produces many NULs (likely UTF-16LE), try utf16le
 *
 * @param {Buffer} buf
 * @param {string} outputEncoding
 * @returns {{ text: string, encoding: string }}
 */
function decodeAuto(buf, outputEncoding) {
    if (!buf || buf.length === 0) return { text: '', encoding: 'utf8' };

    const forced = decodeWithEncoding(buf, outputEncoding);
    if (typeof forced === 'string') return { text: forced, encoding: String(outputEncoding || '').trim() || 'custom' };

    // 1) try utf8
    const utf8 = buf.toString('utf8');
    const nulCount = countNulChars(utf8);
    if (nulCount > 0 && nulCount > Math.max(10, Math.floor(utf8.length / 4))) {
        // Likely UTF-16LE output (common with Windows PowerShell when piped)
        const u16 = buf.toString('utf16le');
        return { text: u16, encoding: 'utf16le' };
    }

    // 2) on Windows, try GBK if UTF-8 has many replacement chars
    if (process.platform === 'win32') {
        const repUtf8 = countReplacementChars(utf8);
        if (repUtf8 > 0 && iconv && typeof iconv.decode === 'function') {
            try {
                const gbk = iconv.decode(buf, 'gbk');
                const repGbk = countReplacementChars(gbk);
                if (repGbk < repUtf8) {
                    return { text: gbk, encoding: 'gbk' };
                }
            } catch {
                // ignore
            }
        }
    }

    return { text: utf8, encoding: 'utf8' };
}

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
 *   outputEncoding?: string,
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
        /** @type {Buffer[]} */
        const stdoutChunks = [];
        /** @type {Buffer[]} */
        const stderrChunks = [];
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

        child.stdout.on('data', (chunk) => {
            stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(asString(chunk)));
        });
        child.stderr.on('data', (chunk) => {
            stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(asString(chunk)));
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
                // Best-effort hard kill after a grace period
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
                stdout: '',
                stderr: '',
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

            const stdoutBuf = stdoutChunks.length > 0 ? Buffer.concat(stdoutChunks) : Buffer.alloc(0);
            const stderrBuf = stderrChunks.length > 0 ? Buffer.concat(stderrChunks) : Buffer.alloc(0);
            const decodedStdout = decodeAuto(stdoutBuf, options.outputEncoding);
            const decodedStderr = decodeAuto(stderrBuf, options.outputEncoding);

            settle({
                ok,
                exitCode,
                signal,
                stdout: decodedStdout.text,
                stderr: decodedStderr.text,
                timedOut,
                durationMs: Date.now() - start,
                ...(errorMessage ? { error: errorMessage } : {}),
            });
        });
    });
}

/**
 * @typedef {'auto'|'powershell'|'pwsh'|'cmd'|'bash'|'sh'|'zsh'|'fish'|'custom'} TerminalType
 */

/**
 * @param {unknown} input
 * @returns {TerminalType}
 */
function normalizeTerminalType(input) {
    const s = asTrimmedString(input).toLowerCase();
    switch (s) {
        case 'powershell':
        case 'pwsh':
        case 'cmd':
        case 'bash':
        case 'sh':
        case 'zsh':
        case 'fish':
        case 'custom':
            return /** @type {TerminalType} */ (s);
        case '':
        case 'auto':
        default:
            return 'auto';
    }
}

/**
 * @param {string} command
 * @returns {TerminalType}
 */
function guessTerminalTypeFromCommand(command) {
    const base = path.basename(String(command || '')).toLowerCase();
    if (base.startsWith('pwsh')) return 'pwsh';
    if (base.startsWith('powershell')) return 'powershell';
    if (base === 'cmd.exe' || base === 'cmd') return 'cmd';
    if (base.includes('bash')) return 'bash';
    if (base === 'sh' || base.endsWith('/sh')) return 'sh';
    if (base.includes('zsh')) return 'zsh';
    if (base.includes('fish')) return 'fish';
    return 'custom';
}

/**
 * Returns default args template for each terminal type.
 * Uses `{{script}}` placeholder.
 *
 * @param {TerminalType} type
 * @returns {string[]}
 */
function defaultTerminalArgsTemplate(type) {
    switch (type) {
        case 'powershell':
            return ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', '{{script}}'];
        case 'pwsh':
            return ['-NoProfile', '-NonInteractive', '-Command', '{{script}}'];
        case 'cmd':
            return ['/d', '/s', '/c', '{{script}}'];
        case 'bash':
        case 'zsh':
        case 'fish':
        case 'sh':
            return ['-c', '{{script}}'];
        case 'custom':
        case 'auto':
        default:
            return ['-c', '{{script}}'];
    }
}

/**
 * @param {string[]} template
 * @param {string} script
 * @returns {string[]}
 */
function materializeArgsTemplate(template, script) {
    const out = [];
    let replaced = false;
    for (const a of template) {
        if (a === '{{script}}') {
            out.push(script);
            replaced = true;
        } else {
            out.push(a);
        }
    }
    if (!replaced) out.push(script);
    return out;
}

/**
 * Resolve terminal used for `script` mode.
 *
 * Priority:
 * 1) request: terminalCommand / terminalArgs (if provided)
 * 2) request: terminal type
 * 3) env: ST_TERMINAL / ST_TERMINAL_COMMAND / ST_TERMINAL_ARGS
 * 4) auto: win32 -> powershell, else -> env.SHELL or bash
 *
 * @param {unknown} terminalInput
 * @param {unknown} terminalCommandInput
 * @param {unknown} terminalArgsInput
 * @returns {{
 *   type: TerminalType,
 *   command: string,
 *   argsTemplate: string[],
 *   source: string,
 * }}
 */
function resolveTerminal(terminalInput, terminalCommandInput, terminalArgsInput) {
    const reqType = normalizeTerminalType(terminalInput);
    const reqCmd = asTrimmedString(terminalCommandInput);
    const reqArgs = Array.isArray(terminalArgsInput) ? terminalArgsInput.map(String) : null;

    if (reqCmd) {
        const inferredType = reqType === 'auto' ? guessTerminalTypeFromCommand(reqCmd) : reqType;
        return {
            type: inferredType,
            command: reqCmd,
            argsTemplate: reqArgs && reqArgs.length > 0 ? reqArgs : defaultTerminalArgsTemplate(inferredType),
            source: 'request.terminalCommand',
        };
    }
    if (reqArgs && reqArgs.length > 0) {
        // If user supplies args without command, still resolve command by type below and apply provided args.
        const base = resolveTerminal(reqType, null, null);
        return { ...base, argsTemplate: reqArgs, source: 'request.terminalArgs' };
    }

    // env overrides
    const envTerminal = asTrimmedString(process.env.ST_TERMINAL);
    const envTerminalCommand = asTrimmedString(process.env.ST_TERMINAL_COMMAND);
    const envTerminalArgsRaw = asTrimmedString(process.env.ST_TERMINAL_ARGS);
    if (envTerminalCommand) {
        const type = envTerminal ? normalizeTerminalType(envTerminal) : guessTerminalTypeFromCommand(envTerminalCommand);
        let argsTemplate = defaultTerminalArgsTemplate(type);
        if (envTerminalArgsRaw) {
            try {
                const parsed = JSON.parse(envTerminalArgsRaw);
                if (Array.isArray(parsed)) {
                    argsTemplate = parsed.map(String);
                }
            } catch {
                // ignore parse errors
            }
        }
        return { type, command: envTerminalCommand, argsTemplate, source: 'env.ST_TERMINAL_COMMAND' };
    }
    if (envTerminal) {
        const type = normalizeTerminalType(envTerminal);
        const command = type === 'pwsh'
            ? 'pwsh'
            : type === 'powershell'
                ? 'powershell'
                : type === 'cmd'
                    ? 'cmd'
                    : type === 'zsh'
                        ? 'zsh'
                        : type === 'fish'
                            ? 'fish'
                            : type === 'sh'
                                ? 'sh'
                                : type === 'bash'
                                    ? 'bash'
                                    : 'bash';
        let argsTemplate = defaultTerminalArgsTemplate(type);
        if (envTerminalArgsRaw) {
            try {
                const parsed = JSON.parse(envTerminalArgsRaw);
                if (Array.isArray(parsed)) {
                    argsTemplate = parsed.map(String);
                }
            } catch {
                // ignore parse errors
            }
        }
        return { type, command, argsTemplate, source: 'env.ST_TERMINAL' };
    }

    // type from request
    if (reqType !== 'auto') {
        const command = reqType === 'pwsh'
            ? 'pwsh'
            : reqType === 'powershell'
                ? 'powershell'
                : reqType === 'cmd'
                    ? 'cmd'
                    : reqType === 'zsh'
                        ? 'zsh'
                        : reqType === 'fish'
                            ? 'fish'
                            : reqType === 'sh'
                                ? 'sh'
                                : reqType === 'bash'
                                    ? 'bash'
                                    : 'bash';
        return { type: reqType, command, argsTemplate: defaultTerminalArgsTemplate(reqType), source: 'request.terminal' };
    }

    // auto
    if (process.platform === 'win32') {
        return { type: 'powershell', command: 'powershell', argsTemplate: defaultTerminalArgsTemplate('powershell'), source: 'auto.win32' };
    }

    const envShell = asTrimmedString(process.env.SHELL);
    if (envShell) {
        const inferredType = guessTerminalTypeFromCommand(envShell);
        return { type: inferredType, command: envShell, argsTemplate: defaultTerminalArgsTemplate(inferredType), source: 'auto.env.SHELL' };
    }

    return { type: 'bash', command: 'bash', argsTemplate: defaultTerminalArgsTemplate('bash'), source: 'auto.posix' };
}

/**
 * @param {any} rawEnv
 * @returns {Record<string, string>}
 */
function mergeEnv(rawEnv) {
    /** @type {Record<string, string>} */
    const env = { ...process.env };
    if (rawEnv && typeof rawEnv === 'object') {
        for (const [k, v] of Object.entries(rawEnv)) {
            if (v === undefined || v === null) continue;
            env[String(k)] = String(v);
        }
    }
    return env;
}

/**
 * Initialize plugin.
 * @param {import('express').Router} router Express router
 * @returns {Promise<any>} Promise that resolves when plugin is initialized
 */
export async function init(router) {
    router.post('/probe', async (req, res) => {
        const includeEnv = !!req.body?.includeEnv;
        const includeEnvAll = !!req.body?.includeEnvAll;

        const resolvedDefault = resolveTerminal('auto', null, null);
        const resolvedRequested = resolveTerminal(req.body?.terminal, req.body?.terminalCommand, req.body?.terminalArgs);

        res.json({
            ok: true,
            plugin: info,
            platform: process.platform,
            node: { version: process.version },
            defaultTerminal: {
                type: resolvedDefault.type,
                command: resolvedDefault.command,
                argsTemplate: resolvedDefault.argsTemplate,
                source: resolvedDefault.source,
            },
            terminal: {
                type: resolvedRequested.type,
                command: resolvedRequested.command,
                argsTemplate: resolvedRequested.argsTemplate,
                source: resolvedRequested.source,
            },
            ...(includeEnv
                ? {
                    env: includeEnvAll ? process.env : pickEnv(process.env, DEFAULT_ENV_KEYS),
                }
                : {}),
        });
    });

    router.post('/env', async (req, res) => {
        const all = !!req.body?.all;
        const keys = Array.isArray(req.body?.keys) ? req.body.keys.map(String) : null;

        if (all) {
            res.json({ ok: true, env: process.env });
            return;
        }

        if (keys && keys.length > 0) {
            res.json({ ok: true, env: pickEnv(process.env, keys) });
            return;
        }

        res.json({ ok: true, env: pickEnv(process.env, DEFAULT_ENV_KEYS) });
    });

    router.post('/which', async (req, res) => {
        const query = asTrimmedString(req.body?.query) || 'python';
        const timeoutMs = Number(req.body?.timeoutMs) || 5000;

        if (process.platform === 'win32') {
            const r = await spawnAndCapture('where', [query], { timeoutMs });
            const lines = unique(splitLines((r.stdout || '') + '\n' + (r.stderr || '')));
            res.json({
                ok: r.ok,
                query,
                command: 'where',
                results: lines,
                ...r,
            });
            return;
        }

        const r = await spawnAndCapture('which', ['-a', query], { timeoutMs });
        const lines = unique(splitLines((r.stdout || '') + '\n' + (r.stderr || '')));
        res.json({
            ok: r.ok,
            query,
            command: 'which -a',
            results: lines,
            ...r,
        });
    });

    router.post('/run', async (req, res) => {
        const rawScript = asTrimmedString(req.body?.script);
        const command = asTrimmedString(req.body?.command);

        const cwd = asTrimmedString(req.body?.cwd) || undefined;
        const stdin = typeof req.body?.stdin === 'string' ? req.body.stdin : undefined;
        const timeoutMs = Number(req.body?.timeoutMs);
        const env = mergeEnv(req.body?.env);
        const outputEncoding = asTrimmedString(req.body?.outputEncoding) || 'auto';

        // Script mode: run via terminal
        if (rawScript) {
            const resolved = resolveTerminal(req.body?.terminal, req.body?.terminalCommand, req.body?.terminalArgs);
            const argsTemplate = resolved.argsTemplate;

            // Optional normalization for Windows shells:
            // If user accidentally passes a string containing literal \" (common copy-paste mistake),
            // cmd.exe / powershell will treat backslashes as normal characters and break quoting.
            let script = rawScript;
            if (resolved.type === 'cmd' || resolved.type === 'powershell' || resolved.type === 'pwsh') {
                script = script.replace(/\\"/g, '"');
            }

            const finalArgs = materializeArgsTemplate(argsTemplate, script);

            const r = await spawnAndCapture(resolved.command, finalArgs, {
                cwd,
                env,
                stdin,
                timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined,
                outputEncoding,
            });

            res.json({
                ...r,
                mode: 'script',
                script,
                terminal: {
                    type: resolved.type,
                    command: resolved.command,
                    source: resolved.source,
                    args: finalArgs,
                    argsTemplate,
                },
                cwd: cwd || null,
            });
            return;
        }

        // Direct mode: spawn command + args
        if (!command) {
            res.status(400).json({ ok: false, error: 'Either script or command is required' });
            return;
        }

        const args = asStringArray(req.body?.args);
        const r = await spawnAndCapture(command, args, {
            cwd,
            env,
            stdin,
            timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined,
            outputEncoding,
        });

        res.json({
            ...r,
            mode: 'direct',
            command,
            args,
            cwd: cwd || null,
        });
    });
}

