'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ProductFilter } from '@/types';

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilter) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [providers, setProviders] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    proveedor: '',
    categoria: '',
    minPrice: '',
    maxPrice: '',
    hasDiscount: false,
  });

  useEffect(() => {
    // Cargar proveedores
    fetch('/api/products?action=providers')
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(err => console.error('Error loading providers:', err));

    // Cargar categorías
    fetch('/api/products?action=categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(err => console.error('Error loading categories:', err));
  }, []);

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const apiFilters: ProductFilter = {
      search: newFilters.search || undefined,
      proveedor: newFilters.proveedor || undefined,
      categoria: newFilters.categoria || undefined,
      minPrice: newFilters.minPrice ? parseFloat(newFilters.minPrice) : undefined,
      maxPrice: newFilters.maxPrice ? parseFloat(newFilters.maxPrice) : undefined,
      hasDiscount: newFilters.hasDiscount || undefined,
    };

    onFilterChange(apiFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      proveedor: '',
      categoria: '',
      minPrice: '',
      maxPrice: '',
      hasDiscount: false,
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar producto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nombre o categoría del producto..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proveedor
          </label>
          <select
            value={filters.proveedor}
            onChange={(e) => handleFilterChange('proveedor', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los proveedores</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <select
            value={filters.categoria}
            onChange={(e) => handleFilterChange('categoria', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Precio mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio mínimo
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="$ 0"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio máximo
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="$ 999999"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Solo con descuento */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasDiscount}
              onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Solo con descuento
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
