<script setup lang="ts">
  import HistoryList from '@/features/history/components/HistoryList.vue'
  import Button from '@/shared/components/Button.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goHome = (): void => {
    router.push('/')
  }
</script>

<template>
  <main class="history-page container">
    <div class="history-page__back">
      <Button variant="ghost" size="sm" @click="goHome"> ← Home </Button>
    </div>
    <HistoryList />
  </main>
</template>

<style scoped lang="scss">
  @use '@/styles/variables' as *;

  .history-page {
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-2xl);

    &__back {
      margin-bottom: var(--spacing-lg);
    }
  }
</style>
