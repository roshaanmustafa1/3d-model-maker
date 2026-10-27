import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
const directory = process.env.QA_OUTPUT_DIR || 'qa-reports/test-results'
mkdirSync(directory, { recursive: true })
const commands = {
  existing: ['--import', './scripts/register-typescript.mjs', '--test', '--test-reporter=spec', '--test-reporter-destination=stdout', '--test-reporter=junit', `--test-reporter-destination=${directory}/existing.xml`, 'tests/*.test.mjs'],
  engine: ['--import', './scripts/register-typescript.mjs', '--test', '--test-reporter=spec', '--test-reporter-destination=stdout', '--test-reporter=junit', `--test-reporter-destination=${directory}/engine.xml`, 'tests/qa/*.test.mjs'],
  browser: ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.qa.config.mjs', ...process.argv.slice(3)],
  typecheck: ['node_modules/typescript/bin/tsc', '--noEmit'],
  build: ['node_modules/next/dist/bin/next', 'build'],
}
const name = process.argv[2]
if (!commands[name]) throw new Error('Choose existing, engine, browser, typecheck or build')
const started = new Date().toISOString(), time = performance.now()
const result = spawnSync(process.execPath, commands[name], { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024, env: { ...process.env, FORCE_COLOR: '0' } })
const output = (result.stdout || '') + (result.stderr || '')
writeFileSync(`${directory}/${name}.log`, output)
writeFileSync(`${directory}/${name}-execution.json`, JSON.stringify({ name, started, durationMs: performance.now() - time, exitCode: result.status, signal: result.signal, error: result.error?.message, command: [process.execPath, ...commands[name]], platform: os.platform(), os: os.release(), cpu: os.cpus()[0]?.model, totalMemory: os.totalmem(), node: process.version }, null, 2))
console.log(output.split(/\r?\n/).filter((line) => /^[✔✖﹣ℹ]|passed|failed|skipped|\[\d+\/|Error:|error TS|Compiled|Generating|Finished TypeScript/.test(line)).slice(0, 55).join('\n'))
console.log(`Exit ${result.status}; full output: ${directory}/${name}.log`)
process.exitCode = result.status ?? 1
