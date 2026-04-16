import { test, expect } from '@playwright/test'
import { mockGameResponse } from '../fixtures/mockGame'
import { mockAds } from '../fixtures/mockAds'
import { mockShopItems } from '../fixtures/mockShop'

const solveKill = {
  success: false,
  lives: 0,
  gold: 0,
  score: 120,
  highScore: 120,
  turn: 5,
}

test.describe('Game Over', () => {
  test.beforeEach(async ({ page }) => {
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
  })

  test('game over modal appears when lives reach 0', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(solveKill),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('text=Game Over')).toBeVisible()
    await expect(page.locator('text=Your dragon has fallen')).toBeVisible()
  })

  test('game over modal shows final score', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(solveKill),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('text=Game Over')).toBeVisible()
    await expect(page.locator('.game-over__stat-value').first()).toHaveText('120')
  })

  test('Play Again navigates back to home', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(solveKill),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('text=Game Over')).toBeVisible()
    await page.click('button:has-text("Play Again")')
    await expect(page).toHaveURL('/')
  })

  test('View History navigates to history page', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(solveKill),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('text=Game Over')).toBeVisible()
    await page.click('button:has-text("View History")')
    await expect(page).toHaveURL('/history')
  })
})
