# Performance measurements

Measured 2026-10-24T12:51:36.414Z; Intel(R) Xeon(R) CPU E5-2687W v2 @ 3.40GHz; 23.9 GiB memory; win32 10.0.19045; Node v24.21.0. Browser Edge 155.0.4283.62, 1440×1000, Next development mode, software WebGL: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver).

## Node engine measurements (milliseconds)

| Fixture | Triangles | Construct/import | Build topology | Subdivide 2 faces | 100 select/clear pairs | Export + reload validation |
|---|---:|---:|---:|---:|---:|---:|
| small | 1000 | 13.2 | 17.0 | 12.0 | 32.3 | 64.9 |
| medium | 20000 | 32.7 | 320.3 | 283.8 | 112.7 | 528.5 |
| large | 80000 | 107.4 | 814.0 | 598.0 | 46.4 | 684.4 |

Fixtures are indexed subdivided planes with valid UVs/normals and black DoubleSide PBR materials, not realistic cloth topology. Every export passed validation. Construct/import measures geometry creation plus importer state processing; export duration includes reloading and verification. Topology timings are actual calls, not inferred from UI labels.

## Actual browser measurements

| Fixture | Import to visible name (ms) | Explorer click to inspector check (ms) | requestAnimationFrame FPS | JS heap bytes | Renderer geometries |
|---|---:|---:|---:|---:|---:|
| small | 1767.1 | 488.6 | 3.51 | 37911181 | 6 |
| medium | 2649.0 | 490.1 | 3.36 | 53236548 | 24 |
| large | 617.7 | 1254.0 | 2.88 | 45353452 | 59 |

Import-to-name includes UI upload and locator waits; it is not pure parse time. Selection latency includes Playwright round trips and DOM assertions, not only the engine's input handler. FPS comes from 31 real requestAnimationFrame timestamps (30 intervals) after each import. It is an observed software-rendered development-session value, not a hardware GPU benchmark or a production performance promise. Shadows/contact shadows and other editor rendering remain enabled.

Heap samples vary and geometry counts rise across successive imports. This is a resource-retention signal requiring repeated import/dispose/GC profiling, not enough evidence to declare a memory leak. There is one measurement per size, no confidence interval, no controlled workstation workload and no performance SLA. Nonmonotonic load times can reflect warm caches and scheduling.

Raw timings, process heap/RSS samples and renderer counts: test-results/assets-and-performance.json and test-results/browser-performance.json. Do not extrapolate these numbers to end-user hardware. Before performance signoff, benchmark a production build on target GPUs/mobile devices and profile repeated imports and editing history.
