import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function IntegrationTile({
  name,
  description,
  connected = false,
  className,
}: {
  name: string
  description: string
  connected?: boolean
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <Badge variant={connected ? 'default' : 'muted'}>
            {connected ? 'Connected' : 'Not connected'}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" className="w-full" disabled>
          {connected ? 'Manage' : 'Connect (demo)'}
        </Button>
      </CardContent>
    </Card>
  )
}
