import { createFileRoute } from '@tanstack/react-router'
import { PackageInventory } from '../components/PackageInventory'
export const Route = createFileRoute('/packages')({ component: PackageInventory })
