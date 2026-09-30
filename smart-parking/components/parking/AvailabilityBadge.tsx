import { Badge } from '@/components/ui/Badge';

interface Props {
  availableSpots: number;
}

export function AvailabilityBadge({ availableSpots }: Props) {
  if (availableSpots === 0) {
    return <Badge variant="danger">Complet</Badge>;
  }
  if (availableSpots <= 5) {
    return <Badge variant="warning">Presque complet</Badge>;
  }
  return <Badge variant="success">Disponible</Badge>;
}
