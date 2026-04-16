<script setup lang="ts">
  import type { AdvisorRecommendation, PlaystylePreference } from '@/shared/types'
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import Tooltip from '@/shared/components/Tooltip.vue'
  import { useAdvisorPreferencesStore } from '@/features/ads/store/advisorPreferencesStore'

  interface Props {
    recommendations: AdvisorRecommendation[]
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    solve: [adId: string, decodedId: string]
  }>()

  const advisorStore = useAdvisorPreferencesStore()
  const showPlaystyleMenu = ref(false)
  const playstyleSelectorRef = ref<HTMLElement | null>(null)
  const activeOptionIndex = ref(-1)

  const labels = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
  const playstyles: PlaystylePreference[] = ['safe', 'balanced', 'aggressive']
  const playstyleLabels: Record<PlaystylePreference, string> = {
    safe: 'Safe',
    balanced: 'Balanced',
    aggressive: 'Aggressive',
  }

  const probabilityPercent = (rate: number): number => {
    return Math.round(rate * 100)
  }

  const RISK_ICONS: Record<string, string> = {
    safe: '✓',
    medium: '⚠',
    risky: '🔥',
    dangerous: '💀',
  }

  const getRiskIcon = (tier: string): string => RISK_ICONS[tier] ?? '?'

  const togglePlaystyleMenu = (): void => {
    showPlaystyleMenu.value = !showPlaystyleMenu.value
    if (showPlaystyleMenu.value) {
      activeOptionIndex.value = playstyles.indexOf(advisorStore.playstyle)
    }
  }

  const closePlaystyleMenu = (): void => {
    showPlaystyleMenu.value = false
    activeOptionIndex.value = -1
  }

  const onPlaystyleMenuKeydown = (event: KeyboardEvent): void => {
    if (!showPlaystyleMenu.value) return
    if (event.key === 'Escape') {
      closePlaystyleMenu()
      playstyleSelectorRef.value?.querySelector<HTMLElement>('button')?.focus()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeOptionIndex.value = (activeOptionIndex.value + 1) % playstyles.length
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeOptionIndex.value =
        (activeOptionIndex.value - 1 + playstyles.length) % playstyles.length
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (activeOptionIndex.value >= 0) {
        setPlaystyle(playstyles[activeOptionIndex.value])
      }
    }
  }

  const onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as Node | null
    if (!target) return

    if (playstyleSelectorRef.value && !playstyleSelectorRef.value.contains(target)) {
      closePlaystyleMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
  })

  const setPlaystyle = (style: PlaystylePreference): void => {
    advisorStore.setPlaystyle(style)
    closePlaystyleMenu()
  }
</script>

