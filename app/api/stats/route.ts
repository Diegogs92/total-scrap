import { NextRequest, NextResponse } from 'next/server';
import { getPriceAnalysis, getProviderStats } from '@/lib/db-adapter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'price-analysis') {
      const search = searchParams.get('search') || undefined;
      const analysis = await getPriceAnalysis(search || undefined);
      return NextResponse.json({ analysis });
    }

    if (type === 'provider-stats') {
      const stats = await getProviderStats();
      return NextResponse.json({ stats });
    }

    return NextResponse.json(
      { error: 'Tipo de estadística no válido' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
