<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import AdBoard from '@/features/ads/components/AdBoard.vue'
  import PlayerHud from '@/features/hud/components/PlayerHud.vue'
  import ShopPanel from '@/features/shop/components/ShopPanel.vue'
  import GameOverModal from '@/features/game/components/GameOverModal.vue'
  import GameEventBanner from '@/shared/components/GameEventBanner.vue'
  import LegendModal from '@/features/ads/components/LegendModal.vue'
  import ErrorBoundary from '@/shared/components/ErrorBoundary.vue'
  import { useGame } from '@/features/game/composables/useGame'
  import { ANIMATION_DURATIONS } from '@/shared/constants/animation'
  import type { GameEvent, ShopItem } from '@/shared/types'

  const router = useRouter()
  const { showGameOver, solveAd, dismissGameOver } = useGame()

  const adBoardRef = ref<InstanceType<typeof AdBoard> | null>(null)
  const shopOpen = ref(false)
  const solvingAdId = ref<string | null>(null)
  const gameEvent = ref<GameEvent | null>(null)
  const gameEventDismissTimeout = ref<number | undefined>(undefined)
  const gameEventSequence = ref(0)
  const bannerCenterX = ref<number | undefined>(undefined)
  const showLegend = ref(false)
  const resizeFrameId = ref<number | null>(null)

  const clearGameEventDismissTimeout = (): void => {
    if (gameEventDismissTimeout.value === undefined) {
      return
    }

    window.clearTimeout(gameEventDismissTimeout.value)
    gameEventDismissTimeout.value = undefined
  }

  const updateBannerCenter = (): void => {
    const el = adBoardRef.value?.mainEl
    if (!el) return
    const rect = el.getBoundingClientRect()
    const newCenter = rect.left + rect.width / 2
    if (newCenter !== bannerCenterX.value) {
      bannerCenterX.value = newCenter
    }
  }

  const scheduleBannerCenterUpdate = (): void => {
    if (resizeFrameId.value !== null) {
      return
    }

    resizeFrameId.value = window.requestAnimationFrame(() => {
      resizeFrameId.value = null
      updateBannerCenter()
    })
  }

  onMounted(() => {
    updateBannerCenter()
    window.addEventListener('resize', scheduleBannerCenterUpdate)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', scheduleBannerCenterUpdate)

    if (resizeFrameId.value !== null) {
      window.cancelAnimationFrame(resizeFrameId.value)
      resizeFrameId.value = null
    }

    clearGameEventDismissTimeout()
  })

  const addGameEvent = async (
    event: Omit<GameEvent, 'id'>,
    duration = ANIMATION_DURATIONS.GAME_EVENT_BANNER
  ): Promise<void> => {
    gameEventSequence.value += 1
    const sequence = gameEventSequence.value
    const id = String(sequence)

    clearGameEventDismissTimeout()

    if (gameEvent.value) {
      gameEvent.value = null
      await nextTick()
      if (sequence !== gameEventSequence.value) {
        return
      }
    }

    gameEvent.value = { id, ...event }
    gameEventDismissTimeout.value = window.setTimeout(() => {
      if (sequence !== gameEventSequence.value) {
        return
      }
      dismissGameEvent(id)
    }, duration)
  }

  const dismissGameEvent = (id: string): void => {
    if (gameEvent.value?.id !== id) {
      return
    }

    clearGameEventDismissTimeout()

    gameEvent.value = null
  }

  watch(showGameOver, (isGameOver) => {
    if (!isGameOver) {
      return
    }

    clearGameEventDismissTimeout()

    gameEvent.value = null
  })

  const handleSolve = async (adId: string, decodedId: string): Promise<void> => {
    solvingAdId.value = adId
    const result = await solveAd(decodedId)

    if (result) {
      await adBoardRef.value?.animateSolvedExit(adId, result.success)

      if (result.success) {
        addGameEvent({
          type: 'quest-success',
          message: result.message || 'Well done, the quest is yours!',
        })
      } else {
        addGameEvent({
          type: 'quest-failure',
          message: result.message || 'You have fallen. A life was lost.',
        })
      }
      await adBoardRef.value?.reload()
    }

    solvingAdId.value = null
  }

  const handleShopBought = (item: ShopItem): void => {
    addGameEvent({ type: 'shop-purchase', message: item.name })
  }

  const handleGameOverClose = (): void => {
    dismissGameOver()
    router.push('/history')
  }

  const handleRestart = (): void => {
    dismissGameOver()
    router.push('/')
  }
</script>

<template>
  <ErrorBoundary
    fallback-title="Game Error"
    fallback-message="An error occurred during gameplay. Please try again."
  >
    <div class="game-page">
      <Transition name="game-enter" appear>
        <PlayerHud
          class="game-page__hud--animated"
          @open-legend="showLegend = true"
          @open-shop="shopOpen = true"
        />
      </Transition>

      <main class="game-page__content container">
        <Transition name="game-content-enter" appear>
          <AdBoard
            ref="adBoardRef"
            class="game-page__board--animated"
            :solving-ad-id="solvingAdId"
            @solve="handleSolve"
          />
        </Transition>
      </main>

      <Transition name="slide-shop">
        <ShopPanel v-if="shopOpen" @close="shopOpen = false" @bought="handleShopBought" />
      </Transition>

      <GameOverModal v-if="showGameOver" @close="handleGameOverClose" @restart="handleRestart" />

      <LegendModal v-if="showLegend" @close="showLegend = false" />

      <GameEventBanner
        v-if="!showGameOver"
        :event="gameEvent"
        :center-x="bannerCenterX"
        @dismiss="dismissGameEvent"
      />
    </div>
  </ErrorBoundary>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .game-page {
    min-height: calc(100vh - var(--header-height));
    display: flex;
    flex-direction: column;

    &__content {
      flex: 1;
      padding-top: var(--spacing-xl);
      padding-bottom: var(--spacing-xl);
    }

    &__hud--animated {
    }

    &__board--animated {
    }
  }

  .game-enter-enter-active {
    will-change: opacity, transform;
    transition:
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .game-enter-enter-from {
    transform: translateY(-40px);
    opacity: 0;
  }

  .game-content-enter-enter-active {
    will-change: opacity, transform;
    transition:
      transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition-delay: 0.3s;
  }

  .game-content-enter-enter-from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }

  .slide-shop-enter-active,
  .slide-shop-leave-active {
    transition:
      transform 0.35s ease,
      opacity 0.35s ease;
  }

  .slide-shop-enter-from,
  .slide-shop-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
</style>
