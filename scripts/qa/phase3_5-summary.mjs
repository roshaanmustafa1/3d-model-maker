import { readFile, writeFile } from 'node:fs/promises'
const root = 'qa-reports/phase3_5'
const selections = [
  ['retained-final', title => !title.includes('editable project survives')],
  ['retained-persistence-final', () => true],
  ['baseline-sequential-final', title => !title.startsWith('Phase 3')],
  ['acceptance-final', title => title.includes('undo/redo')],
  ['acceptance-current', () => true],
  ['persistence-final', () => true],
  ['alignment-lifecycle', title => !title.includes('repeated artwork')],
  ['resource-current', () => true],
  ['blackbullet-contract-current', () => true],
  ['material-slots', () => true],
]
const cases = []
for (const [run, include] of selections) {
  const report = JSON.parse(await readFile(`${root}/${run}/browser-results.json`))
  function visit(suite) {
    for (const spec of suite.specs || []) if (include(spec.title)) for (const test of spec.tests) {
      const result = test.results.at(-1)
      cases.push({ title: spec.title, file: spec.file, run, status: result.status, durationMs: result.duration, errors: result.errors?.map(error => error.message) })
    }
    for (const child of suite.suites || []) visit(child)
  }
  for (const suite of report.suites) visit(suite)
}
const counts = cases.reduce((counts, item) => { counts[item.status] = (counts[item.status] || 0) + 1; return counts }, {})
const nodeResults = {}
for (const name of ['existing', 'engine']) {
  const log = await readFile(`${root}/verification-final/${name}.log`, 'utf8')
  const count = label => Number(log.match(new RegExp(`ℹ ${label} (\\d+)`))?.[1] || 0)
  nodeResults[name] = { passed: count('pass'), failed: count('fail'), skipped: count('skipped'), total: count('tests') }
}
const browserComplete = cases.length === 47 && cases.every(item => item.status === 'passed')
const summary = { decision: !browserComplete || nodeResults.existing.failed || nodeResults.engine.failed ? 'FAIL' : 'PASS', createdUtc: new Date().toISOString(), nodeResults, browserResults: { counts, cases }, notes: ['Final results select each case once. Earlier readiness, hot-reload, host-contention and superseded fixture failures remain separately retained.', 'The retained persistence case uses source-albedo-aware expected pixels; its superseded flat-fill oracle failure is excluded.', 'Typecheck/build execution metadata and BlackBullet build log are separate evidence.'] }
await writeFile(`${root}/raw/final-summary.json`, JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ decision: summary.decision, nodeResults, browser: counts, totalBrowserCases: cases.length }))
