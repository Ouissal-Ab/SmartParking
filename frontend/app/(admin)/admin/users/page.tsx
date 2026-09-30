'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { toBackendRole, toUser, type BackendUser } from '@/lib/adapters';
import type { User, UserRole } from '@/types/user';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleEdit, setRoleEdit] = useState<{ user: User; nextRole: UserRole } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<BackendUser[]>('/admin/users')
      .then((res) => {
        if (!cancelled) setUsers(res.data.map(toUser));
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const haystack = `${u.firstName} ${u.lastName} ${u.email} ${u.licensePlate} ${u.phone} ${u.role}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, query]);

  const openRoleEdit = (user: User) => {
    setRoleEdit({ user, nextRole: user.role });
  };

  const submitRoleEdit = async () => {
    if (!roleEdit) return;
    const { user, nextRole } = roleEdit;
    if (nextRole === user.role) {
      setRoleEdit(null);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: toBackendRole(nextRole) });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
      toast.success('Rôle mis à jour avec succès !');
      setRoleEdit(null);
    } catch {
      toast.error('Erreur lors de la mise à jour du rôle.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user: User) => {
    if (!confirm(`Confirmer la suppression du compte de ${user.firstName} ${user.lastName} ?`))
      return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('Utilisateur supprimé.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nom',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAB95B] text-sm font-bold text-[#1A1F2E] shadow-sm">
            {u.firstName[0]}
            {u.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-text-primary">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-xs text-text-muted">{u.licensePlate}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Rôle',
      render: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'info' : 'neutral'}>
          {u.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openRoleEdit(u)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#1A3263] transition-colors hover:bg-[#1A3263]/10"
          >
            Changer le rôle
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => remove(u)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#8B3A3A] transition-colors hover:bg-[#B85450]/12"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-text-secondary">
            {users.length} utilisateurs enregistrés.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Rechercher nom, email, plaque..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        rowKey={(u) => u.id}
        emptyMessage={query ? 'Aucun utilisateur ne correspond.' : 'Aucun utilisateur enregistré.'}
      />

      <Modal
        open={!!roleEdit}
        onClose={() => setRoleEdit(null)}
        title="Modifier le rôle"
        description={
          roleEdit
            ? `Choisissez le nouveau rôle pour ${roleEdit.user.firstName} ${roleEdit.user.lastName}.`
            : undefined
        }
      >
        {roleEdit && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/55 bg-white/45 p-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAB95B] text-sm font-bold text-[#1A1F2E] shadow-sm">
                {roleEdit.user.firstName[0]}
                {roleEdit.user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {roleEdit.user.firstName} {roleEdit.user.lastName}
                </p>
                <p className="truncate text-xs text-text-muted">{roleEdit.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['USER', 'ADMIN'] as UserRole[]).map((r) => {
                const active = roleEdit.nextRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleEdit({ ...roleEdit, nextRole: r })}
                    className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                      active
                        ? 'border-[#FAB95B] bg-[#FAB95B]/15 text-[#1A1F2E] shadow-md shadow-[#FAB95B]/25'
                        : 'border-white/50 bg-white/40 text-text-secondary hover:border-[#FAB95B]/45'
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {r === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                    <span className="text-xs text-text-muted">
                      {r === 'ADMIN'
                        ? 'Accès complet au tableau de bord.'
                        : 'Réservations et gestion de son compte.'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setRoleEdit(null)}>
                Annuler
              </Button>
              <Button
                onClick={submitRoleEdit}
                loading={saving}
                disabled={roleEdit.nextRole === roleEdit.user.role}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
