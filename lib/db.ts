import Database from 'better-sqlite3';
import path from 'path';
import { Product, ProductFilter, PriceStats, ProviderStats } from '@/types';

const dbPath = path.join(process.cwd(), 'products.db');
const db = new Database(dbPath);

// Inicializa la base de datos SQLite
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      nombre TEXT,
      precio REAL,
      descuento TEXT,
      categoria TEXT,
      proveedor TEXT,
      status TEXT,
      fecha_scraping TEXT DEFAULT CURRENT_TIMESTAMP,
      precioLista REAL,
      debug_jsonld TEXT,
      debug_metaPrice TEXT,
      debug_fragPrecio TEXT,
      debug_fragList TEXT
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_proveedor ON products(proveedor);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_categoria ON products(categoria);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_fecha ON products(fecha_scraping);
  `);
}

// Insertar productos (opcionalmente limpiar antes)
export function insertProducts(products: Omit<Product, 'id'>[], clearBefore = false) {
  if (clearBefore) {
    clearAllProducts();
  }

  const stmt = db.prepare(`
    INSERT INTO products (
      url, nombre, precio, descuento, categoria, proveedor,
      status, fecha_scraping, precioLista
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const product of items as Omit<Product, 'id'>[]) {
      stmt.run(
        product.url,
        product.nombre,
        product.precio,
        product.descuento,
        product.categoria,
        product.proveedor,
        product.status,
        product.fecha_scraping,
        product.precioLista || null
      );
    }
  });

  insertMany(products);
  return products.length;
}

// Obtener productos con filtros
export function getProducts(filters: ProductFilter = {}, limit = 100, offset = 0): Product[] {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.proveedor) {
    query += ' AND proveedor = ?';
    params.push(filters.proveedor);
  }

  if (filters.categoria) {
    query += ' AND categoria LIKE ?';
    params.push(`%${filters.categoria}%`);
  }

  if (filters.search) {
    query += ' AND (nombre LIKE ? OR categoria LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.minPrice !== undefined) {
    query += ' AND precio >= ?';
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query += ' AND precio <= ?';
    params.push(filters.maxPrice);
  }

  if (filters.hasDiscount) {
    query += ' AND descuento IS NOT NULL AND descuento != ""';
  }

  query += ' ORDER BY fecha_scraping DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...params) as Product[];
}

// Contar productos con filtros
export function getProductCount(filters: ProductFilter = {}): number {
  let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.proveedor) {
    query += ' AND proveedor = ?';
    params.push(filters.proveedor);
  }

  if (filters.categoria) {
    query += ' AND categoria LIKE ?';
    params.push(`%${filters.categoria}%`);
  }

  if (filters.search) {
    query += ' AND (nombre LIKE ? OR categoria LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.minPrice !== undefined) {
    query += ' AND precio >= ?';
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query += ' AND precio <= ?';
    params.push(filters.maxPrice);
  }

  if (filters.hasDiscount) {
    query += ' AND descuento IS NOT NULL AND descuento != ""';
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params) as { count: number };
  return result.count;
}

export function getProviders(): string[] {
  const stmt = db.prepare('SELECT DISTINCT proveedor FROM products WHERE proveedor IS NOT NULL ORDER BY proveedor');
  const results = stmt.all() as { proveedor: string }[];
  return results.map((r) => r.proveedor);
}

export function getCategories(): string[] {
  const stmt = db.prepare('SELECT DISTINCT categoria FROM products WHERE categoria IS NOT NULL ORDER BY categoria');
  const results = stmt.all() as { categoria: string }[];
  return results.map((r) => r.categoria);
}

// Análisis de precios por producto
export function getPriceAnalysis(search?: string): PriceStats[] {
  let query = `
    WITH price_stats AS (
      SELECT
        nombre,
        MIN(precio) as precioMinimo,
        MAX(precio) as precioMaximo,
        AVG(precio) as precioPromedio,
        COUNT(DISTINCT proveedor) as proveedores
      FROM products
      WHERE nombre IS NOT NULL AND precio > 0
  `;

  if (search) {
    query += ' AND nombre LIKE ?';
  }

  query += `
      GROUP BY nombre
      HAVING proveedores > 1
    )
    SELECT
      ps.nombre as producto,
      ps.precioMinimo,
      ps.precioMaximo,
      ps.precioPromedio,
      (SELECT proveedor FROM products WHERE nombre = ps.nombre AND precio = ps.precioMinimo LIMIT 1) as proveedorMasBarato,
      (SELECT proveedor FROM products WHERE nombre = ps.nombre AND precio = ps.precioMaximo LIMIT 1) as proveedorMasCaro,
      ROUND(((ps.precioMaximo - ps.precioMinimo) / ps.precioMinimo * 100), 2) as diferenciaPorcentaje
    FROM price_stats ps
    ORDER BY diferenciaPorcentaje DESC
    LIMIT 50
  `;

  const stmt = db.prepare(query);
  const results = search ? stmt.all(`%${search}%`) : stmt.all();
  return results as PriceStats[];
}

// Estadísticas por proveedor
export function getProviderStats(): ProviderStats[] {
  const query = `
    SELECT
      proveedor,
      COUNT(*) as cantidadProductos,
      ROUND(AVG(precio), 2) as precioPromedio,
      SUM(CASE WHEN descuento IS NOT NULL AND descuento != '' THEN 1 ELSE 0 END) as productosConDescuento,
      ROUND(AVG(CASE WHEN descuento IS NOT NULL AND descuento != ''
        THEN CAST(REPLACE(descuento, '%', '') AS REAL)
        ELSE 0 END), 2) as descuentoPromedio
    FROM products
    WHERE proveedor IS NOT NULL
    GROUP BY proveedor
    ORDER BY cantidadProductos DESC
  `;

  const stmt = db.prepare(query);
  return stmt.all() as ProviderStats[];
}

export function clearAllProducts() {
  db.prepare('DELETE FROM products').run();
}

initDB();

export default db;
