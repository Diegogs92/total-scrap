/**
 * Adaptador de base de datos que cambia entre SQLite (local)
 * y Firebase (Vercel/producción) según las variables de entorno.
 */

import type { Product, ProductFilter, PriceStats as PriceStatsType, ProviderStats } from '@/types';

const useFirebase = Boolean(process.env.FIREBASE_PROJECT_ID);

type DBModule = {
  getProducts: (filters?: ProductFilter, limit?: number, offset?: number) => Promise<Product[]> | Product[];
  insertProducts: (products: Omit<Product, 'id'>[], clearBefore?: boolean) => Promise<number> | number;
  getPriceAnalysis: (search?: string) => Promise<PriceStatsType[]> | PriceStatsType[];
  getProviderStats: () => Promise<ProviderStats[]> | ProviderStats[];
  getProviders: () => Promise<string[]> | string[];
  getCategories: () => Promise<string[]> | string[];
  getProductCount: (filters?: ProductFilter) => Promise<number> | number;
  clearAllProducts?: () => Promise<void> | void;
  initDatabase?: () => Promise<void> | void;
};

const db: DBModule = await (useFirebase ? import('./db-firebase') : import('./db'));

async function wrap<T>(value: Promise<T> | T): Promise<T> {
  return value instanceof Promise ? value : Promise.resolve(value);
}

export async function getProducts(filters: ProductFilter = {}, limit = 100, offset = 0): Promise<Product[]> {
  return wrap(db.getProducts(filters, limit, offset));
}

export async function insertProducts(products: Omit<Product, 'id'>[], clearBefore = false): Promise<number> {
  return wrap(db.insertProducts(products, clearBefore));
}

export async function getPriceAnalysis(search?: string): Promise<PriceStatsType[]> {
  return wrap(db.getPriceAnalysis(search));
}

export async function getProviderStats(): Promise<ProviderStats[]> {
  return wrap(db.getProviderStats());
}

export async function getProviders(): Promise<string[]> {
  return wrap(db.getProviders());
}

export async function getCategories(): Promise<string[]> {
  return wrap(db.getCategories());
}

export async function getProductCount(filters: ProductFilter = {}): Promise<number> {
  return wrap(db.getProductCount(filters));
}

export async function clearAllProducts(): Promise<void> {
  if (db.clearAllProducts) {
    await wrap(db.clearAllProducts());
  }
}

export async function initDatabase(): Promise<void> {
  if (db.initDatabase) {
    await wrap(db.initDatabase());
  }
}

export type { Product, ProductFilter, PriceStatsType as PriceStats };
