import { createLogger, format, transports } from 'winston';

const level = process.env['LOG_LEVEL'] ?? 'info';

export const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level: lvl, message, stack, ...meta }) => {
      const base = `${String(timestamp)} [${String(lvl).toUpperCase()}] [dragons-bot] ${String(message)}`;
      const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
      return stack ? `${base}${metaStr}\n${String(stack)}` : `${base}${metaStr}`;
    })
  ),
  transports: [new transports.Console()],
});

export function isLogLevelEnabled(levelName: string): boolean {
  return logger.isLevelEnabled(levelName);
}
