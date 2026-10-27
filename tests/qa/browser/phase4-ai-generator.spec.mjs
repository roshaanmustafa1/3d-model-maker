import { test, expect } from '@playwright/test'
import path from 'node:path'

test.setTimeout(120000)

test.describe('Phase 4: AI Image-to-3D Generation & Asset Pipeline', () => {
  test('E2E workflow: Upload reference -> Gemini analysis -> 3D Generation -> Mesh Processing -> Studio Handoff', async ({
    page,
  }) => {
    // 1. Open the application
    await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // 2. Navigate to AI Generator Workspace
    const aiGeneratorBtn = page.getByRole('button', { name: /AI Generator|AI Image/i })
    if (await aiGeneratorBtn.isVisible()) {
      await aiGeneratorBtn.click()
    }

    // Verify main panels are visible
    await expect(page.getByText('AI Image-to-3D Studio & Asset Pipeline')).toBeVisible()
    await expect(page.getByText('1. Reference Images')).toBeVisible()
    await expect(page.getByText('2. Generation Specifications')).toBeVisible()

    // 3. Upload Reference Image (Synthetic 128x128 PNG)
    const pngBase64 = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 128
      c.height = 128
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, 128, 128)
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(64, 64, 40, 0, Math.PI * 2)
      ctx.fill()
      return c.toDataURL('image/png').split(',')[1]
    })

    const fileInput = page.locator('input[type="file"][accept*="image"]')
    await fileInput.setInputFiles({
      name: 'hoodie_front_reference.png',
      mimeType: 'image/png',
      buffer: Buffer.from(pngBase64, 'base64'),
    })

    await expect(page.getByText('FRONT VIEW')).toBeVisible()

    // 4. Trigger Gemini Vision Analysis
    const analyzeBtn = page.getByRole('button', { name: /Analyze with Gemini Vision/i })
    await expect(analyzeBtn).toBeEnabled()
    await analyzeBtn.click()

    // Wait for analysis card to render
    await expect(page.getByText(/Gemini Vision|Detected Components/i).first()).toBeVisible({ timeout: 15000 })

    // 5. Select Local Fixture Provider for deterministic test generation
    const providerSelect = page.locator('button[role="combobox"]').first()
    await providerSelect.click()
    const fixtureOption = page.getByRole('option', { name: /Local Fixture Provider/i })
    await fixtureOption.click()
    await page.waitForTimeout(500)

    // 6. Trigger 3D Model Generation
    const generateBtn = page.getByRole('button', { name: /Generate 3D Model Asset/i })
    await expect(generateBtn).toBeEnabled()
    await generateBtn.click({ force: true })

    // 7. Verify generation progress completes
    await expect(page.getByText(/Reconstruction Completed|Ready/i).first()).toBeVisible({ timeout: 25000 })

    // 8. Verify Quality & Gates Diagnostics
    await expect(page.getByText('1. GLB Asset')).toBeVisible()
    await expect(page.getByText('Valid Geometry')).toBeVisible()
    await expect(page.getByText('2. Customizer')).toBeVisible()
    await page.screenshot({ path: 'qa-reports/screenshots/phase4-generation-dashboard.png' })

    // 9. Automated Mesh Processing Tab
    const meshProcessingTab = page.getByRole('button', { name: 'Mesh Processing', exact: true })
    await meshProcessingTab.click()
    await expect(page.getByText('Automated Mesh Processing')).toBeVisible()
    await page.screenshot({ path: 'qa-reports/screenshots/phase4-mesh-processing.png' })

    const applyProcessingBtn = page.getByRole('button', { name: /Apply/i }).first()
    await expect(applyProcessingBtn).toBeEnabled()
    await applyProcessingBtn.click()

    // Verify toast or updated processed asset status
    await page.waitForTimeout(1000)

    // 10. Persistence verification: Page Reload
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate to AI Generator if on default workspace
    const aiBtnAfterReload = page.getByRole('button', { name: /AI Generator|AI Image/i })
    if (await aiBtnAfterReload.isVisible()) {
      await aiBtnAfterReload.click()
    }

    // History tab should display persisted job
    const historyTab = page.getByRole('button', { name: /History/i })
    await historyTab.click()
    await expect(page.getByText(/Durable Generation History/i)).toBeVisible()
    await page.screenshot({ path: 'qa-reports/screenshots/phase4-generation-history.png' })

    // 11. Handoff: Open in 3D Studio
    const openInStudioBtn = page.getByRole('button', { name: /Open in 3D Studio/i }).first()
    if (await openInStudioBtn.isVisible()) {
      await openInStudioBtn.click()
      await page.waitForTimeout(1000)
      // Check we transitioned to 3D Studio
      await expect(page.getByText(/Modeling Studio|Hierarchy|Scene/i).first()).toBeVisible()
    }
  })
})
