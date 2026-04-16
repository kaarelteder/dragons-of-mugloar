<script setup lang="ts">
  import { onMounted, ref, computed, nextTick } from 'vue'
  import AdCard from './AdCard.vue'
  import AdAdvisorPanel from './AdAdvisorPanel.vue'
  import GameExpiredState from '@/shared/components/GameExpiredState.vue'
  import Spinner from '@/shared/components/Spinner.vue'
  import { isGameExpiredError } from '@/shared/api/errorHandling'
  import { useAds } from '@/features/ads/composables/useAds'
  import { useAdAdvisor } from '@/features/ads/composables/useAdAdvisor'
  import { useGameStore } from '@/features/game/store/gameStore'
  import { useAdvisorPreferencesStore } from '@/features/ads/store/advisorPreferencesStore'
  import { ANIMATION_DURATIONS } from '@/shared/constants/animation'
  import type { SortMode } from '@/features/ads/composables/useAds'
  import type { GameState, PlaystylePreference } from '@/shared/types'

  const emit = defineEmits<{
    solve: [adId: string, decodedId: string]
  }>()

  interface Props {
    solvingAdId?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    solvingAdId: null,
  })

  const { sortedAds, sortMode, loading, error, loadAds } = useAds()
  const gameStore = useGameStore()
  const advisorPreferencesStore = useAdvisorPreferencesStore()

  onMounted(() => {
    loadAds()
  })

  const gameState = computed<GameState>(() => ({
    gameId: gameStore.gameId || '',
    lives: gameStore.lives,
    gold: gameStore.gold,
    level: gameStore.level,
    score: gameStore.score,
    highScore: gameStore.highScore,
    turn: gameStore.turn,
  }))

  const { topRecommendations, isRecommended, getRank } = useAdAdvisor(
    () => sortedAds.value,
    () => gameState.value,
    () => advisorPreferencesStore.playstyle as PlaystylePreference
  )

  const sortOptions: { label: string; value: SortMode }[] = [
    { label: 'Best EV', value: 'ev' },
    { label: 'Reward', value: 'reward' },
    { label: 'Expiry', value: 'expiry' },
    { label: 'Safety', value: 'safety' },
  ]

  const handleSolve = (adId: string, decodedId: string): void => {
    emit('solve', adId, decodedId)
  }

  const hiddenAdIds = ref<string[]>([])
  const cardRefs = ref<Map<string, InstanceType<typeof AdCard>>>(new Map())
  const showExpiredState = computed(() => Boolean(error.value && isGameExpiredError(error.value)))

  const visibleAds = computed(() =>
    sortedAds.value.filter((ad) => !hiddenAdIds.value.includes(ad.adId))
  )

  const setCardRef = (adId: string, element: InstanceType<typeof AdCard> | null): void => {
    if (!element) {
      cardRefs.value.delete(adId)
      return
    }
    cardRefs.value.set(adId, element)
  }

  const animateSolvedExit = async (adId: string, isSuccess: boolean): Promise<void> => {
    const card = cardRefs.value.get(adId)
    if (card) {
      card.setStatus(isSuccess ? 'success' : 'failure')
    }

    await new Promise((resolve) => {
      window.setTimeout(
        resolve,
        isSuccess ? ANIMATION_DURATIONS.CARD_SUCCESS_EXIT : ANIMATION_DURATIONS.CARD_FAILURE_EXIT
      )
    })

    hiddenAdIds.value = [...hiddenAdIds.value, adId]
    await nextTick()

    await new Promise((resolve) => {
      window.setTimeout(resolve, ANIMATION_DURATIONS.CARD_LEAVE_SETTLE)
    })
  }

  const reload = async (): Promise<void> => {
    await loadAds()
    hiddenAdIds.value = hiddenAdIds.value.filter((adId) =>
      sortedAds.value.some((ad) => ad.adId === adId)
    )
  }

  const mainEl = ref<HTMLElement | null>(null)

  defineExpose({ reload, mainEl, animateSolvedExit })
