<script setup lang="ts">
  import LivesDisplay from './LivesDisplay.vue'
  import GoldDisplay from './GoldDisplay.vue'
  import ScoreDisplay from './ScoreDisplay.vue'
  import TurnCounter from './TurnCounter.vue'
  import { useHud } from '@/features/hud/composables/useHud'
  import { GAME_CONFIG } from '@/features/game/store/gameStore'
  import Button from '@/shared/components/Button.vue'

  const emit = defineEmits<{
    openShop: []
    openLegend: []
  }>()

  const { lives, gold, score, highScore, turn, level } = useHud()
</script>

<template>
  <div class="player-hud">
    <div class="container player-hud__inner">
      <LivesDisplay :lives="lives" :max-lives="Math.max(GAME_CONFIG.MAX_LIVES, lives)" />
      <GoldDisplay :gold="gold" />
      <ScoreDisplay :score="score" :high-score="highScore" :target="GAME_CONFIG.SCORE_TARGET" />
      <TurnCounter :turn="turn" :level="level" />
      <div class="player-hud__actions">
        <Button
          class="player-hud__legend-btn"
          variant="ghost"
          size="sm"
          aria-label="Open metrics and game legend"
          title="Legend"
          @click="emit('openLegend')"
        >
          <span aria-hidden="true">❓</span>
        </Button>
        <Button variant="secondary" size="sm" @click="emit('openShop')">
          <span aria-hidden="true">🛒</span>
          Shop
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .player-hud {
    position: sticky;
    top: var(--header-height);
    z-index: calc(var(--z-dropdown) - 1);
    background: rgba(26, 24, 37, 0.95);
    border-bottom: 1px solid var(--color-border);
    backdrop-filter: blur(8px);

    &__inner {
      @include flex-between;
      height: 60px;
      gap: 2.5rem;
      flex-wrap: wrap;
      align-items: center;
      transition: height 0.2s ease;

      @include responsive-below(md) {
        gap: var(--spacing-lg);
        padding: var(--spacing-sm) var(--spacing-lg);
        height: auto;
      }

      @include responsive-below(sm) {
        gap: 1rem;
        padding: var(--spacing-xs) var(--spacing-md);
      }
    }

    &__actions {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-left: auto;

      @include responsive-below(sm) {
        gap: 2px;
      }
    }

    &__legend-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      padding: 0;
      border-radius: 50%;
      color: var(--color-text-muted);

      &:hover {
        color: var(--color-gold);
      }

      &:focus-visible {
        outline: 2px solid var(--color-gold);
        outline-offset: 2px;
      }

      @include responsive-below(sm) {
        width: 28px;
        height: 28px;
        min-width: 28px;
        font-size: 0.9rem;
      }
    }
  }
</style>
