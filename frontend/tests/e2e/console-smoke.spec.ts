import { test, expect } from '@playwright/test'
import { mockGameResponse } from '../fixtures/mockGame'
import { mockAds } from '../fixtures/mockAds'
import { mockShopItems } from '../fixtures/mockShop'

test('does not emit browser warnings or errors during start flow', async ({ page }) => {
  const consoleIssues: string[] = []
  const failedRequests: string[] = []

  await page.route('**/game/start', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockGameResponse),
    })
  })

  await page.route('**/test-123/messages', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAds),
    })
  })

  await page.route('**/test-123/shop', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockShopItems),
    })
  })

  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleIssues.push(`${message.type()}: ${message.text()}`)
    }
  })

  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? 'unknown'}`
    )
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Begin Your Quest' }).click()
  await expect(page).toHaveURL('/game')
  await expect(page.locator('.ad-card').first()).toBeVisible()

  expect(consoleIssues).toEqual([])
  expect(failedRequests).toEqual([])
})