</script>

<template>
  <div class="ad-board">
    <div class="ad-board__sidebar">
      <AdAdvisorPanel :recommendations="topRecommendations" @solve="handleSolve" />
    </div>

    <div ref="mainEl" class="ad-board__main">
      <div class="ad-board__toolbar">
        <h2 class="ad-board__heading">Available Quests</h2>
        <div class="ad-board__sort">
          <span class="ad-board__sort-label">Sort by:</span>
          <div class="ad-board__sort-options">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="[
                'ad-board__sort-btn',
                { 'ad-board__sort-btn--active': sortMode === opt.value },
              ]"
              @click="sortMode = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="ad-board__state">
        <Spinner size="lg" />
        <p>Fetching quests from the realm...</p>
      </div>
      <div v-else-if="error" class="ad-board__state ad-board__state--error">
        <GameExpiredState v-if="showExpiredState" />
        <p v-else>
          {{ error }}
        </p>
      </div>
      <div v-else-if="!sortedAds.length" class="ad-board__state">
        <p class="ad-board__empty">No quests available at this time.</p>
      </div>
      <TransitionGroup v-else name="ad-card" tag="div" class="ad-board__grid">
        <AdCard
          v-for="ad in visibleAds"
          :key="ad.adId"
          :ref="(el) => setCardRef(ad.adId, (el as InstanceType<typeof AdCard> | null) ?? null)"
          :ad="ad"
          :rank="getRank(ad.adId)"
          :recommended="isRecommended(ad.adId)"
          :solving="props.solvingAdId === ad.adId"
          @solve="handleSolve"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .ad-board {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--spacing-xl);
    align-items: start;

    @include responsive-below(lg) {
      grid-template-columns: 1fr;
    }

    &__sidebar {
      position: sticky;
      top: calc(var(--header-height) + 62px + var(--spacing-xl));
      opacity: 0.92;
      transition: opacity var(--transition-fast);

      &:hover {
        opacity: 1;
      }

      @include responsive-below(xl) {
        position: static;
        top: auto;
        opacity: 1;
      }

      @include responsive-below(lg) {
        position: static;
      }
    }

    &__main {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    &__toolbar {
      @include flex-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    &__heading {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      color: var(--color-text);
    }

    &__sort {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    &__sort-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    &__sort-options {
      display: flex;
      gap: 4px;
      background: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 3px;
    }

    &__sort-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 0.78rem;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition:
        background var(--transition-fast),
        color var(--transition-fast);
      white-space: nowrap;

      &:hover {
        color: var(--color-text);
      }

      &--active {
        background: rgba(245, 200, 66, 0.15);
        color: var(--color-gold);
      }
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);
      align-items: stretch;
      align-content: start;
    }

    &__state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      color: var(--color-text-muted);
      text-align: center;

      &--error {
        color: var(--color-danger);
      }
    }

    &__retry {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      cursor: pointer;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      transition:
        color var(--transition-fast),
        border-color var(--transition-fast);

      &:hover {
        color: var(--color-text);
        border-color: var(--color-gold);
      }
    }

    &__empty {
      font-size: 1.1rem;
    }
  }
  .ad-card-enter-active {
    transition:
      opacity 0.22s ease-out,
      transform 0.22s ease-out;
    transition-delay: var(--ad-enter-delay, 0ms);
    will-change: opacity, transform;
  }

  .ad-card-enter-from {
    opacity: 0;
    transform: translate3d(0, 6px, 0);
  }

  .ad-card-move {
    transition: transform 0.2s ease-out;
    will-change: transform;
  }

  .ad-card-leave-active {
    transition:
      opacity 0.2s linear,
      transform 0.2s ease-in;
    will-change: opacity, transform;
  }

  .ad-card-leave-to {
    opacity: 0;
    transform: translate3d(0, -12px, 0) scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .ad-card-enter-active,
    .ad-card-leave-active,
    .ad-card-move {
      transition: none;
    }
  }
</style>
