<script setup lang="ts">
  import { onMounted, onUnmounted, ref, nextTick } from 'vue'

  interface Props {
    title?: string
    closeable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    closeable: true,
  })

  const emit = defineEmits<{
    close: []
  }>()

  const scrollLockCount = ref(0)
  const originalOverflow = ref<string>('')

  const lockBodyScroll = (): void => {
    if (scrollLockCount.value === 0) {
      originalOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    scrollLockCount.value += 1
  }

  const unlockBodyScroll = (): void => {
    scrollLockCount.value = Math.max(0, scrollLockCount.value - 1)
    if (scrollLockCount.value === 0) {
      document.body.style.overflow = originalOverflow.value
    }
  }

  const modalRef = ref<HTMLElement | null>(null)
  let previouslyFocusedElement: Element | null = null

  const getFocusableElements = (): HTMLElement[] => {
    if (!modalRef.value) return []
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    return Array.from(modalRef.value.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('disabled')
    )
  }

  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && props.closeable) {
      handleClose()
      return
    }

    if (e.key === 'Tab') {
      const focusableEls = getFocusableElements()
      if (focusableEls.length === 0) return

      const currentIndex = focusableEls.indexOf(document.activeElement as HTMLElement)
      const lastIndex = focusableEls.length - 1

      if (e.shiftKey && currentIndex <= 0) {
        e.preventDefault()
        focusableEls[lastIndex]?.focus()
      } else if (!e.shiftKey && currentIndex >= lastIndex) {
        e.preventDefault()
        focusableEls[0]?.focus()
      }
    }
  }

  const handleClose = (): void => {
    if (props.closeable) {
      emit('close')
    }
  }

  const restoreFocus = async (): Promise<void> => {
    await nextTick()
    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus()
    }
  }

  onMounted(async () => {
    previouslyFocusedElement = document.activeElement
    lockBodyScroll()
    document.addEventListener('keydown', handleKeydown)

    await nextTick()
    const focusableEls = getFocusableElements()
    focusableEls[0]?.focus()
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    unlockBodyScroll()
    restoreFocus()
  })
</script>

<template>
  <Teleport to="body">
    <div class="modal__overlay" @click.self="handleClose">
      <div
        ref="modalRef"
        class="modal"
        role="dialog"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-label="!title ? 'Dialog' : undefined"
        aria-modal="true"
      >
        <div v-if="title || closeable" class="modal__header">
          <h2 v-if="title" id="modal-title" class="modal__title">
            {{ title }}
          </h2>
          <button
            v-if="closeable"
            class="modal__close"
            aria-label="Close dialog"
            type="button"
            @click="handleClose"
          >
            ✕
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .modal {
    background: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-modal);
    width: 90%;
    max-width: 640px;
    max-height: 90vh;
    overflow-y: auto;
    animation: fadeIn 0.3s ease both;

    @include scrollbar-dark;

    &__overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      @include flex-center;
    }

    &__header {
      @include flex-between;
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--color-border);
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: var(--color-gold);
      margin: 0;
    }

    &__close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-text);
      }
    }

    &__body {
      padding: var(--spacing-xl);
    }

    &__footer {
      padding: var(--spacing-md) var(--spacing-xl) var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }
  }
</style>
