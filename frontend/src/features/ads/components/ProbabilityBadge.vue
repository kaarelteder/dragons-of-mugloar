<script setup lang="ts">
  import { computed } from 'vue'
  import Badge from '@/shared/components/Badge.vue'
  import { getProbabilityTier } from '@/features/ads/utils/probability'
  import type { Probability } from '@/shared/types'

  interface Props {
    probability: Probability
  }

  const props = defineProps<Props>()

  const tier = computed(() => getProbabilityTier(props.probability))

  const variantMap: Record<string, 'success' | 'warning' | 'error'> = {
    sure: 'success',
    likely: 'success',
    medium: 'warning',
    risky: 'error',
    deadly: 'error',
  }

  const variant = computed(() => variantMap[tier.value] || 'default')
</script>

<template>
  <Badge :variant="variant" size="md" :title="`Probability: ${probability}`">
    {{ probability }}
  </Badge>
</template>
