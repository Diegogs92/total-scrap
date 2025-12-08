import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    const urlId = req.nextUrl.searchParams.get('urlId');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '100', 10), 300);

    if (!urlId) {
      return NextResponse.json({ error: 'urlId es requerido' }, { status: 400 });
    }

    const snapshot = await db
      .collection('resultados')
      .where('urlId', '==', urlId)
      .orderBy('fechaScraping', 'desc')
      .limit(limit)
      .get();

    const series = snapshot.docs
      .map((doc) => doc.data())
      .map((data) => ({
        fecha: data.fechaScraping || data.fecha || '',
        precio: Number(data.precio) || 0,
        proveedor: data.proveedor || '',
      }))
      .filter((item) => item.fecha && item.precio > 0)
      .reverse(); // ascendente para el gráfico

    return NextResponse.json({ series });
  } catch (error) {
    console.error('GET /api/evolucion error', error);
    return NextResponse.json({ error: 'No se pudo obtener la evolución de precios' }, { status: 500 });
  }
}
