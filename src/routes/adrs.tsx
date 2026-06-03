import { createFileRoute } from '@tanstack/react-router'
import { ADRBrowser } from '../components/ADRBrowser'
export const Route = createFileRoute('/adrs')({ component: ADRBrowser })
