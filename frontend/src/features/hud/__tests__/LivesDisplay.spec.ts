import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LivesDisplay from '@/features/hud/components/LivesDisplay.vue'

describe('LivesDisplay', () => {
  it('renders correct number of filled hearts', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 3, maxLives: 3 },
    })
    const filledHearts = wrapper.findAll('.lives-display__heart--filled')
    expect(filledHearts).toHaveLength(3)
  })

  it('renders correct number of empty hearts', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 1, maxLives: 3 },
    })
    const filledHearts = wrapper.findAll('.lives-display__heart--filled')
    const emptyHearts = wrapper.findAll('.lives-display__heart--empty')
    expect(filledHearts).toHaveLength(1)
    expect(emptyHearts).toHaveLength(2)
  })

  it('renders all hearts empty when lives is 0', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 0, maxLives: 3 },
    })
    const filledHearts = wrapper.findAll('.lives-display__heart--filled')
    const emptyHearts = wrapper.findAll('.lives-display__heart--empty')
    expect(filledHearts).toHaveLength(0)
    expect(emptyHearts).toHaveLength(3)
  })

  it('renders all hearts filled when lives equals maxLives', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 5, maxLives: 5 },
    })
    const filledHearts = wrapper.findAll('.lives-display__heart--filled')
    const emptyHearts = wrapper.findAll('.lives-display__heart--empty')
    expect(filledHearts).toHaveLength(5)
    expect(emptyHearts).toHaveLength(0)
  })

  it('has correct ARIA label', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 2, maxLives: 3 },
    })
    const container = wrapper.find('.lives-display')
    expect(container.attributes('aria-label')).toBe('2 of 3 lives remaining')
  })

  it('defaults to maxLives of 3', () => {
    const wrapper = mount(LivesDisplay, {
      props: { lives: 2 },
    })
    const totalHearts = wrapper.findAll('.lives-display__heart')
    expect(totalHearts).toHaveLength(3)
  })
})
