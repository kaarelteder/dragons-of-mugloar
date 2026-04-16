import 'dotenv/config';
import { GameLoop } from './game/loop.js';
import { logger } from './logger.js';

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

async function main(): Promise<void> {
  const loop = new GameLoop();
  const outcome = await loop.run();
  process.exit(outcome.exitCode);
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
