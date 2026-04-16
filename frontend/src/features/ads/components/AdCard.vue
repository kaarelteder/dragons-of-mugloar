<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { AdWithEV } from '@/shared/types'
  import ProbabilityBadge from './ProbabilityBadge.vue'
  import UrgencyBar from './UrgencyBar.vue'
  import EvDisplay from './EvDisplay.vue'
  import Button from '@/shared/components/Button.vue'
  import Tooltip from '@/shared/components/Tooltip.vue'
  import { ANIMATION_DURATIONS } from '@/shared/constants/animation'

  interface Props {
    ad: AdWithEV
    recommended?: boolean
    rank?: number
    solving?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    recommended: false,
    rank: 0,
    solving: false,
  })

  const emit = defineEmits<{
    solve: [adId: string, decodedId: string]
  }>()

  const status = ref<'idle' | 'success' | 'failure'>('idle')

  const cardClass = computed(() => ({
    'ad-card': true,
    'ad-card--recommended': props.recommended,
    'ad-card--success': status.value === 'success',
    'ad-card--failure': status.value === 'failure',
    'ad-card--urgent': props.ad.expiresIn <= 1,
  }))

  const handleSolve = (): void => {
    emit('solve', props.ad.adId, props.ad.decodedId)
  }

  const setStatus = (newStatus: 'success' | 'failure'): void => {
    status.value = newStatus
    setTimeout(() => {
      status.value = 'idle'
    }, ANIMATION_DURATIONS.CARD_STATUS_RESET)
  }

  defineExpose({ setStatus })
</script>

<template>
  <div :class="cardClass">
    <div v-if="recommended" class="ad-card__recommended-badge">
      <Tooltip text="Advisor's top pick">
        <span>✓ Advisor Pick</span>
      </Tooltip>
      <Tooltip v-if="rank" text="Recommendation rank">
        <span class="ad-card__rank">#{{ rank }}</span>
      </Tooltip>
    </div>

    <div class="ad-card__decision-row">
      <Tooltip text="Expected Value: average gold you can expect to win">
        <EvDisplay :ev="ad.ev" :reward="ad.reward" :probability-rate="ad.probabilityRate" />
      </Tooltip>
      <div class="ad-card__signals">
        <Tooltip text="Probability of success">
          <ProbabilityBadge :probability="ad.probability" />
        </Tooltip>
        <Tooltip
          :text="
            ad.expiresIn === 1
              ? 'This is the last turn to solve this quest'
              : 'Turns left before quest expires'
          "
        >
          <span class="ad-card__expiry" :class="{ 'ad-card__expiry--urgent': ad.expiresIn <= 1 }">
            {{ ad.expiresIn === 1 ? 'Last turn' : `${ad.expiresIn} turns left` }}
          </span>
        </Tooltip>
      </div>
    </div>

    <p class="ad-card__message">
      {{ ad.message }}
    </p>

    <div class="ad-card__footer">
      <div class="ad-card__metrics">
        <Tooltip text="Gold reward if successful">
          <span class="ad-card__reward">
            <span class="ad-card__reward-icon" aria-hidden="true">🪙</span>
            <span class="ad-card__reward-value">{{ ad.reward }}g</span>
          </span>
        </Tooltip>
      </div>

      <Button
        size="sm"
        :variant="recommended ? 'primary' : 'secondary'"
        :loading="solving"
        :disabled="solving"
        @click="handleSolve"
      >
        {{ solving ? 'Solving...' : 'Accept Quest' }}
      </Button>
    </div>

    <UrgencyBar :expires-in="ad.expiresIn" />
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .ad-card {
    @include card-base;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    overflow: hidden;
    transition:
      border-color var(--transition-normal),
      box-shadow 0.22s ease,
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    transform: translateZ(0);
    backface-visibility: hidden;

    &:hover {
      border-color: rgba(245, 200, 66, 0.25);
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    &--recommended {
      border-color: rgba(245, 200, 66, 0.5);
      box-shadow:
        var(--shadow-card),
        0 0 20px rgba(245, 200, 66, 0.15);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
      }
    }

    &--success {
      animation: cardSuccess 0.7s ease forwards;
    }

    &--failure {
      animation: cardFailure 0.6s ease;
    }

    &--urgent {
      border-color: rgba(229, 57, 53, 0.3);
    }

    &__recommended-badge {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      background: rgba(245, 200, 66, 0.15);
      border: 1px solid rgba(245, 200, 66, 0.4);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--color-gold);
    }

    &__rank {
      font-size: 0.65rem;
      opacity: 0.8;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    &__decision-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      padding-right: var(--spacing-lg);
    }

    &__signals {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    &__expiry {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(46, 42, 69, 0.8);
      font-size: 0.72rem;
      color: var(--color-text-muted);
      background: rgba(15, 14, 23, 0.35);

      &--urgent {
        color: var(--color-danger);
        border-color: rgba(229, 57, 53, 0.5);
        background: rgba(229, 57, 53, 0.14);
        font-weight: 600;
      }
    }

    &__message {
      font-size: 0.9rem;
      color: var(--color-text);
      line-height: 1.5;
      flex: 1;
      min-height: 2.9em;
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      margin-top: auto;
    }

    &__metrics {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    &__reward {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &__reward-icon {
      font-size: 0.85rem;
    }

    &__reward-value {
      font-weight: 700;
      color: var(--color-gold);
      font-size: 0.9rem;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: border-color var(--transition-fast);

      &:hover {
        transform: none;
      }

      &--success,
      &--failure {
        animation: none;
      }
    }
  }
</style>
