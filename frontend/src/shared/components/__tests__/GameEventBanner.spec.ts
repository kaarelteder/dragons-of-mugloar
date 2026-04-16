import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameEventBanner from '@/shared/components/GameEventBanner.vue'
import type { GameEvent } from '@/shared/types'

const stubs = {
  Teleport: { template: '<div><slot /></div>' },
  Transition: { template: '<div><slot /></div>' },
}

function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return { id: '1', type: 'quest-success', message: 'Well done!', ...overrides }
}

describe('GameEventBanner', () => {
  it('renders nothing when event is null', () => {
    const wrapper = mount(GameEventBanner, {
      props: { event: null },
      global: { stubs },
    })
    expect(wrapper.findAll('.banner')).toHaveLength(0)
  })

  it('renders correct icon, title and message for quest-success', () => {
    const wrapper = mount(GameEventBanner, {
      props: { event: makeEvent({ type: 'quest-success', message: 'Victory!' }) },
      global: { stubs },
    })
    const banner = wrapper.find('.banner--quest-success')
    expect(banner.exists()).toBe(true)
    expect(banner.find('.banner__icon').text()).toBe('⚔️')
    expect(banner.find('.banner__title').text()).toBe('Quest Completed')
    expect(banner.find('.banner__message').text()).toBe('Victory!')
  })

  it('renders correct icon, title and message for quest-failure', () => {
    const wrapper = mount(GameEventBanner, {
      props: { event: makeEvent({ type: 'quest-failure', message: 'You lost a life.' }) },
      global: { stubs },
    })
    const banner = wrapper.find('.banner--quest-failure')
    expect(banner.exists()).toBe(true)
    expect(banner.find('.banner__icon').text()).toBe('💀')
    expect(banner.find('.banner__title').text()).toBe('Quest Failed')
    expect(banner.find('.banner__message').text()).toBe('You lost a life.')
  })

  it('renders correct icon, title and message for shop-purchase', () => {
    const wrapper = mount(GameEventBanner, {
      props: { event: makeEvent({ type: 'shop-purchase', message: 'Health Potion' }) },
      global: { stubs },
    })
    const banner = wrapper.find('.banner--shop-purchase')
    expect(banner.exists()).toBe(true)
    expect(banner.find('.banner__icon').text()).toBe('🛒')
    expect(banner.find('.banner__title').text()).toBe('Item Purchased')
    expect(banner.find('.banner__message').text()).toBe('Health Potion')
  })

  it('emits dismiss with the event id when banner is clicked', async () => {
    const event = makeEvent({ id: 'evt-42', type: 'quest-success' })
    const wrapper = mount(GameEventBanner, {
      props: { event },
      global: { stubs },
    })
    await wrapper.find('.banner').trigger('click')
    expect(wrapper.emitted('dismiss')).toEqual([['evt-42']])
  })

  it('renders exactly one banner when event exists', () => {
    const wrapper = mount(GameEventBanner, {
      props: { event: makeEvent({ id: '3', type: 'shop-purchase', message: 'Mana Potion' }) },
      global: { stubs },
    })
    expect(wrapper.findAll('.banner')).toHaveLength(1)
    expect(wrapper.find('.banner--shop-purchase').exists()).toBe(true)
    expect(wrapper.find('.banner__message').text()).toBe('Mana Potion')
  })
})
