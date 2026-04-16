<script setup lang="ts">
  import { ref } from 'vue'
  import Button from '@/shared/components/Button.vue'
  import Spinner from '@/shared/components/Spinner.vue'

  interface Props {
    loading?: boolean
    error?: string | null
  }

  withDefaults(defineProps<Props>(), {
    loading: false,
    error: null,
  })

  const emit = defineEmits<{
    start: []
  }>()

  const embers = ref(Array.from({ length: 12 }, (_, i) => i))
</script>

<template>
  <div class="start-screen">
    <div class="start-screen__embers animate-high-frequency" aria-hidden="true">
      <span
        v-for="i in embers"
        :key="i"
        class="start-screen__ember"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          opacity: `${0.4 + Math.random() * 0.6}`,
        }"
      />
    </div>

    <div class="start-screen__content">
      <div class="start-screen__dragon start-screen__dragon--animated" aria-hidden="true">🐉</div>
      <h1 class="start-screen__title start-screen__title--animated">Dragons of Mugloar</h1>
      <p class="start-screen__subtitle start-screen__subtitle--animated">
        A land of quests, peril, and gold awaits your dragon's wrath. Accept tasks, outwit foes, and
        claim 1000 glory points!
      </p>

      <div class="start-screen__rules start-screen__rules--animated">
        <div class="start-screen__rule start-screen__rule--animated">
          <span class="start-screen__rule-icon">⚔️</span>
          <span>Choose quests wisely — risk your life</span>
        </div>
        <div class="start-screen__rule start-screen__rule--animated">
          <span class="start-screen__rule-icon">🛒</span>
          <span>Spend gold in the shop for advantages</span>
        </div>
        <div class="start-screen__rule start-screen__rule--animated">
          <span class="start-screen__rule-icon">🏆</span>
          <span>Reach 1000 points to claim victory</span>
        </div>
      </div>

      <div v-if="error" class="start-screen__error start-screen__error--animated" role="alert">
        {{ error }}
      </div>

      <Button
        v-if="!loading"
        class="start-screen__button--animated"
        size="lg"
        @click="emit('start')"
      >
        Begin Your Quest
      </Button>
      <div v-else class="start-screen__loading start-screen__loading--animated">
        <Spinner size="md" label="Starting game..." />
        <span>Summoning your dragon...</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .start-screen {
    position: relative;
    min-height: calc(100vh - var(--header-height));
    @include flex-center;
    overflow: hidden;

    &__embers {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    &__ember {
      position: absolute;
      bottom: 0;
      border-radius: 50%;
      background: var(--color-gold);
      box-shadow: 0 0 6px var(--color-gold);
      animation: emberFloat linear infinite;
    }

    &__content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 600px;
      padding: var(--spacing-2xl) var(--spacing-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xl);
    }

    &__dragon {
      font-size: 6rem;
      filter: drop-shadow(0 0 20px rgba(245, 200, 66, 0.5));
      line-height: 1;

      &--animated {
        animation: dragonPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        will-change: transform, filter;
      }
    }

    &__title {
      font-size: clamp(2rem, 6vw, 4rem);
      color: var(--color-gold);
      text-shadow: 0 0 30px rgba(245, 200, 66, 0.5);
      letter-spacing: 0.05em;
      margin: 0;

      &--animated {
        animation: titleSlideDown 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        will-change: transform, opacity;
      }
    }

    &__subtitle {
      font-size: 1.1rem;
      color: var(--color-text-muted);
      max-width: 480px;
      line-height: 1.8;
      margin: 0;

      &--animated {
        animation: subtitleFadeUp 0.7s ease 0.3s both;
        will-change: opacity, transform;
      }
    }

    &__rules {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: left;
      background: rgba(26, 24, 37, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg) var(--spacing-xl);
      width: 100%;

      &--animated {
        animation: rulesFadeUp 0.7s ease 0.45s both;
        will-change: opacity, transform;
      }
    }

    &__rule {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: 0.95rem;
      color: var(--color-text-muted);
      opacity: 0;

      &--animated {
        animation: ruleItemSlideIn 0.5s ease forwards;
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
      }
    }

    &__rule-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    &__error {
      padding: var(--spacing-md);
      background: rgba(229, 57, 53, 0.15);
      border: 1px solid rgba(229, 57, 53, 0.3);
      border-radius: var(--radius-md);
      color: var(--color-danger);
      font-size: 0.9rem;
      width: 100%;

      &--animated {
        animation: errorShake 0.5s ease 0.9s both;
        will-change: transform;
      }
    }

    &__button--animated {
      animation: buttonFadeUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s both;
      will-change: opacity, transform;
    }

    &__loading--animated {
      animation: loadingFadeUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s both;
      will-change: opacity, transform;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--color-text-muted);
    }
  }

  @keyframes dragonPulse {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes titleSlideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes subtitleFadeUp {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes rulesFadeUp {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes ruleItemSlideIn {
    from {
      transform: translateX(-12px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes errorShake {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-4px);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(4px);
    }
  }

  @keyframes buttonFadeUp {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes loadingFadeUp {
    from {
      transform: translateY(12px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-12px);
    }
  }

  @keyframes emberFloat {
    0% {
      transform: translateY(0) translateX(0) scale(1);
      opacity: 0.8;
    }

    100% {
      transform: translateY(-140px) translateX(-5px) scale(0.1);
      opacity: 0;
    }
  }
</style>
