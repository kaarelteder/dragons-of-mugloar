<script setup lang="ts">
  import { useGameStore } from '@/features/game/store/gameStore'
  import Modal from '@/shared/components/Modal.vue'
  import Button from '@/shared/components/Button.vue'

  const gameStore = useGameStore()

  const emit = defineEmits<{
    close: []
    restart: []
  }>()
</script>

<template>
  <Modal title="Game Over" :closeable="false">
    <div class="game-over">
      <div class="game-over__skull" aria-hidden="true">
        <span class="game-over__skull--animated">💀</span>
      </div>
      <h3 class="game-over__subtitle">
        <span class="game-over__subtitle--animated">Your dragon has fallen...</span>
      </h3>
      <p class="game-over__message">
        <span class="game-over__message--animated"
          >The quest is over. You lived to turn {{ gameStore.turn }} and scored
          <strong class="text-gold">{{ gameStore.score }}</strong> points.
        </span>
      </p>

      <div class="game-over__stats">
        <div class="game-over__stat game-over__stat--animated" style="animation-delay: 0.55s">
          <span class="game-over__stat-label">Final Score</span>
          <span class="game-over__stat-value text-gold">{{ gameStore.score }}</span>
        </div>
        <div class="game-over__stat game-over__stat--animated" style="animation-delay: 0.65s">
          <span class="game-over__stat-label">High Score</span>
          <span class="game-over__stat-value">{{ gameStore.highScore }}</span>
        </div>
        <div class="game-over__stat game-over__stat--animated" style="animation-delay: 0.75s">
          <span class="game-over__stat-label">Level Reached</span>
          <span class="game-over__stat-value">{{ gameStore.level }}</span>
        </div>
        <div class="game-over__stat game-over__stat--animated" style="animation-delay: 0.85s">
          <span class="game-over__stat-label">Turns Survived</span>
          <span class="game-over__stat-value">{{ gameStore.turn }}</span>
        </div>
      </div>

      <div class="game-over__actions">
        <div class="game-over__actions--animated">
          <Button variant="primary" size="lg" @click="emit('restart')"> Play Again </Button>
        </div>
        <Button variant="ghost" @click="emit('close')"> View History </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .game-over {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    text-align: center;

    &__skull {
      font-size: 4rem;
      animation: fadeIn 0.5s ease both;
    }

    &__subtitle {
      font-family: var(--font-heading);
      color: var(--color-danger);
      font-size: 1.2rem;
    }

    &__message {
      color: var(--color-text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    &__stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
      width: 100%;
      background: rgba(15, 14, 23, 0.5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
    }

    &__stat {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    &__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
    }

    &__stat-value {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: var(--color-text);
    }

    &__actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.7);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .game-over__skull--animated {
    display: block;
    animation: skullPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    will-change: transform, opacity;
  }

  .game-over__subtitle--animated {
    display: block;
    animation: subtitleSlide 0.6s ease 0.15s both;
    will-change: opacity, transform;
  }

  .game-over__message--animated {
    display: block;
    animation: messageFade 0.6s ease 0.3s both;
    will-change: opacity, transform;
  }

  .game-over__stats--animated {
    animation: statsFade 0.6s ease 0.45s both;
    will-change: opacity, transform;
  }

  .game-over__stat--animated {
    animation: statItemSlide 0.5s ease forwards;
    will-change: opacity, transform;

    &:nth-child(1) {
      animation-delay: 0.55s;
    }

    &:nth-child(2) {
      animation-delay: 0.65s;
    }

    &:nth-child(3) {
      animation-delay: 0.75s;
    }

    &:nth-child(4) {
      animation-delay: 0.85s;
    }
  }

  .game-over__actions--animated {
    animation: actionsFade 0.6s ease 0.95s both;
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
    will-change: opacity, transform;
  }

  @keyframes skullPulse {
    from {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) rotate(0deg);
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes subtitleSlide {
    from {
      transform: translateY(-12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes messageFade {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes statsFade {
    from {
      transform: translateY(8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes statItemSlide {
    from {
      transform: translateX(-8px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes actionsFade {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .game-over-modal {
    will-change: opacity, transform;
  }
</style>