<template>
  <div v-if="recommendations.length" class="advisor-panel animate-fade-in">
    <div class="advisor-panel__header">
      <h3 class="advisor-panel__title">
        <span aria-hidden="true">🧙</span>
        Advisor
      </h3>
      <div ref="playstyleSelectorRef" class="playstyle-selector" @keydown="onPlaystyleMenuKeydown">
        <button
          type="button"
          class="playstyle-selector__button"
          :aria-expanded="showPlaystyleMenu"
          aria-haspopup="menu"
          :aria-label="`Advisor playstyle: ${playstyleLabels[advisorStore.playstyle]}`"
          @click="togglePlaystyleMenu"
        >
          {{ playstyleLabels[advisorStore.playstyle] }}
        </button>
        <div
          v-if="showPlaystyleMenu"
          class="playstyle-selector__menu"
          role="listbox"
          :aria-label="`Advisor playstyle`"
          :aria-activedescendant="
            activeOptionIndex >= 0 ? `playstyle-option-${playstyles[activeOptionIndex]}` : undefined
          "
        >
          <button
            v-for="(style, idx) in playstyles"
            :id="`playstyle-option-${style}`"
            :key="style"
            type="button"
            class="playstyle-selector__option"
            :class="{
              'playstyle-selector__option--active': advisorStore.playstyle === style,
              'playstyle-selector__option--focused': activeOptionIndex === idx,
            }"
            role="option"
            :aria-selected="advisorStore.playstyle === style"
            @click="setPlaystyle(style)"
            @mouseenter="activeOptionIndex = idx"
          >
            {{ playstyleLabels[style] }}
          </button>
        </div>
      </div>
    </div>

    <div class="advisor-panel__list">
      <div
        v-for="(ad, idx) in recommendations"
        :key="ad.adId"
        class="advisor-panel__item"
        :class="`advisor-panel__item--${ad.riskTier}`"
      >
        <div class="advisor-panel__topline">
          <div class="advisor-panel__left">
            <Tooltip text="Medal rank: higher is better">
              <span class="advisor-panel__medal" aria-hidden="true">{{ labels[idx] }}</span>
            </Tooltip>
            <Tooltip :text="`Risk: ${ad.riskTier.charAt(0).toUpperCase() + ad.riskTier.slice(1)}`">
              <div
                class="advisor-panel__risk-badge"
                :class="`advisor-panel__risk-badge--${ad.riskTier}`"
              >
                <span aria-hidden="true">{{ getRiskIcon(ad.riskTier) }}</span>
              </div>
            </Tooltip>
          </div>

          <p class="advisor-panel__formula">
            <Tooltip text="Expected Value: average gold you can expect to win">
              <strong class="advisor-panel__ev">EV {{ ad.ev }}g</strong>
            </Tooltip>
            <span class="advisor-panel__dot">•</span>
            <Tooltip text="Probability of success">
              <span>{{ probabilityPercent(ad.probabilityRate) }}%</span>
            </Tooltip>
          </p>
        </div>

        <p class="advisor-panel__message" :title="ad.message">
          {{ ad.message }}
        </p>

        <p v-if="ad.explanation" class="advisor-panel__explanation" :title="ad.riskReason">
          {{ ad.explanation }}
        </p>

        <p class="advisor-panel__details-row">
          <span>{{ ad.reward }}g reward</span>
          <span class="advisor-panel__dot">•</span>
          <span class="advisor-panel__risk-text">
            <span class="advisor-panel__risk-inline-icon" aria-hidden="true">{{
              getRiskIcon(ad.riskTier)
            }}</span>
            <span>{{ ad.riskTier }} risk</span>
          </span>
        </p>

        <div class="advisor-panel__actions">
          <button
            class="advisor-panel__quick-solve"
            :aria-label="`Quick solve: ${ad.message}`"
            @click="emit('solve', ad.adId, ad.decodedId)"
          >
            <span aria-hidden="true">⚔</span>
            Quick Solve
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .advisor-panel {
    @include card-base;
    padding: var(--spacing-lg);
    border-color: rgba(46, 42, 69, 0.8);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);
    }

    &__title {
      font-family: var(--font-heading);
      font-size: 0.82rem;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      line-height: 1.2;
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    &__item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      border: 1px solid rgba(46, 42, 69, 0.8);
      background: linear-gradient(135deg, rgba(26, 24, 37, 0.94), rgba(15, 14, 23, 0.88));
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.16);

      &:hover {
        border-color: rgba(245, 200, 66, 0.2);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
      }

      &--expanded {
        border-color: rgba(245, 200, 66, 0.3);
      }

      &--safe {
        border-left: 2px solid rgba(76, 175, 80, 0.75);
      }
      &--medium {
        border-left: 2px solid rgba(255, 152, 0, 0.75);
      }
      &--risky {
        border-left: 2px solid rgba(229, 57, 53, 0.75);
      }
      &--dangerous {
        border-left: 2px solid rgba(156, 39, 176, 0.75);
      }
    }

    &__dot {
      opacity: 0.5;
      margin: 0 4px;
      font-size: 0.7rem;
      vertical-align: middle;
    }

    &__details-row {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.2;
      text-transform: capitalize;
    }

    &__risk-text {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    &__risk-inline-icon {
      line-height: 1;
      font-size: 0.78rem;
    }

    &__topline {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
    }

    &__left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-shrink: 0;
    }

    &__medal {
      font-size: 1rem;
      flex-shrink: 0;
      opacity: 0.85;
    }

    &__risk-badge {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(46, 42, 69, 0.8);
      font-size: 0.8rem;
      cursor: help;
      background: rgba(255, 255, 255, 0.05);

      &--safe {
        color: var(--color-success);
      }

      &--medium {
        color: var(--color-warning);
      }

      &--risky {
        color: var(--color-danger);
      }

      &--dangerous {
        color: var(--color-prob-deadly);
      }
    }

    &__message {
      font-size: 0.84rem;
      color: var(--color-text);
      line-height: 1.45;
      margin: 0;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    &__formula {
      display: inline-block;
      font-size: 0.72rem;
      color: var(--color-text-muted);
      margin: 0;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: rgba(46, 42, 69, 0.2);
      border: 1px solid rgba(46, 42, 69, 0.5);
      white-space: nowrap;
      justify-self: start;
    }

    &__explanation {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin: 0;
      font-style: italic;
      opacity: 0.85;
      line-height: 1.35;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    &__ev {
      color: rgba(245, 200, 66, 0.88);
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 2px;
      gap: var(--spacing-sm);
    }

    &__quick-solve {
      background: linear-gradient(180deg, rgba(245, 200, 66, 0.18), rgba(245, 200, 66, 0.09));
      border: 1px solid rgba(245, 200, 66, 0.24);
      color: var(--color-gold);
      border-radius: var(--radius-sm);
      min-height: 32px;
      padding: 6px 10px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(245, 200, 66, 0.1);

      &:hover {
        background: linear-gradient(180deg, rgba(245, 200, 66, 0.24), rgba(245, 200, 66, 0.12));
      }

      &:active {
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      &__item,
      &__quick-solve {
        transition: none;
      }
    }

    @include responsive-below(sm) {
      &__header {
        flex-direction: column;
        align-items: stretch;
      }

      &__item {
        gap: var(--spacing-xs);
      }

      &__quick-solve {
        width: 100%;
      }

      &__topline {
        grid-template-columns: auto auto;
      }

      &__formula {
        grid-column: 1 / -1;
        width: fit-content;
      }

      &__actions {
        justify-content: stretch;
      }
    }
  }

  .playstyle-selector {
    position: relative;

    &__button {
      background: rgba(46, 42, 69, 0.5);
      border: 1px solid rgba(46, 42, 69, 0.85);
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      padding: 6px var(--spacing-sm);
      font-size: 0.7rem;
      cursor: pointer;
      transition:
        border-color var(--transition-fast),
        color var(--transition-fast);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      white-space: nowrap;

      &:hover {
        border-color: rgba(245, 200, 66, 0.25);
        color: var(--color-text);
      }
    }

    &__menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: var(--color-card-bg);
      border: 1px solid rgba(46, 42, 69, 0.9);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      z-index: 10;
      min-width: 120px;
      overflow: hidden;
    }

    &__option {
      display: block;
      width: 100%;
      padding: var(--spacing-sm);
      text-align: left;
      background: none;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      transition:
        background var(--transition-fast),
        color var(--transition-fast);
      font-size: 0.75rem;

      &:hover {
        background: rgba(46, 42, 69, 0.35);
        color: var(--color-text);
      }

      &--active {
        background: rgba(46, 42, 69, 0.5);
        color: var(--color-text);
        font-weight: 600;
      }

      &--focused {
        background: rgba(46, 42, 69, 0.35);
        outline: 1px solid rgba(245, 200, 66, 0.3);
        outline-offset: -1px;
      }
    }

    @include responsive-below(sm) {
      width: 100%;

      &__button {
        width: 100%;
        text-align: left;
      }

      &__menu {
        left: 0;
        right: auto;
        width: 100%;
      }
    }
  }
</style>
