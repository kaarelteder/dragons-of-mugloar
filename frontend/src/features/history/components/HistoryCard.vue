<script setup lang="ts">
  import type { GameRecord } from '@/shared/types'
  import { historyDateFormatter } from '@/features/history/composables/useHistory'

  interface Props {
    record: GameRecord
    rank: number
    isHighScore: boolean
  }

  defineProps<Props>()
</script>

<template>
  <div :class="['history-card', { 'history-card--top': isHighScore }]">
    <div class="history-card__rank">
      <span v-if="isHighScore" class="history-card__crown" aria-label="High Score">👑</span>
      <span v-else class="history-card__rank-num">#{{ rank }}</span>
    </div>

    <div class="history-card__info">
      <div class="history-card__score">
        <span class="history-card__score-value">{{ record.score }}</span>
        <span class="history-card__score-label">pts</span>
      </div>
      <div class="history-card__meta">
        <span class="history-card__meta-item">
          <span aria-hidden="true">⚔️</span> {{ record.turn }} turns
        </span>
        <span class="history-card__meta-item">
          <span aria-hidden="true">📈</span> Lvl {{ record.level }}
        </span>
        <span class="history-card__meta-item">
          <span aria-hidden="true">❤️</span> {{ record.lives }} lives
        </span>
      </div>
    </div>

    <div class="history-card__date">
      {{ historyDateFormatter.format(new Date(record.timestamp)) }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .history-card {
    @include card-base;
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    animation: fadeIn 0.3s ease both;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast);

    &:hover {
      transform: translateX(4px);
      border-color: rgba(245, 200, 66, 0.2);
    }

    &--top {
      border-color: rgba(245, 200, 66, 0.4);
      background: rgba(245, 200, 66, 0.05);
    }

    &__rank {
      width: 36px;
      text-align: center;
      flex-shrink: 0;
    }

    &__crown {
      font-size: 1.4rem;
    }

    &__rank-num {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    &__info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      flex-wrap: wrap;
    }

    &__score {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    &__score-value {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      color: var(--color-gold);
      font-weight: 700;
    }

    &__score-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    &__meta {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    &__meta-item {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &__date {
      font-size: 0.78rem;
      color: var(--color-text-muted);
      white-space: nowrap;
      flex-shrink: 0;

      @include responsive-below(sm) {
        display: none;
      }
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
