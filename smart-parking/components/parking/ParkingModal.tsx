'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Parking } from '@/types/parking';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  address: z.string().min(2, 'Adresse requise'),
  totalSpots: z.coerce.number().int().min(1, 'Au moins 1 place'),
  hourlyRate: z.coerce.number().min(0, 'Tarif invalide'),
  openTime: z.string().min(1, 'Heure requise'),
  closeTime: z.string().min(1, 'Heure requise'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export type ParkingFormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ParkingFormValues) => Promise<void> | void;
  initialValue?: Parking | null;
}

export function ParkingModal({ open, onClose, onSubmit, initialValue }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParkingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValue
      ? {
          name: initialValue.name,
          address: initialValue.address,
          totalSpots: initialValue.totalSpots,
          hourlyRate: initialValue.hourlyRate,
          openTime: initialValue.openTime,
          closeTime: initialValue.closeTime,
          latitude: initialValue.latitude,
          longitude: initialValue.longitude,
        }
      : {
          name: '',
          address: '',
          totalSpots: 0,
          hourlyRate: 0,
          openTime: '08:00',
          closeTime: '22:00',
          // Default: Marrakech centre
          latitude: 31.6295,
          longitude: -7.9811,
        },
  });

  const submit = async (values: ParkingFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? 'Modifier le parking' : 'Ajouter un parking'}
      description={
        initialValue
          ? 'Mettez à jour les informations du parking.'
          : 'Renseignez les informations du nouveau parking.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Nom" {...register('name')} error={errors.name?.message} />
        <Input label="Adresse" {...register('address')} error={errors.address?.message} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre de places"
            type="number"
            {...register('totalSpots')}
            error={errors.totalSpots?.message}
          />
          <Input
            label="Tarif horaire (MAD)"
            type="number"
            step="0.1"
            {...register('hourlyRate')}
            error={errors.hourlyRate?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Heure d'ouverture" type="time" {...register('openTime')} error={errors.openTime?.message} />
          <Input label="Heure de fermeture" type="time" {...register('closeTime')} error={errors.closeTime?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="31.6295"
            {...register('latitude')}
            error={errors.latitude?.message}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="-7.9811"
            {...register('longitude')}
            error={errors.longitude?.message}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
