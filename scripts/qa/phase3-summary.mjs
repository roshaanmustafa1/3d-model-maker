import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const root = 'qa-reports/phase3'
const selections = [
  ['interactions-final', title => !title.includes('real artwork')],
  ['artwork-final', () => true],
  ['durability', title => title.includes('uploaded PNG')],
  ['persistence-stable', () => true],
  ['pointer-settled', () => true],
  ['blackbullet-final', () => true],
]
const cases = []
for (const [run, include] of selections) {
  const report = JSON.parse(await readFile(`${root}/${run}/browser-results.json`))
  function visit(suite) {
    for (const spec of suite.specs || []) {
      if (!include(spec.title)) continue
      for (const test of spec.tests) cases.push({ title: spec.title, file: spec.file, run, status: test.results.at(-1).status, errors: test.results.at(-1).errors?.map(error => error.message), durationMs: test.results.at(-1).duration })
    }
    for (const child of suite.suites || []) visit(child)
  }
  for (const suite of report.suites) visit(suite)
}
const counts = cases.reduce((counts, item) => { counts[item.status] = (counts[item.status] || 0) + 1; return counts }, {})
const subdivision = "C:/Users/Roshaan's Pc/Documents/Projects/blackbullet-3d/src/assets/modals/subdivision.glb"
const sha256 = createHash('sha256').update(await readFile(subdivision)).digest('hex')
const summary = {
  releaseDecision: 'FAIL', createdUtc: new Date().toISOString(),
  baseline: { default: { passed: 39 }, independentEngine: { passed: 38, skipped: 3 }, browser: { passed: 24 } },
  phase3Browser: { counts, cases }, phase3NodeRegressions: { passed: 1, failed: 4 },
  productionAsset: { path: subdivision, sha256, matchesRecordedPhase2_5Hash: sha256 === '41917204466a7a872bef865b6dfb4546c380044fd752afdc93700a31a485d0c1' },
  notes: ['Superseded harness-selector attempts and the pre-readiness persistence comparison are retained but excluded from final case counts.', 'Application source and production assets were not edited during this audit.'],
}
await writeFile(`${root}/raw/final-summary.json`, JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ baseline: summary.baseline, phase3Browser: counts, phase3Node: summary.phase3NodeRegressions, productionAssetHashMatches: summary.productionAsset.matchesRecordedPhase2_5Hash }))
