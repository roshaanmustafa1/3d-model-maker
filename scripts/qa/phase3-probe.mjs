import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
const root = 'qa-reports/phase3'
await mkdir(root, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto('http://localhost:3000')
  await page.getByRole('button', { name: /customiz/i }).last().click()
  await page.waitForTimeout(2500)
  await writeFile(`${root}/probe.txt`, await page.locator('body').innerText())
  await page.screenshot({ path: `${root}/initial.png` })
  console.log((await page.locator('body').innerText()).slice(0, 5000))
} finally { await browser.close() }
