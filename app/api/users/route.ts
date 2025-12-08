import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo desarrollador y administrador pueden ver usuarios
    if (decoded.rol !== 'desarrollador' && decoded.rol !== 'administrador') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const snapshot = await db.collection('users').orderBy('fechaCreacion', 'desc').get();
    const users: User[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = data;
      return { id: doc.id, ...userWithoutPassword } as User;
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /api/users error', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo desarrollador y administrador pueden modificar usuarios
    if (decoded.rol !== 'desarrollador' && decoded.rol !== 'administrador') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { userId, nombre, email, rol, password } = await req.json();
    if (!userId || !nombre || !email || !rol) {
      return NextResponse.json({ error: 'userId, nombre, email y rol son requeridos' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData?.rol === 'desarrollador' && decoded.rol !== 'desarrollador') {
      return NextResponse.json(
        { error: 'Solo el desarrollador puede modificar otros desarrolladores' },
        { status: 403 }
      );
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      nombre,
      email,
      rol,
    };

    // Si se proporciona password, hashearlo
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.collection('users').doc(userId).update(updateData);

    return NextResponse.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('PUT /api/users error', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo desarrollador y administrador pueden eliminar usuarios
    if (decoded.rol !== 'desarrollador' && decoded.rol !== 'administrador') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();

    // No permitir eliminar al desarrollador
    if (userData?.rol === 'desarrollador') {
      return NextResponse.json(
        { error: 'No se puede eliminar un usuario desarrollador' },
        { status: 403 }
      );
    }

    // No permitir que un admin elimine a otro desarrollador
    if (userData?.rol === 'desarrollador' && decoded.rol !== 'desarrollador') {
      return NextResponse.json(
        { error: 'Solo el desarrollador puede eliminar otros desarrolladores' },
        { status: 403 }
      );
    }

    // No permitir eliminar el propio usuario
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 403 }
      );
    }

    await db.collection('users').doc(userId).delete();

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('DELETE /api/users error', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
