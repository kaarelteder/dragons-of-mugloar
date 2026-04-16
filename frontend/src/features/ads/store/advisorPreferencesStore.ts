import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlaystylePreference } from '@/shared/types'

const DEFAULT_PLAYSTYLE: PlaystylePreference = 'balanced'

export const useAdvisorPreferencesStore = defineStore(
  'advisorPreferences',
  () => {
    const playstyle = ref<PlaystylePreference>(DEFAULT_PLAYSTYLE)

    const setPlaystyle = (style: PlaystylePreference): void => {
      playstyle.value = style
    }

    const resetToDefaults = (): void => {
      playstyle.value = DEFAULT_PLAYSTYLE
    }

    return {
      playstyle,
      setPlaystyle,
      resetToDefaults,
    }
  },
  {
    persist: {
      key: 'advisor-preferences',
      storage: localStorage,
    },
  }
)
