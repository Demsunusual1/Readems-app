import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const alias = { '@': path.join(rootDir, 'src') };

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias },
  test: {
    projects: [
      {
        esbuild: { jsx: 'automatic' },
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['./src/**/*.test.{ts,tsx}'],
          exclude: ['./src/**/*.db.test.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'database',
          environment: 'node',
          setupFiles: ['./src/test/database.ts'],
          include: ['./src/**/*.db.test.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
});
