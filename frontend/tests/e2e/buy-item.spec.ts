import { test, expect } from '@playwright/test'
import { mockShopItems, mockBuySuccess } from '../fixtures/mockShop'
import { mockAds } from '../fixtures/mockAds'

test.describe('Buy Item', () => {
  test.beforeEach(async ({ page }) => {
    // Start game with enough gold
    await page.route('**/game/start', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          gameId: 'test-123',
          lives: 3,
          gold: 100,
          level: 1,
          score: 0,
          highScore: 0,
          turn: 0,
        }),
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

    // Mock buy potion
    await page.route('**/test-123/shop/buy/hpot', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBuySuccess),
      })
    })
  })

  test('a purchase banner is shown after buying an item', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    await page.click('button:has-text("Shop")')
    await expect(page.locator('.shop-panel')).toBeVisible()
    await expect(page.locator('.shop-item').first()).toBeVisible()

    await page.locator('.shop-item').first().locator('button:has-text("Buy")').click()

    await expect(page.locator('.banner--shop-purchase')).toBeVisible()
    await expect(page.locator('.banner--shop-purchase .banner__message')).toHaveText(
      'Health Potion'
    )
  })

  test('buying an item increases lives', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    // Initially 3 lives
    await expect(page.locator('.lives-display__heart--filled')).toHaveCount(3)

    // Open shop
    await page.click('button:has-text("Shop")')
    await expect(page.locator('.shop-panel')).toBeVisible()

    // Wait for shop items to load
    await expect(page.locator('.shop-item').first()).toBeVisible()

    // Buy the first item (Health Potion)
    await page.locator('.shop-item').first().locator('button:has-text("Buy")').click()

    // Lives should increase to 4
    await expect(page.locator('.lives-display__heart--filled')).toHaveCount(4)
  })

  test('shop panel can be opened and closed', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    // Shop should not be visible initially
    await expect(page.locator('.shop-panel')).not.toBeVisible()

    // Open shop
    await page.click('button:has-text("Shop")')
    await expect(page.locator('.shop-panel')).toBeVisible()

    // Close shop
    await page.locator('.shop-panel__close').click()
    await expect(page.locator('.shop-panel')).not.toBeVisible()
  })

  test('shop displays items with costs', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    await page.click('button:has-text("Shop")')
    await expect(page.locator('.shop-panel')).toBeVisible()
    await expect(page.locator('.shop-item')).toHaveCount(3)

    // Check that item names are visible
    await expect(page.locator('text=Health Potion')).toBeVisible()
  })
})
