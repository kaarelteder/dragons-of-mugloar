import { test, expect } from '@playwright/test'
import { mockGameResponse } from '../fixtures/mockGame'
import { mockAds } from '../fixtures/mockAds'
import { mockShopItems } from '../fixtures/mockShop'

test.describe('Solve Ad', () => {
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

  test('solving an ad updates the score', async ({ page }) => {
    // Mock the solve endpoint
    await page.route('**/test-123/solve/ad-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          lives: 3,
          gold: 50,
          score: 50,
          highScore: 50,
          turn: 1,
          message: 'Well done!',
        }),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')

    // Wait for ads to load
    await expect(page.locator('.ad-card').first()).toBeVisible()

    // Click "Accept Quest" on the first ad card
    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    // Score should update to 50
    await expect(page.locator('.score-display__value')).toHaveText('50')
  })

  test('a success banner is shown after successful solve', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          lives: 3,
          gold: 80,
          score: 80,
          highScore: 80,
          turn: 1,
          message: 'The quest succeeded!',
        }),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('.banner--quest-success')).toBeVisible()
  })

  test('a failure banner is shown after failed solve', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          lives: 2,
          gold: 0,
          score: 0,
          highScore: 0,
          turn: 1,
          message: 'The quest failed!',
        }),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    await expect(page.locator('.banner--quest-failure')).toBeVisible()
  })

  test('life is lost after failed solve', async ({ page }) => {
    await page.route('**/test-123/solve/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          lives: 2,
          gold: 0,
          score: 0,
          highScore: 0,
          turn: 1,
          message: 'You failed!',
        }),
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Begin Your Quest")')
    await expect(page).toHaveURL('/game')
    await expect(page.locator('.ad-card').first()).toBeVisible()

    // Initially 3 hearts
    await expect(page.locator('.lives-display__heart--filled')).toHaveCount(3)

    await page.locator('.ad-card').first().locator('button:has-text("Accept Quest")').click()

    // Now 2 hearts
    await expect(page.locator('.lives-display__heart--filled')).toHaveCount(2)
  })
})
