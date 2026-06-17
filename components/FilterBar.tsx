'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Home, Building2 } from 'lucide-react';
import { PropertyType } from '@/types';

interface Filters {
  location: string;
  minRent: string;
  maxRent: string;
  propertyType: PropertyType | '';
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const hasFilters = filters.location || filters.minRent || filters.maxRent || filters.propertyType;

  const clear = () => onChange({ location: '', minRent: '', maxRent: '', propertyType: '' });

  const setType = (t: PropertyType | '') =>
    onChange({ ...filters, propertyType: filters.propertyType === t ? '' : t });

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      {/* Type toggle pills — always visible */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setType('residential')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
            filters.propertyType === 'residential'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
          }`}
        >
          <Home size={14} /> Home
        </button>
        <button
          onClick={() => setType('commercial')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
            filters.propertyType === 'commercial'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          <Building2 size={14} /> Commercial
        </button>
      </div>

      {/* Search + more filters */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by location..."
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
        />
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            filters.minRent || filters.maxRent
              ? 'bg-orange-500 text-white border-orange-500'
              : 'border-gray-200 text-gray-600 bg-white'
          }`}
        >
          <SlidersHorizontal size={14} /> ₹
        </button>
        {hasFilters && (
          <button onClick={clear} className="px-3 py-2 rounded-xl border border-red-200 text-red-400 bg-white text-sm">
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minRent}
            onChange={(e) => onChange({ ...filters, minRent: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxRent}
            onChange={(e) => onChange({ ...filters, maxRent: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
          />
        </div>
      )}
    </div>
  );
}
