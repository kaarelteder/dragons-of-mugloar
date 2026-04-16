<script setup lang="ts">
  import type { GameEvent, GameEventType } from '@/shared/types'

  interface Props {
    event: GameEvent | null
    centerX?: number
  }

  defineProps<Props>()

  const emit = defineEmits<{
    dismiss: [id: string]
  }>()

  const CONFIG: Record<GameEventType, { icon: string; title: string }> = {
    'quest-success': { icon: '⚔️', title: 'Quest Completed' },
    'quest-failure': { icon: '💀', title: 'Quest Failed' },
    'shop-purchase': { icon: '🛒', title: 'Item Purchased' },
  }
</script>

<template>
  <Teleport to="body">
    <div
      class="banner-container"
      :style="centerX !== undefined ? { left: `${centerX}px` } : {}"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Transition name="banner" mode="out-in">
        <button
          v-if="event"
          :key="event.id"
          :class="['banner', `banner--${event.type}`]"
          type="button"
          role="status"
          @click.stop="emit('dismiss', event.id)"
        >
          <span class="banner__icon" aria-hidden="true">{{ CONFIG[event.type].icon }}</span>
          <p class="banner__title">
            {{ CONFIG[event.type].title }}
          </p>
          <p class="banner__message">
            {{ event.message }}
          </p>
        </button>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .banner-container {
    position: fixed;
    top: 22%;
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-toast);
    pointer-events: none;
    width: 360px;
    max-width: calc(100vw - calc(var(--spacing-xl) * 2));
    min-height: 1px;
    isolation: isolate;
    will-change: transform;
  }

  .banner {
    appearance: none;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding: var(--spacing-lg) var(--spacing-xl);
    border-radius: var(--radius-xl);
    border: 1.5px solid transparent;
    text-align: center;
    pointer-events: auto;
    cursor: pointer;
    background: var(--color-card-bg);
    box-shadow: var(--shadow-modal);

    &__icon {
      display: block;
      font-size: 2.5rem;
      margin-bottom: var(--spacing-sm);
      line-height: 1;
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0 0 var(--spacing-xs);
      color: var(--color-text);
    }

    &__message {
      font-size: 0.88rem;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.4;
    }

    &--quest-success {
      border-color: rgba(245, 200, 66, 0.6);
      background: linear-gradient(160deg, #1a2815 0%, var(--color-card-bg) 60%);
      animation:
        bannerDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
        successGlow 0.9s ease 0.5s 2;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }

      .banner__title {
        color: var(--color-gold);
      }
    }

    &--quest-failure {
      border-color: rgba(229, 57, 53, 0.6);
      background: linear-gradient(160deg, #1f1010 0%, var(--color-card-bg) 60%);
      animation:
        bannerDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
        failureRumble 0.5s ease 0.45s;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }

      .banner__title {
        color: var(--color-danger);
      }
    }

    &--shop-purchase {
      border-color: rgba(156, 39, 176, 0.6);
      background: linear-gradient(160deg, #16101f 0%, var(--color-card-bg) 60%);
      animation: bannerDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      box-shadow:
        0 0 12px rgba(156, 39, 176, 0.25),
        var(--shadow-modal);

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }

      .banner__title {
        color: #ce93d8;
      }
    }
  }

  .banner-enter-active {
    animation-duration: 0.5s;
    will-change: transform, opacity;
  }

  .banner-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    will-change: opacity, transform;
  }

  .banner-leave-to {
    opacity: 0;
    transform: translateY(-16px) scale(0.96);
  }
</style>
