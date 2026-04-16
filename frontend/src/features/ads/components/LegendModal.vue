<template>
  <Modal title="Metrics &amp; Game Legend" @close="$emit('close')">
    <section class="legend-modal">
      <div class="legend-modal__content">
        <div class="legend-modal__section">
          <p class="legend-modal__section-title">Card Metrics</p>
          <ul class="legend-modal__list">
            <li>
              <span class="legend-modal__chip">Probability %</span>
              <span class="legend-modal__text">Chance to successfully solve the card.</span>
            </li>
            <li>
              <span class="legend-modal__chip">Reward (g)</span>
              <span class="legend-modal__text">Gold earned on success.</span>
            </li>
            <li>
              <span class="legend-modal__chip">EV</span>
              <span class="legend-modal__text"
                >Expected Value, calculated as $Probability × Reward$.</span
              >
            </li>
            <li>
              <span class="legend-modal__chip">Turns Left</span>
              <span class="legend-modal__text">How many turns remain before the card expires.</span>
            </li>
          </ul>
        </div>

        <div class="legend-modal__section">
          <p class="legend-modal__section-title">Advisor Signals</p>
          <ul class="legend-modal__list">
            <li>
              <span class="legend-modal__chip">🥇 🥈 🥉</span>
              <span class="legend-modal__text"
                >Top recommendations ranked from best to lower EV.</span
              >
            </li>
            <li>
              <span class="legend-modal__chip">✓ ⚠ 🔥 💀</span>
              <span class="legend-modal__text"
                >Risk tiers: ✓ Safe, ⚠ Medium, 🔥 Risky, 💀 Dangerous.</span
              >
            </li>
            <li>
              <span class="legend-modal__chip">Quick Solve</span>
              <span class="legend-modal__text"
                >Instantly attempts the selected recommendation.</span
              >
            </li>
          </ul>
        </div>

        <div class="legend-modal__section">
          <p class="legend-modal__section-title">Game Legend</p>
          <ul class="legend-modal__list">
            <li>
              <span class="legend-modal__chip">Lives</span>
              <span class="legend-modal__text"
                >Failed solves can reduce lives; game ends at zero.</span
              >
            </li>
            <li>
              <span class="legend-modal__chip">Score</span>
              <span class="legend-modal__text"
                >Increases as you complete cards and progress turns.</span
              >
            </li>
            <li>
              <span class="legend-modal__chip">Goal</span>
              <span class="legend-modal__text"
                >Maximize score and gold while preserving lives.</span
              >
            </li>
          </ul>
        </div>
      </div>
    </section>
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/shared/components/Modal.vue'

  defineEmits(['close'])
</script>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .legend-modal {
    width: min(660px, 100%);
    max-width: 100%;
    box-sizing: border-box;
  }

  .legend-modal__content ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .legend-modal__content {
    display: grid;
    gap: var(--spacing-md);
  }

  .legend-modal__section {
    border: 1px solid rgba(46, 42, 69, 0.8);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    background: rgba(15, 14, 23, 0.45);
  }

  .legend-modal__section-title {
    margin: 0 0 var(--spacing-md);
    color: var(--color-gold);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .legend-modal__list {
    display: grid;
    gap: var(--spacing-sm);
  }

  .legend-modal__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
    min-width: 116px;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid rgba(245, 200, 66, 0.35);
    background: rgba(245, 200, 66, 0.12);
    color: var(--color-gold);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-align: center;
  }

  .legend-modal__list li {
    margin-bottom: var(--spacing-sm);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: var(--spacing-md);
    font-size: 0.9rem;
    line-height: 1.45;

    strong {
      color: var(--color-gold);
    }
  }

  .legend-modal__text {
    text-align: left;
  }

  :deep(.modal__overlay) {
    z-index: var(--z-toast);
  }

  :deep(.modal) {
    width: min(720px, calc(100vw - calc(var(--spacing-lg) * 2)));
    max-width: calc(100vw - calc(var(--spacing-md) * 2));
    max-height: min(90vh, 880px);
    box-sizing: border-box;
  }

  :deep(.modal__body) {
    padding-top: var(--spacing-md);
    overflow-x: hidden;
  }

  @include responsive-below(sm) {
    .legend-modal {
      width: 100%;
    }

    .legend-modal__list li {
      grid-template-columns: 1fr;
      align-items: start;
      row-gap: var(--spacing-xs);
    }

    .legend-modal__chip {
      min-width: 0;
      width: fit-content;
    }
  }
</style>
