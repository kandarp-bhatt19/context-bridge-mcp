import * as os from 'os';
import * as path from 'path';

export const config = {
  dbDir: path.join(os.homedir(), '.context-bridge'),
  dbPath: path.join(os.homedir(), '.context-bridge', 'contexts.db'),
  exportDir: path.join(os.homedir(), '.context-bridge', 'exports'),
  messageCount: 10,
  defaultUsername: 'kandarp',
} as const;
