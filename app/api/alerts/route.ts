import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { PriceAlert } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 100);
    const unreadOnly = req.nextUrl.searchParams.get('unread') === '1';

    let query = db.collection('alerts').orderBy('fecha', 'desc').limit(limit);
    if (unreadOnly) {
      query = db.collection('alerts').where('leida', '==', false).orderBy('fecha', 'desc').limit(limit);
    }

    const snapshot = await query.get();
    const alerts: PriceAlert[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        urlId: data.urlId,
        url: data.url,
        nombre: data.nombre,
        proveedor: data.proveedor,
        precioAnterior: data.precioAnterior,
        precioNuevo: data.precioNuevo,
        delta: data.delta,
        deltaPorcentaje: data.deltaPorcentaje,
        fecha: data.fecha,
        leida: data.leida || false,
      };
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('GET /api/alerts error', error);
    return NextResponse.json({ error: 'No se pudieron obtener las alertas' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { ids, all } = await req.json();

    if (!all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: 'ids requeridos o use all=true' }, { status: 400 });
    }

    const batch = db.batch();

    if (all) {
      const unreadSnap = await db.collection('alerts').where('leida', '==', false).get();
      unreadSnap.docs.forEach((doc) => batch.update(doc.ref, { leida: true }));
    } else {
      ids.forEach((id: string) => {
        const ref = db.collection('alerts').doc(id);
        batch.update(ref, { leida: true });
      });
    }

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/alerts error', error);
    return NextResponse.json({ error: 'No se pudieron actualizar las alertas' }, { status: 500 });
  }
}
