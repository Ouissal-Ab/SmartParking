'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthBackdrop } from '@/components/layout/AuthBackdrop';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormValues = z.infer<typeof schema>;

function LoginInner() {
  const search = useSearchParams();
  const redirectTo = search.get('redirect') || '';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values);
      toast.success(`Bienvenue ${user.firstName} !`);
      const fallback = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      const safe =
        redirectTo &&
        redirectTo.startsWith('/') &&
        !redirectTo.startsWith('//')
          ? redirectTo
          : fallback;
      // Hard navigation — guarantees the middleware sees the freshly-set
      // cookies on every device, including mobile Safari/Chrome.
      setTimeout(() => {
        window.location.href = safe;
      }, 300);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur lors de la connexion.');
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 font-bold text-text-primary">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAB95B] text-[#1A1F2E] shadow-md">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight">Smart Parking</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-text-primary">
            Heureux de vous revoir
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Connectez-vous pour réserver votre place.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-[2.45rem] h-4 w-4 text-text-muted" />
              <Input
                label="Email"
                type="email"
                placeholder="vous@exemple.com"
                {...register('email')}
                error={errors.email?.message}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-[2.45rem] h-4 w-4 text-text-muted" />
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                className="pl-10"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Pas encore de compte&nbsp;?{' '}
            <Link href="/register" className="font-semibold text-[#7A4F0E] hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}
