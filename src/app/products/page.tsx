'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import ProductCard, { ProductItem } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<string>('all');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      if (sortBy) params.set('sort', sortBy);
      if (inStockOnly) params.set('inStockOnly', 'true');

      if (priceRange === 'under500') {
        params.set('maxPrice', '500');
      } else if (priceRange === '500to1500') {
        params.set('minPrice', '500');
        params.set('maxPrice', '1500');
      } else if (priceRange === 'above1500') {
        params.set('minPrice', '1500');
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, inStockOnly, priceRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-fire-600 block mb-1">
            Certified Catalogue
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900">
            All Festive Fireworks & Crackers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse our full 100% legal collection of sparklers, high-altitude aerials, and grand gift hampers.
          </p>
        </div>

        <div className="text-xs text-slate-600">
          Showing <strong className="text-slate-900">{products.length}</strong> available items
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, SKU or sound type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 rounded-lg bg-fire-600 text-[11px] font-bold text-white hover:bg-fire-500"
            >
              Filter
            </button>
          </form>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
            >
              <option value="featured">Featured & Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Tags */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Price Filter:
          </span>

          <button
            onClick={() => setPriceRange('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
              priceRange === 'all'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            All Prices
          </button>

          <button
            onClick={() => setPriceRange('under500')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
              priceRange === 'under500'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            Under ₹500
          </button>

          <button
            onClick={() => setPriceRange('500to1500')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
              priceRange === '500to1500'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            ₹500 — ₹1,500
          </button>

          <button
            onClick={() => setPriceRange('above1500')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
              priceRange === 'above1500'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            ₹1,500+ Luxury Aerials
          </button>

          <label className="ml-auto flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded bg-slate-100 border-slate-300 text-fire-600 focus:ring-0"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-lg">No Fireworks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing category filters, or checking back soon.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPriceRange('all');
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-fire-600 text-xs font-bold text-white shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-xs text-slate-400">Loading fireworks catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
