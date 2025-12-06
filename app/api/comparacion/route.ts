import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

type ProductItem = {
  id: string;
  nombre: string;
  precio: number;
  descuento: string;
  proveedor: string;
  url: string;
  fechaScraping: string;
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(params.get('limit') || '50', 10), 100);

    // Get all successful results
    const snapshot = await db
      .collection('resultados')
      .where('status', '==', 'success')
      .orderBy('fechaScraping', 'desc')
      .limit(500)
      .get();

    // Group by product name
    const productMap = new Map<string, ProductItem[]>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const nombre = data.nombre?.toLowerCase().trim();

      if (!nombre) return;

      if (!productMap.has(nombre)) {
        productMap.set(nombre, []);
      }

      productMap.get(nombre)!.push({
        id: doc.id,
        nombre: data.nombre,
        precio: Number(data.precio) || 0,
        descuento: data.descuento || '',
        proveedor: data.proveedor || '',
        url: data.url || '',
        fechaScraping: data.fechaScraping || '',
      });
    });

    // Filter products with multiple providers and calculate stats
    const comparisons = Array.from(productMap.entries())
      .filter(([, items]) => items.length > 1) // Only products with 2+ providers
      .map(([, items]) => {
        const precios = items.map(item => item.precio);
        const minPrecio = Math.min(...precios);
        const maxPrecio = Math.max(...precios);
        const diferencia = maxPrecio - minPrecio;
        const diferenciaPorcentaje = ((diferencia / maxPrecio) * 100).toFixed(1);

        const proveedorMasBarato = items.find(item => item.precio === minPrecio)?.proveedor || '';
        const proveedorMasCaro = items.find(item => item.precio === maxPrecio)?.proveedor || '';

        return {
          nombre: items[0].nombre, // Use original case
          cantidadProveedores: items.length,
          precioMinimo: minPrecio,
          precioMaximo: maxPrecio,
          diferencia,
          diferenciaPorcentaje: Number(diferenciaPorcentaje),
          proveedorMasBarato,
          proveedorMasCaro,
          items: items.sort((a, b) => a.precio - b.precio), // Sort by price
        };
      })
      .sort((a, b) => b.diferencia - a.diferencia) // Sort by price difference descending
      .slice(0, limit);

    return NextResponse.json({ comparisons, total: comparisons.length });
  } catch (error) {
    console.error('GET /api/comparacion error', error);
    return NextResponse.json({ error: 'No se pudieron obtener las comparaciones' }, { status: 500 });
  }
}
