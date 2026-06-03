import { createFileRoute } from '@tanstack/react-router'
import { RouteCostsPage } from '../components/RouteCostsPage'
export const Route = createFileRoute('/route-costs')({ component: RouteCostsPage })
