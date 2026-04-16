<template>
  <span
    ref="triggerRef"
    class="tooltip-wrapper"
    tabindex="0"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
    @focus="openTooltip"
    @blur="closeTooltip"
  >
    <slot />
  </span>

  <Teleport to="body">
    <span v-if="show" ref="tooltipRef" class="tooltip" role="tooltip" :style="tooltipStyle">
      {{ props.text }}
    </span>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

  const props = defineProps<{ text: string }>()

  const show = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)
  const tooltipRef = ref<HTMLElement | null>(null)
  const tooltipLeft = ref(0)
  const tooltipTop = ref(0)
  const listenersAttached = ref(false)
  const frameId = ref<number | null>(null)

  const OFFSET = 10
  const EDGE_PADDING = 10

  const tooltipStyle = computed(() => ({
    left: `${tooltipLeft.value}px`,
    top: `${tooltipTop.value}px`,
  }))

  const openTooltip = async (): Promise<void> => {
    show.value = true
    attachViewportListeners()
    await nextTick()
    updatePosition()
  }

  const closeTooltip = (): void => {
    show.value = false
    detachViewportListeners()
  }

  const updatePosition = (): void => {
    const trigger = triggerRef.value
    const tooltip = tooltipRef.value
    if (!trigger || !tooltip) {
      return
    }

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
    const minLeft = EDGE_PADDING
    const maxLeft = viewportWidth - tooltipRect.width - EDGE_PADDING
    left = Math.max(minLeft, Math.min(left, maxLeft))

    const topAbove = triggerRect.top - tooltipRect.height - OFFSET
    const topBelow = triggerRect.bottom + OFFSET
    const hasSpaceAbove = topAbove >= EDGE_PADDING
    let top = hasSpaceAbove ? topAbove : topBelow

    if (top + tooltipRect.height > viewportHeight - EDGE_PADDING) {
      top = Math.max(EDGE_PADDING, viewportHeight - tooltipRect.height - EDGE_PADDING)
    }

    tooltipLeft.value = left
    tooltipTop.value = top
  }

  const handleViewportChange = (): void => {
    if (!show.value) {
      return
    }
    if (frameId.value !== null) {
      return
    }

    frameId.value = window.requestAnimationFrame(() => {
      frameId.value = null
      updatePosition()
    })
  }

  const attachViewportListeners = (): void => {
    if (listenersAttached.value) {
      return
    }

    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('resize', handleViewportChange)
    listenersAttached.value = true
  }

  const detachViewportListeners = (): void => {
    if (!listenersAttached.value) {
      return
    }

    window.removeEventListener('scroll', handleViewportChange, true)
    window.removeEventListener('resize', handleViewportChange)
    listenersAttached.value = false

    if (frameId.value !== null) {
      window.cancelAnimationFrame(frameId.value)
      frameId.value = null
    }
  }

  onBeforeUnmount(() => {
    detachViewportListeners()
  })
</script>

<style scoped>
  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .tooltip {
    position: fixed;
    z-index: 1000;
    background: #222;
    color: #fff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    line-height: 1.25;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    opacity: 0.95;
    max-width: min(320px, calc(100vw - 20px));
  }
</style>
