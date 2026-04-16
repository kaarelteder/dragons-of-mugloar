import { test, expect } from '@playwright/test'
import { mockGameResponse } from '../fixtures/mockGame'
import { mockAds } from '../fixtures/mockAds'
import { mockShopItems } from '../fixtures/mockShop'

test.describe('Start Game', () => {
  test.beforeEach(async ({ page }) => {
    // Mock game start
    await page.route('**/game/start', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGameResponse),
      })
    })

    // Mock ads
    await page.route('**/test-123/messages', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAds),
      })
    })

    // Mock shop
    await page.route('**/test-123/shop', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockShopItems),
      })
    })
  })

  test('clicking Start Game navigates to /game and shows HUD', async ({ page }) => {
    await page.goto('/')

    // Should see the start screen
    await expect(page.locator('text=Begin Your Quest')).toBeVisible()

    // Click start
    await page.click('button:has-text("Begin Your Quest")')

    // Should navigate to /game
    await expect(page).toHaveURL('/game')

    // HUD should show 3 lives (heart icons)
    await expect(page.locator('.lives-display')).toBeVisible()
    const filledHearts = page.locator('.lives-display__heart--filled')
    await expect(filledHearts).toHaveCount(3)
  })

  test('game page shows available quests', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    // Should show the ad board
    await expect(page.locator('text=Available Quests')).toBeVisible()

    // Should show at least one ad card
    await expect(page.locator('.ad-card').first()).toBeVisible()
  })

  test('redirects to home if navigating to /game without active game', async ({ page }) => {
    // Clear any persisted state
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    await page.goto('/game')
    await expect(page).toHaveURL('/')
  })
})
