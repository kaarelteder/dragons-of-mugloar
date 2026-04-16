export const mockGameResponse = {
  gameId: 'test-123',
  lives: 3,
  gold: 0,
  level: 1,
  score: 0,
  highScore: 0,
  turn: 0,
}

export const mockSolveSuccess = {
  success: true,
  lives: 3,
  gold: 50,
  score: 50,
  highScore: 50,
  turn: 1,
  message: 'You succeeded!',
}

export const mockSolveFail = {
  success: false,
  lives: 2,
  gold: 0,
  score: 0,
  highScore: 0,
  turn: 1,
  message: 'You failed!',
}
