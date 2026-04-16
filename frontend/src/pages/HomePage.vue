<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import StartScreen from '@/features/game/components/StartScreen.vue'
  import { useGame } from '@/features/game/composables/useGame'

  const router = useRouter()
  const { loading, error, startGame } = useGame()

  const handleStart = async (): Promise<void> => {
    const result = await startGame()
    if (result) {
      router.push('/game')
    }
  }
</script>

<template>
  <StartScreen :loading="loading" :error="error" @start="handleStart" />
</template>
