import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductCount, getProviders, getCategories } from '@/lib/db-adapter';
import { ProductFilter } from '@/lib/db-adapter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Obtener lista de proveedores
    if (action === 'providers') {
      const providers = await getProviders();
      return NextResponse.json({ providers });
    }

    // Obtener lista de categorías
    if (action === 'categories') {
      const categories = await getCategories();
      return NextResponse.json({ categories });
    }

    // Obtener productos con filtros
    const filters: ProductFilter = {
      proveedor: searchParams.get('proveedor') || undefined,
      categoria: searchParams.get('categoria') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const products = await getProducts(filters, limit, offset);
    const total = await getProductCount(filters);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
