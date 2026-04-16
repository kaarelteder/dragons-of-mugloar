import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/features/game/store/gameStore'

const requireActiveGame = () => {
  const gameStore = useGameStore()

  if (!gameStore.gameId || !gameStore.isActive) {
    return { name: 'home' as const }
  }

  return true
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/pages/GamePage.vue'),
      beforeEnter: requireActiveGame,
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/pages/HistoryPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
