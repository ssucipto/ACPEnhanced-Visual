/// <reference types="vitest/config" />
import { defineConfig, createLogger, type LogLevel } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ── Server-side log filter — breaks Vite 8 client→server relay feedback loop ─
// On Windows, React 19 SSR errors are relayed by Vite's console mirror as:
//   [vite] (client) [console.error] <msg>
// which the client re-ingests as "[Server]..." → exponential flood → crash.
// This filter runs on the Node side before Vite logs hit the terminal.
// Fix from: agent/feedback/visualizer-windows-hang-2026-06-06.md

const SUPPRESSED_LOG_PATTERNS = [
  'Expected static flag',
  'hydrat',
  'Suspense',
  'Should have',
  '[console.error] [Server]',
  '[console.error] Internal React error',
]

function shouldSuppressLog(msg: unknown): boolean {
  const text =
    typeof msg === 'string'
      ? msg
      : msg instanceof Error
        ? msg.message
        : String(msg ?? '')
  return SUPPRESSED_LOG_PATTERNS.some((pattern) => text.includes(pattern))
}

const baseLogger = createLogger('info' as LogLevel)
const filteredLogger = {
  ...baseLogger,
  warn(msg: string, options?: unknown) {
    if (shouldSuppressLog(msg)) return
    baseLogger.warn(msg, options as any)
  },
  error(msg: string, options?: unknown) {
    if (shouldSuppressLog(msg)) return
    baseLogger.error(msg, options as any)
  },
  info(msg: string, options?: unknown) {
    if (shouldSuppressLog(msg)) return
    baseLogger.info(msg, options as any)
  },
}

// Devtools are opt-in — they trigger React 19 SSR errors on Vite 8
// Set VITE_ENABLE_DEVTOOLS=true to enable for debugging
const enableDevtools = process.env['VITE_ENABLE_DEVTOOLS'] === 'true'

const config = defineConfig({
  customLogger: filteredLogger,
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(enableDevtools ? [devtools()] : []),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['server/routes/api/**', 'src/components/**', 'src/lib/**'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },
  },
})

export default config
