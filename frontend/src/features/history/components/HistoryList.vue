<script setup lang="ts">
  import HistoryCard from './HistoryCard.vue'
  import Button from '@/shared/components/Button.vue'
  import { useHistory } from '@/features/history/composables/useHistory'
  import { computed } from 'vue'

  const { records, highScore, hasRecords, clearHistory } = useHistory()

  const topScore = computed(() => highScore.value)
</script>

<template>
  <div class="history-list">
    <div class="history-list__header">
      <div>
        <h2 class="history-list__title">Hall of Fame</h2>
        <p v-if="hasRecords" class="history-list__subtitle">
          Best score: <strong class="text-gold">{{ topScore }}</strong> pts
        </p>
      </div>
      <Button v-if="hasRecords" variant="ghost" size="sm" @click="clearHistory">
        Clear History
      </Button>
    </div>

    <div v-if="!hasRecords" class="history-list__empty">
      <div class="history-list__empty-icon" aria-hidden="true">📜</div>
      <p>No quests completed yet. Start your adventure!</p>
    </div>

    <TransitionGroup v-else name="history-card" tag="div" class="history-list__items">
      <HistoryCard
        v-for="(record, idx) in records"
        :key="record.gameId + record.timestamp"
        :record="record"
        :rank="idx + 1"
        :is-high-score="record.score === topScore && idx === 0"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .history-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);

    &__header {
      @include flex-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      color: var(--color-gold);
    }

    &__subtitle {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin-top: var(--spacing-xs);
    }

    &__empty {
      @include flex-center;
      flex-direction: column;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      text-align: center;
      color: var(--color-text-muted);
    }

    &__empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    &__items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
  }

  .history-card-enter-active {
    transition:
      opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .history-card-enter-from {
    opacity: 0;
    transform: translateX(-16px);
  }

  .history-card-move {
    transition: transform 0.3s ease;
  }

  .history-card-leave-active {
    position: absolute;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .history-card-leave-to {
    opacity: 0;
    transform: translateX(-16px);
  }
</style>
