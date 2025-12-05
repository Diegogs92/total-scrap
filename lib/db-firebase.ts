import { db } from './firebase';
import type { Product, ProductFilter, PriceStats, ProviderStats } from '@/types';
import type { Query, DocumentData } from 'firebase-admin/firestore';

const PRODUCTS_COLLECTION = 'products';

export async function getProducts(
  filters: ProductFilter = {},
  limit = 100,
  offset = 0
): Promise<Product[]> {
  let query: Query<DocumentData> = db.collection(PRODUCTS_COLLECTION).orderBy('fecha_scraping', 'desc');

  if (filters.proveedor) {
    query = query.where('proveedor', '==', filters.proveedor);
  }

  if (filters.categoria) {
    query = query.where('categoria', '==', filters.categoria);
  }

  if (filters.minPrice !== undefined) {
    query = query.where('precio', '>=', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.where('precio', '<=', filters.maxPrice);
  }

  query = query.limit(limit).offset(offset);

  const snapshot = await query.get();
  const products: Product[] = [];
  const searchLower = filters.search?.toLowerCase();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (filters.hasDiscount && !data.descuento) {
      return;
    }
    if (searchLower && !data.nombre?.toLowerCase().includes(searchLower) && !data.categoria?.toLowerCase().includes(searchLower)) {
      return;
    }

    products.push({
      id: 0,
      url: data.url || '',
      nombre: data.nombre || '',
      precio: data.precio || 0,
      descuento: data.descuento || '',
      categoria: data.categoria || '',
      proveedor: data.proveedor || '',
      status: data.status || '',
      fecha_scraping: data.fecha_scraping || '',
      precioLista: data.precioLista || undefined,
    });
  });

  return products;
}

export async function insertProducts(
  products: Omit<Product, 'id'>[],
  clearBefore = false
): Promise<number> {
  if (clearBefore) {
    await clearAllProducts();
  }

  if (products.length === 0) return 0;

  const batchSize = 500;
  let totalInserted = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = db.batch();
    const currentBatch = products.slice(i, i + batchSize);

    currentBatch.forEach((product) => {
      const docRef = db.collection(PRODUCTS_COLLECTION).doc();
      batch.set(docRef, product);
    });

    await batch.commit();
    totalInserted += currentBatch.length;
  }

  return totalInserted;
}

export async function getPriceAnalysis(search?: string): Promise<PriceStats[]> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).where('precio', '>', 0).get();
  const searchLower = search?.toLowerCase();

  type Accumulator = {
    nombre: string;
    precios: number[];
    proveedores: { proveedor: string; precio: number }[];
  };

  const productMap = new Map<string, Accumulator>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.nombre) return;
    if (searchLower && !data.nombre.toLowerCase().includes(searchLower)) return;

    if (!productMap.has(data.nombre)) {
      productMap.set(data.nombre, {
        nombre: data.nombre,
        precios: [],
        proveedores: [],
      });
    }

    const acc = productMap.get(data.nombre)!;
    acc.precios.push(data.precio);
    acc.proveedores.push({ proveedor: data.proveedor || 'N/D', precio: data.precio });
  });

  const analysis: PriceStats[] = [];

  productMap.forEach((product) => {
    if (product.proveedores.length < 2) return;

    const minEntry = product.proveedores.reduce((prev, curr) => (curr.precio < prev.precio ? curr : prev));
    const maxEntry = product.proveedores.reduce((prev, curr) => (curr.precio > prev.precio ? curr : prev));
    const precioMinimo = minEntry.precio;
    const precioMaximo = maxEntry.precio;
    const precioPromedio = product.precios.reduce((a, b) => a + b, 0) / product.precios.length;
    const diferenciaPorcentaje = precioMinimo > 0 ? ((precioMaximo - precioMinimo) / precioMinimo) * 100 : 0;

    analysis.push({
      producto: product.nombre,
      precioMinimo,
      precioMaximo,
      precioPromedio,
      proveedorMasBarato: minEntry.proveedor,
      proveedorMasCaro: maxEntry.proveedor,
      diferenciaPorcentaje: Math.round(diferenciaPorcentaje * 100) / 100,
    });
  });

  return analysis.sort((a, b) => b.diferenciaPorcentaje - a.diferenciaPorcentaje).slice(0, 100);
}

export async function getProviderStats(): Promise<ProviderStats[]> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).where('precio', '>', 0).get();

  type ProviderAccumulator = {
    total: number;
    sum: number;
    withDiscount: number;
    discountSum: number;
  };

  const providerMap = new Map<string, ProviderAccumulator>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.proveedor) return;

    if (!providerMap.has(data.proveedor)) {
      providerMap.set(data.proveedor, { total: 0, sum: 0, withDiscount: 0, discountSum: 0 });
    }

    const acc = providerMap.get(data.proveedor)!;
    acc.total += 1;
    acc.sum += Number(data.precio) || 0;

    if (data.descuento) {
      acc.withDiscount += 1;
      const numericDiscount = parseFloat(String(data.descuento).replace('%', '')) || 0;
      acc.discountSum += numericDiscount;
    }
  });

  const stats: ProviderStats[] = [];

  providerMap.forEach((acc, proveedor) => {
    stats.push({
      proveedor,
      cantidadProductos: acc.total,
      precioPromedio: acc.total > 0 ? Math.round((acc.sum / acc.total) * 100) / 100 : 0,
      productosConDescuento: acc.withDiscount,
      descuentoPromedio: acc.withDiscount > 0 ? Math.round((acc.discountSum / acc.withDiscount) * 100) / 100 : 0,
    });
  });

  return stats.sort((a, b) => b.cantidadProductos - a.cantidadProductos);
}

export async function getProviders(): Promise<string[]> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  const providers = new Set<string>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.proveedor) {
      providers.add(data.proveedor);
    }
  });

  return Array.from(providers).sort();
}

export async function getCategories(): Promise<string[]> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  const categories = new Set<string>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.categoria) {
      categories.add(data.categoria);
    }
  });

  return Array.from(categories).sort();
}

export async function getProductCount(filters: ProductFilter = {}): Promise<number> {
  let query: Query<DocumentData> = db.collection(PRODUCTS_COLLECTION);

  if (filters.proveedor) {
    query = query.where('proveedor', '==', filters.proveedor);
  }

  if (filters.categoria) {
    query = query.where('categoria', '==', filters.categoria);
  }

  if (filters.minPrice !== undefined) {
    query = query.where('precio', '>=', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.where('precio', '<=', filters.maxPrice);
  }

  const snapshot = await query.get();

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (filters.hasDiscount && !data.descuento) {
        return;
      }
      if (
        data.nombre?.toLowerCase().includes(searchLower) ||
        data.categoria?.toLowerCase().includes(searchLower)
      ) {
        count += 1;
      }
    });
    return count;
  }

  if (filters.hasDiscount) {
    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.descuento) {
        count += 1;
      }
    });
    return count;
  }

  return snapshot.size;
}

export async function clearAllProducts(): Promise<void> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
