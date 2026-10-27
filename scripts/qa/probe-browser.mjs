import { chromium } from '@playwright/test'
import { observeReactScenes } from '../../tests/qa/browser/observer.mjs'
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.addInitScript(observeReactScenes)
await page.goto('http://localhost:3000')
await page.getByRole('button', { name: /^solid$/i }).waitFor()
console.log(await page.evaluate(() => ({ roots: window.__qaRoots.size, objects: window.__qaSceneObjects().map((o) => [o.type, o.name]), meshes: window.__qaSnapshot().meshes.map((m) => m.name) })))
await browser.close()
