'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { BackendUser } from '@/lib/adapters';
import { fromBackendRole } from '@/lib/adapters';
import { getStoredUser, saveSession, getToken } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  prenom: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  nom: z.string().min(2, 'Nom requis (min 2 caractères)'),
  telephone: z
    .string()
    .regex(/^(\+212|0)[0-9]{9}$/, 'Format marocain : 0XXXXXXXXX ou +212XXXXXXXXX'),
  immatriculation: z.string().min(2, 'Plaque requise'),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<BackendUser>('/user/profile');
        setEmail(data.email);
        reset({
          prenom: data.prenom,
          nom: data.nom,
          telephone: data.telephone,
          immatriculation: data.immatriculation,
        });
      } catch {
        // fall back to stored user if API fails
        const stored = getStoredUser();
        if (stored) {
          setEmail(stored.email);
          reset({
            prenom: stored.firstName,
            nom: stored.lastName,
            telephone: stored.phone,
            immatriculation: stored.licensePlate,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await api.put<BackendUser>('/user/profile', values);

      // Refresh the locally-stored user so the navbar & other pages stay in sync
      const token = getToken();
      if (token) {
        saveSession(token, {
          id: data.id,
          firstName: data.prenom,
          lastName: data.nom,
          email: data.email,
          phone: data.telephone,
          licensePlate: data.immatriculation,
          role: fromBackendRole(data.role),
          status: 'ACTIVE',
        });
      }

      toast.success('Profil mis à jour !');
      reset(values); // reset dirty state
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Erreur lors de la mise à jour.';
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAB95B] text-[#1A1F2E] shadow-md">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Mon profil</h1>
          <p className="text-sm text-text-secondary">
            Mettez à jour vos informations personnelles.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Prénom"
                placeholder="Yousra"
                {...register('prenom')}
                error={errors.prenom?.message}
              />
              <Input
                label="Nom"
                placeholder="Ouhajou"
                {...register('nom')}
                error={errors.nom?.message}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              hint="L'email ne peut pas être modifié."
            />

            <Input
              label="Téléphone"
              placeholder="0612345678"
              {...register('telephone')}
              error={errors.telephone?.message}
            />

            <Input
              label="Plaque d'immatriculation"
              placeholder="12345-A-99"
              {...register('immatriculation')}
              error={errors.immatriculation?.message}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={!isDirty || isSubmitting}
              >
                <Save className="mr-1.5 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
