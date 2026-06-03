import { createFileRoute } from '@tanstack/react-router'
import { AuditIndex } from '../components/AuditIndex'
export const Route = createFileRoute('/audits')({ component: AuditIndex })
