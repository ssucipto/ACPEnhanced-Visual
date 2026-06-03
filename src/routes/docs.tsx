import { createFileRoute } from '@tanstack/react-router'
import { DocsViewer } from '../components/DocsViewer'
export const Route = createFileRoute('/docs')({ component: DocsViewer })
