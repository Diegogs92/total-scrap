'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { User, UserRole } from '@/types';
import { ArrowLeft, UserPlus, Shield, Settings, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function AdminUsuariosContent() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'consultante' as UserRole,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleColors = {
    desarrollador: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    administrador: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    consultante: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  };

  const roleIcons = {
    desarrollador: Shield,
    administrador: Settings,
    consultante: UserIcon,
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Usuario registrado exitosamente');
        setShowRegisterModal(false);
        setRegisterData({ email: '', password: '', nombre: '', rol: 'consultante' });
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Error de conexión');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, activo: !currentStatus }),
      });

      if (res.ok) {
        fetchUsers();
        setSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('Toggle user error:', err);
      setError('Error de conexión');
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-white">Administración de Usuarios</h1>
          <p className="text-white/70 mt-1">Gestiona los usuarios del sistema</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Usuarios Registrados</h2>
          {currentUser?.rol !== 'consultante' && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              Registrar Usuario
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-white/60 text-center py-8">Cargando usuarios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Fecha Creación</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.rol];
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{user.nombre}</td>
                      <td className="py-3 px-4 text-white/80">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.rol]}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {user.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.activo ? (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Inactivo</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {new Date(user.fechaCreacion).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4">
                        {user.rol !== 'desarrollador' && (
                          <button
                            onClick={() => toggleUserStatus(user.id, user.activo)}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                              user.activo
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {user.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Registrar Nuevo Usuario</h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nombre</label>
                <input
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rol</label>
                <select
                  value={registerData.rol}
                  onChange={(e) => setRegisterData({ ...registerData, rol: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="consultante">Consultante</option>
                  <option value="administrador">Administrador</option>
                  {currentUser?.rol === 'desarrollador' && (
                    <option value="desarrollador">Desarrollador</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminUsuarios() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <AdminUsuariosContent />
    </ProtectedRoute>
  );
}
