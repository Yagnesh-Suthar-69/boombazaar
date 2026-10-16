'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard, { ProductItem } from '@/components/ProductCard';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/products?category=${slug}&sort=${sortBy}`),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.categories) {
          const matched = catData.categories.find((c: Category) => c.slug === slug);
          setCategory(matched || null);
        }

        if (prodData.products) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error('Failed to load category products', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadCategoryData();
  }, [slug, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-fire-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-fire-600 transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-fire-600 font-semibold">{category?.name || slug}</span>
      </div>

      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
        {category?.image && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <Image src={category.image} alt={category.name} fill className="object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Category Showcase
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-black text-slate-900">
            {category?.name || 'Festive Fireworks'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {category?.description || 'Browse high-quality festive crackers with certified sound and emission standards.'}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <span className="text-xs text-slate-600">
          Showing <strong className="text-slate-900">{products.length}</strong> items in this category
        </span>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
          <p className="text-slate-500 text-xs">No products currently available in this category.</p>
          <Link href="/products" className="btn-firecracker px-4 py-2 rounded-xl text-xs font-bold inline-block">
            View All Fireworks
          </Link>
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
