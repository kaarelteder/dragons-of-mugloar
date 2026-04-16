<script setup lang="ts">
  import Header from '@/shared/components/Header.vue'
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'

  const ROUTE_ORDER: Record<string, number> = {
    '/': 0,
    '/game': 1,
    '/history': 2,
  }

  const getTransitionDirection = (
    previousPath: string,
    nextPath: string
  ): 'forward' | 'backward' => {
    const from = ROUTE_ORDER[previousPath] ?? -1
    const to = ROUTE_ORDER[nextPath] ?? -1
    return to >= from ? 'forward' : 'backward'
  }

  const direction = ref<'forward' | 'backward'>('forward')
  const route = useRoute()
  const lastPath = ref(route.path)

  watch(
    () => route.path,
    (nextPath) => {
      direction.value = getTransitionDirection(lastPath.value, nextPath)
      lastPath.value = nextPath
    }
  )
</script>

<template>
  <Header />
  <RouterView v-slot="{ Component, route: currentRoute }">
    <Transition :name="`fade-${direction}`" mode="out-in" appear>
      <component :is="Component" :key="currentRoute.path" class="page-transition" />
    </Transition>
  </RouterView>
</template>

<style lang="scss">
  @use '@/styles/variables' as *;

  .page-transition {
  }

  .fade-forward-enter-active,
  .fade-forward-leave-active {
    transition:
      opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-forward-enter-from {
    opacity: 0;
    transform: translateY(12px);
  }

  .fade-forward-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }

  .fade-backward-enter-active,
  .fade-backward-leave-active {
    transition:
      opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-backward-enter-from {
    opacity: 0;
    transform: translateY(-12px);
  }

  .fade-backward-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }
</style>
