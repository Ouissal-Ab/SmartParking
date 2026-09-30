'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthBackdrop } from '@/components/layout/AuthBackdrop';

const schema = z
  .object({
    prenom: z.string().min(2, 'Prénom requis'),
    nom: z.string().min(2, 'Nom requis'),
    email: z.string().email('Adresse email invalide'),
    telephone: z
      .string()
      .regex(/^(\+212|0)[0-9]{9}$/, 'Format marocain : 0XXXXXXXXX ou +212XXXXXXXXX'),
    immatriculation: z.string().min(2, 'Plaque requise'),
    password: z.string().min(4, 'Au moins 4 caractères').max(20),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await api.post<string>('/auth/register', values);
      const text = typeof data === 'string' ? data : '';
      if (text.toLowerCase().includes('succès')) {
        toast.success('Compte créé avec succès !');
        router.push('/login');
      } else if (text) {
        toast.error(text.trim());
      } else {
        toast.success('Compte créé avec succès !');
        router.push('/login');
      }
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'Erreur lors de l\'inscription.';
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de l\'inscription.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 font-bold text-text-primary">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAB95B] text-[#1A1F2E] shadow-md">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight">Smart Parking</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-text-primary">
            Créer votre compte
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Rejoignez Smart Parking en moins d&apos;une minute.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
              placeholder="vous@exemple.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Téléphone"
              placeholder="0612345678 ou +212612345678"
              {...register('telephone')}
              error={errors.telephone?.message}
            />
            <Input
              label="Plaque d'immatriculation"
              placeholder="12345-A-99"
              {...register('immatriculation')}
              error={errors.immatriculation?.message}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Créer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Déjà un compte&nbsp;?{' '}
            <Link href="/login" className="font-semibold text-accent-teal hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
