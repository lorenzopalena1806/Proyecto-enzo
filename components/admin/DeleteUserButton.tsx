'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteUserServer } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro que deseas eliminar DEFINITIVAMENTE al usuario "${userName}"?\n\nEsta acción borrará todas sus transacciones, ofertas y acceso a la plataforma. No se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    const result = await deleteUserServer(userId);
    setLoading(false);

    if (result.success) {
      alert('Usuario eliminado correctamente.');
      router.push('/admin/users');
      router.refresh();
    } else {
      alert('Error al eliminar usuario: ' + result.error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? 'Eliminando...' : 'Eliminar Usuario'}
    </button>
  );
}
