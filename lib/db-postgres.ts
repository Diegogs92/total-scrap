import { sql } from '@vercel/postgres';
import type { Product, ProductFilter, PriceStats, ProviderStats } from '@/types';

export async function initDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      nombre TEXT,
      precio REAL,
      descuento TEXT,
      categoria TEXT,
      proveedor TEXT,
      status TEXT,
      fecha_scraping TEXT,
      precioLista REAL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_proveedor ON products(proveedor)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_categoria ON products(categoria)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_nombre ON products(nombre)`;
}

export async function getProducts(
  filters: ProductFilter = {},
  limit = 100,
  offset = 0
): Promise<Product[]> {
  const conditions: string[] = ['1=1'];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(nombre ILIKE $${paramIndex} OR categoria ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.proveedor) {
    conditions.push(`proveedor = $${paramIndex}`);
    params.push(filters.proveedor);
    paramIndex++;
  }

  if (filters.categoria) {
    conditions.push(`categoria ILIKE $${paramIndex}`);
    params.push(`%${filters.categoria}%`);
    paramIndex++;
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`precio >= $${paramIndex}`);
    params.push(filters.minPrice);
    paramIndex++;
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`precio <= $${paramIndex}`);
    params.push(filters.maxPrice);
    paramIndex++;
  }

  if (filters.hasDiscount) {
    conditions.push(`descuento IS NOT NULL AND descuento != ''`);
  }

  const query = `
    SELECT * FROM products
    WHERE ${conditions.join(' AND ')}
    ORDER BY fecha_scraping DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const { rows } = await sql.query(query, params);
  return rows as Product[];
}

export async function insertProducts(
  products: Omit<Product, 'id'>[],
  clearBefore = false
): Promise<number> {
  if (clearBefore) {
    await sql`DELETE FROM products`;
  }

  if (products.length === 0) return 0;

  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    const values = batch
      .map((_, index) => {
        const baseIndex = index * 9;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`;
      })
      .join(',');

    const params = batch.flatMap((p) => [
      p.url,
      p.nombre,
      p.precio,
      p.descuento,
      p.categoria,
      p.proveedor,
      p.status,
      p.fecha_scraping,
      p.precioLista ?? null,
    ]);

    const query = `
      INSERT INTO products (url, nombre, precio, descuento, categoria, proveedor, status, fecha_scraping, precioLista)
      VALUES ${values}
    `;

    await sql.query(query, params);
    totalInserted += batch.length;
  }

  return totalInserted;
}

export async function getPriceAnalysis(search?: string): Promise<PriceStats[]> {
  const conditions: string[] = ['precio > 0'];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`nombre ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const query = `
    WITH price_stats AS (
      SELECT
        nombre,
        MIN(precio) AS precioMinimo,
        MAX(precio) AS precioMaximo,
        AVG(precio) AS precioPromedio,
        COUNT(DISTINCT proveedor) AS proveedores
      FROM products
      WHERE ${conditions.join(' AND ')}
      GROUP BY nombre
      HAVING COUNT(DISTINCT proveedor) > 1
    ),
    cheapest AS (
      SELECT DISTINCT ON (nombre) nombre, proveedor AS proveedorMasBarato
      FROM products
      WHERE ${conditions.join(' AND ')}
      ORDER BY nombre, precio ASC
    ),
    priciest AS (
      SELECT DISTINCT ON (nombre) nombre, proveedor AS proveedorMasCaro
      FROM products
      WHERE ${conditions.join(' AND ')}
      ORDER BY nombre, precio DESC
    )
    SELECT
      ps.nombre AS "producto",
      ps."precioMinimo",
      ps."precioMaximo",
      ps."precioPromedio",
      c.proveedorMasBarato AS "proveedorMasBarato",
      p.proveedorMasCaro AS "proveedorMasCaro",
      ROUND(((ps."precioMaximo" - ps."precioMinimo") / ps."precioMinimo" * 100)::numeric, 2) AS "diferenciaPorcentaje"
    FROM price_stats ps
    JOIN cheapest c ON c.nombre = ps.nombre
    JOIN priciest p ON p.nombre = ps.nombre
    ORDER BY "diferenciaPorcentaje" DESC
    LIMIT 50
  `;

  const { rows } = await sql.query(query, params);
  return rows as PriceStats[];
}

export async function getProviderStats(): Promise<ProviderStats[]> {
  const { rows } = await sql`
    SELECT
      proveedor,
      COUNT(*) as "cantidadProductos",
      ROUND(AVG(precio), 2) as "precioPromedio",
      SUM(CASE WHEN descuento IS NOT NULL AND descuento != '' THEN 1 ELSE 0 END) as "productosConDescuento",
      ROUND(AVG(CASE WHEN descuento IS NOT NULL AND descuento != ''
        THEN CAST(REPLACE(descuento, '%', '') AS REAL)
        ELSE 0 END), 2) as "descuentoPromedio"
    FROM products
    WHERE proveedor IS NOT NULL
    GROUP BY proveedor
    ORDER BY "cantidadProductos" DESC
  `;

  return rows as ProviderStats[];
}

export async function getProviders(): Promise<string[]> {
  const { rows } = await sql`
    SELECT DISTINCT proveedor
    FROM products
    WHERE proveedor IS NOT NULL AND proveedor != ''
    ORDER BY proveedor
  `;

  return (rows as { proveedor: string }[]).map((row) => row.proveedor);
}

export async function getCategories(): Promise<string[]> {
  const { rows } = await sql`
    SELECT DISTINCT categoria
    FROM products
    WHERE categoria IS NOT NULL AND categoria != ''
    ORDER BY categoria
  `;

  return (rows as { categoria: string }[]).map((row) => row.categoria);
}

export async function getProductCount(filters: ProductFilter = {}): Promise<number> {
  const conditions: string[] = ['1=1'];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(nombre ILIKE $${paramIndex} OR categoria ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.proveedor) {
    conditions.push(`proveedor = $${paramIndex}`);
    params.push(filters.proveedor);
    paramIndex++;
  }

  if (filters.categoria) {
    conditions.push(`categoria ILIKE $${paramIndex}`);
    params.push(`%${filters.categoria}%`);
    paramIndex++;
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`precio >= $${paramIndex}`);
    params.push(filters.minPrice);
    paramIndex++;
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`precio <= $${paramIndex}`);
    params.push(filters.maxPrice);
    paramIndex++;
  }

  if (filters.hasDiscount) {
    conditions.push(`descuento IS NOT NULL AND descuento != ''`);
  }

  const query = `
    SELECT COUNT(*) as count
    FROM products
    WHERE ${conditions.join(' AND ')}
  `;

  const { rows } = await sql.query(query, params);
  return (rows[0] as { count: number }).count;
}
