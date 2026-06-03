import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lessons')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/lessons"!</div>
}
