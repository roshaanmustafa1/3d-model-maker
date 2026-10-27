import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'

const json = (path) => readFile(path, 'utf8').then(JSON.parse)
const decode = (value) => value?.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
async function nodeResults(name) {
  const xml = await readFile(`qa-reports/test-results/${name}.xml`, 'utf8')
  return [...xml.matchAll(/<testcase\b((?:"[^"]*"|[^">])*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)].map((match) => ({ name: decode(match[1].match(/name="([^"]*)"/)?.[1]), status: /<skipped/.test(match[2] || '') ? 'skipped' : /<failure|<error/.test(match[2] || '') ? 'failed' : 'passed' }))
}
const existing = await nodeResults('existing'), engine = await nodeResults('engine')
const browserJSON = await json('qa-reports/test-results/browser-results.json')
const browser = []
function visit(suite, prefix = '') {
  for (const spec of suite.specs || []) for (const test of spec.tests) browser.push({ name: prefix + spec.title, status: test.results.at(-1)?.status ?? test.status, error: test.results.at(-1)?.errors?.[0]?.message?.slice(0, 800) })
  for (const child of suite.suites || []) visit(child, prefix + (child.title ? child.title + ' / ' : ''))
}
browserJSON.suites.forEach((suite) => visit(suite))
const count = (tests) => ({ passed: tests.filter((test) => test.status === 'passed').length, failed: tests.filter((test) => !['passed', 'skipped'].includes(test.status)).length, skipped: tests.filter((test) => test.status === 'skipped').length, total: tests.length })
const totals = count([...existing, ...engine, ...browser])
const assets = await json('qa-reports/test-results/assets-and-performance.json')
const browserPerformance = await json('qa-reports/test-results/browser-performance.json')
const browserEnvironment = await json('qa-reports/test-results/browser-environment.json')
const typecheck = await json('qa-reports/test-results/typecheck-execution.json')
const build = await json('qa-reports/test-results/build-execution.json')
const manifest = await json('package.json')
const hashes = {}
for (const path of ['package.json', 'package-lock.json', 'stores/editor-store.ts', 'stores/project-store.ts', 'engine/topology/topology-graph.ts', 'engine/topology/geometry-operators.ts', 'engine/topology/uv-unwrapper.ts', 'engine/loaders/model-importer.ts', 'engine/exporters/glb-exporter.ts', 'components/viewport/scene-renderer.tsx', 'components/viewport/viewport-canvas.tsx']) hashes[path] = createHash('sha256').update(await readFile(path)).digest('hex')
const versions = {}
for (const name of ['next', 'react', 'three', '@react-three/fiber', '@react-three/drei', '@playwright/test', 'zustand', 'immer']) versions[name] = (await json(`node_modules/${name}/package.json`)).version
const environment = { app: { name: manifest.name, version: manifest.version }, versions, sourceSHA256: hashes, hardware: assets.environment, browser: browserEnvironment, devServer: 'http://localhost:3000', blackbulletServer: 'http://localhost:5173/customizer' }
const summary = { generatedAt: new Date().toISOString(), releaseGate: 'FAIL', totals, groups: { existing: count(existing), independentEngine: count(engine), browser: count(browser) }, typecheck: typecheck.exitCode, build: build.exitCode, tests: { existing, engine, browser }, environment }
await writeFile('qa-reports/test-results/summary.json', JSON.stringify(summary, null, 2))
await writeFile('qa-reports/test-results/environment.json', JSON.stringify(environment, null, 2))

const screenshots = (await readdir('qa-reports/screenshots')).filter((file) => /\.(png|jpg)$/.test(file))
const rows = Object.entries(summary.groups).map(([name, values]) => `| ${name} | ${values.passed} | ${values.failed} | ${values.skipped} | ${values.total} |`).join('\n')
const failing = [...engine, ...browser].filter((test) => !['passed', 'skipped'].includes(test.status)).map((test) => `- ${test.name}`).join('\n')
const main = `# Phase 2 independent QA report

## Executive decision: FAIL — fix critical/high defects before Phase 3

Tested ${manifest.name} ${manifest.version} on October 24, 2026 (Asia/Karachi). This is the working checkout, not an asserted release tag. Exact source hashes and installed package versions are saved in [environment.json](test-results/environment.json).

The existing suite passes, but independent engine tests and real browser interactions expose selection inconsistency, non-durable geometry persistence, broken geometry/UV history, face-material export failure, incorrect flipped shading normals, and a real downstream BlackBullet color override. Do not proceed to Phase 3 until these release blockers are resolved and the failing regressions pass.

## Recorded counts

| Suite | Passed | Failed | Skipped/unsupported | Total |
|---|---:|---:|---:|---:|
${rows}
| Total automated tests | ${totals.passed} | ${totals.failed} | ${totals.skipped} | ${totals.total} |

Skipped tests are unsupported join, bevel and material-duplication actions; they are not passes. Additional manual/unexecuted subcases below are not included in automated test totals. A single test can contain multiple assertions; defect count differs from test count.

Typecheck: ${typecheck.exitCode === 0 ? 'PASS' : 'FAIL'} (exit ${typecheck.exitCode}). Production build: ${build.exitCode === 0 ? 'PASS' : 'FAIL'} (exit ${build.exitCode}). Full command lines, timestamps, exit statuses and logs are under test-results. Engine failures intentionally produce a nonzero exit status.

## Environment and setup

- ${assets.environment.os}; ${assets.environment.cpu}; ${(assets.environment.memoryBytes / 1024 ** 3).toFixed(1)} GiB RAM; Node ${assets.environment.node}.
- Next ${versions.next}; React ${versions.react}; Three ${versions.three}; R3F ${versions['@react-three/fiber']}; Drei ${versions['@react-three/drei']}.
- Playwright ${versions['@playwright/test']}; installed Edge ${browserEnvironment.browserVersion}; 1440×1000 viewport; one worker, no automatic retries.
- WebGL was active. Renderer: ${browserEnvironment.renderer}. These browser tests used **software rendering**, not a hardware GPU.
- Existing local Next development server on port 3000 was reused. An attempted new dev server on 3100 exited because the existing server owned the development lock; the user's server was not stopped.
- Previous Chromium-download trouble was avoided by using the installed Edge executable. No browser binary download was needed. Initial sandbox spawn failures required approved subprocess execution.
- Actual BlackBullet server on port 5173 and sibling source were found and tested. No production/backend data was modified.

## Coverage and real evidence

| Category | Result and limits |
|---|---|
| Layout | Side panels have usable measured widths; screenshot shows full editor |
| Selection | Viewport hit, background deselection, Escape, Scene Explorer deselection and camera orbit/pan/zoom pass; adding-primitive/Shift-click synchronization fails |
| Edit mode | Tab, select-all and Escape clearing/exit are browser tested; pointer gestures for every vertex/edge/face and gizmo dragging are not fully certified |
| Shading | All four modes interact correctly; actual Three.js material snapshots preserve color/PBR values and geometry; topology overlay tested |
| Black fabric | #09090B/0.65/0/opacity 1/DoubleSide survives standalone GLB and embedded glTF round-trips; actual BlackBullet replaces it |
| Real geometry | Actual raglan garment round-trip passes; six browser camera captures show real solid surfaces; intentional garment openings are not treated as holes to fill |
| Source quality | subdivision.glb retains black but fails standalone UV/degenerate diagnostics; see asset JSON and compatibility report |
| Topology | Extrude/inset/subdivide, merge/weld/delete/flip forward geometry exports are tested; connected-component separation passes; history and shading-normal failures remain |
| UV | Finite/missing/invalid UV diagnostics, box/planar/cylindrical forward edits and GLB preservation pass; all six UV history regressions fail; real PNG download succeeds |
| Materials | Slot assignment on default cube breaks export and undo; source PBR editing/round-trip supported; material duplicate/rename UI and every slot-removal path are not certified |
| Textures | Real image uploads, browser encode/reload, sRGB/data-map spaces and packed metallic/roughness references tested; decoded embedded PNG pixels independently compared |
| Persistence | Primitive transforms/materials pass serialized store reload; fresh-process edited geometry persistence fails |
| Integration | Actual BlackBullet customizer test fails preservation; complete decal/design placement and production catalog registration remain unverified |
| Performance | Measured 1k/20k/80k meshes; software WebGL FPS and latency have environment limitations, detailed separately |

## Failed test cases

${failing}

For severity, exact reproduction, source functions and recommended repairs, see [BUG_REPORT.md](BUG_REPORT.md). Source asset problems are distinguished from product bugs. Failures caused by early locator casing, stale labels, a missing Node ProgressEvent adapter and test-only R3F observation were corrected in the harness; they are not counted as product failures. The consolidated final run has no intentionally hidden failures.

## Export/reimport scenarios

- A primitive: existing black-shirt/cube tests and independent embedded glTF black-cotton export.
- B multiple meshes/materials: existing multi-material tests; default-cube face-material workflow separately fails.
- C actual T-shirt: black-raglan_shirt.glb passes; black-subdivision.glb preserves color but fails source geometry/UV requirements.
- D edited topology: forward operation artifacts, including separation, exported and reloaded.
- E edited UV mapping: independent forward projection artifacts and real browser export validation.
- F textured material: textured-browser.glb and pbr-textures-roundtrip.glb, with browser snapshots and actual embedded image comparisons.
- G parent/child transformed hierarchy and H customizable metadata: existing regression tests compare actual reimported scene values.

Artifacts are new test copies in exported-models; original user garments were not overwritten. Export/reimport checks use real GLTFExporter and GLTFLoader, not mocks. Node tests use small browser-API adapters over real bytes where required.

## Screenshot evidence

${screenshots.map((file) => `- [${file}](screenshots/${file})`).join('\n')}

These images came from genuine browser interactions. The initial in-app screenshot is supplementary; the PNG set came from the repeatable Playwright suite. There is no established pixel baseline, so this is a visual evidence suite with interaction/material assertions, not a claim that a prior screenshot baseline matches.

## Changes and reproducibility

Added @playwright/test to package.json/package-lock.json, playwright.qa.config.mjs, tests/qa/, scripts/qa/ and this report directory. Production application logic, existing user models, security/sandbox settings and BlackBullet files were not modified by this QA task. Existing tests were retained.

Run the QA components from the project root:

\`\`\`powershell
node scripts/qa/run.mjs existing
node scripts/qa/run.mjs engine
node --import ./scripts/register-typescript.mjs scripts/qa/assets-and-performance.mjs
node scripts/qa/texture-fixture.mjs
node scripts/qa/run.mjs browser
node scripts/qa/verify-texture-bytes.mjs
node scripts/qa/run.mjs typecheck
node scripts/qa/run.mjs build
node scripts/qa/summarize.mjs
\`\`\`

Use installed dependencies and running local development servers. The texture fixture generation uses the existing Next dependency sharp. The test browser path/base URL can be overridden with QA_BROWSER_PATH/QA_BASE_URL. The sibling BlackBullet server and actual garment paths are explicit test-environment requirements.

Remaining coverage gaps include arbitrary model codecs, transparent fabrics, genuine gizmo drags, every edit-selection gesture, full artwork/decal placement and durable texture reopen. Three skipped actions are unsupported rather than environment failures. Fix release blockers, add regressions for those workflows, then repeat QA before Phase 3.
`
await writeFile('qa-reports/PHASE2_QA_REPORT.md', main.replaceAll('\\`', '`'))

const perfRows = assets.performance.map((r) => `| ${r.label} | ${r.triangles} | ${r.importMs.toFixed(1)} | ${r.graphMs.toFixed(1)} | ${r.subdivideTwoFacesMs.toFixed(1)} | ${r.selection100PairsMs.toFixed(1)} | ${r.exportAndVerifyMs.toFixed(1)} |`).join('\n')
const browserRows = browserPerformance.map((r) => `| ${r.label} | ${r.browserImportToVisibleMs.toFixed(1)} | ${r.sceneExplorerClickToInspectorMs.toFixed(1)} | ${r.rafFPS.toFixed(2)} | ${r.snapshot.heap ?? 'unavailable'} | ${r.snapshot.renderer?.memory.geometries} |`).join('\n')
await writeFile('qa-reports/PERFORMANCE_REPORT.md', `# Performance measurements

Measured ${assets.measuredAt}; ${assets.environment.cpu}; ${(assets.environment.memoryBytes / 1024 ** 3).toFixed(1)} GiB memory; ${assets.environment.os}; Node ${assets.environment.node}. Browser Edge ${browserEnvironment.browserVersion}, 1440×1000, Next development mode, software WebGL: ${browserEnvironment.renderer}.

## Node engine measurements (milliseconds)

| Fixture | Triangles | Construct/import | Build topology | Subdivide 2 faces | 100 select/clear pairs | Export + reload validation |
|---|---:|---:|---:|---:|---:|---:|
${perfRows}

Fixtures are indexed subdivided planes with valid UVs/normals and black DoubleSide PBR materials, not realistic cloth topology. Every export passed validation. Construct/import measures geometry creation plus importer state processing; export duration includes reloading and verification. Topology timings are actual calls, not inferred from UI labels.

## Actual browser measurements

| Fixture | Import to visible name (ms) | Explorer click to inspector check (ms) | requestAnimationFrame FPS | JS heap bytes | Renderer geometries |
|---|---:|---:|---:|---:|---:|
${browserRows}

Import-to-name includes UI upload and locator waits; it is not pure parse time. Selection latency includes Playwright round trips and DOM assertions, not only the engine's input handler. FPS comes from 31 real requestAnimationFrame timestamps (30 intervals) after each import. It is an observed software-rendered development-session value, not a hardware GPU benchmark or a production performance promise. Shadows/contact shadows and other editor rendering remain enabled.

Heap samples vary and geometry counts rise across successive imports. This is a resource-retention signal requiring repeated import/dispose/GC profiling, not enough evidence to declare a memory leak. There is one measurement per size, no confidence interval, no controlled workstation workload and no performance SLA. Nonmonotonic load times can reflect warm caches and scheduling.

Raw timings, process heap/RSS samples and renderer counts: test-results/assets-and-performance.json and test-results/browser-performance.json. Do not extrapolate these numbers to end-user hardware. Before performance signoff, benchmark a production build on target GPUs/mobile devices and profile repeated imports and editing history.
`)
console.log(JSON.stringify({ releaseGate: summary.releaseGate, totals, groups: summary.groups, typecheck: summary.typecheck, build: summary.build, screenshots: screenshots.length }))
