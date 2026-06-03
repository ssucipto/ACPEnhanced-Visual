import { createFileRoute } from '@tanstack/react-router'
import { SessionTimeline } from '../components/SessionTimeline'
export const Route = createFileRoute('/sessions')({ component: SessionTimeline })
