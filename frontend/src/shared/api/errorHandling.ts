export const GAME_EXPIRED_MESSAGE =
  'Game Expired: Your game session has expired or the game ID is no longer valid.'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return ''
}

const isNotFoundMessage = (message: string): boolean => {
  return message.includes('404') || message.includes('not found')
}

export const isGameExpiredError = (error: unknown): boolean => {
  const message = getErrorMessage(error)
  if (!message) {
    return false
  }

  const normalized = message.toLowerCase()
  return normalized.includes('game expired') || isNotFoundMessage(normalized)
}

export const mapToGameExpiredError = (error: unknown): Error => {
  if (isGameExpiredError(error)) {
    return new Error(GAME_EXPIRED_MESSAGE)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('An unexpected error occurred')
}

export const mapAndHandleGameExpiredError = (
  error: unknown,
  onGameExpired?: (mappedError: Error) => void
): Error => {
  const mappedError = mapToGameExpiredError(error)

  if (!isGameExpiredError(mappedError)) return mappedError

  onGameExpired?.(mappedError)

  return mappedError
}
