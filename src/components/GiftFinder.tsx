"use client";

import React, { useState } from 'react';
import { Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterState = {
  category: string | null;
  priceBracket: string | null;
};

interface GiftFinderProps {
  categories: string[];
  priceBrackets: { label: string; value: string }[];
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export function GiftFinder({ categories, priceBrackets, currentFilters, onFilterChange, className }: GiftFinderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    onFilterChange({
      ...currentFilters,
      category: currentFilters.category === cat ? null : cat
    });
  };

  const togglePrice = (price: string) => {
    onFilterChange({
      ...currentFilters,
      priceBracket: currentFilters.priceBracket === price ? null : price
    });
  };

  const clearFilters = () => {
    onFilterChange({ category: null, priceBracket: null });
  };

  return (
    <div className={cn("bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
          <Filter className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Gift Finder
        </h3>
        {(currentFilters.category || currentFilters.priceBracket) && (
          <button 
            onClick={clearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        className="md:hidden w-full py-2 mb-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={cn("space-y-8 md:block", isOpen ? "block" : "hidden")}>
        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Categories
          </h4>
          <div className="space-y-2">
            {categories.map((cat) => {
              const isActive = currentFilters.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors",
                    isActive ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"
                  )}>
                    {isActive && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {cat === 'Outdoor Adventure' ? 'Outdoor & Adventure' : cat === 'Pet Tech' ? 'Pet Tech & Smart Pet Gear' : cat === 'Travel Tech' ? 'Travel & Digital Nomad Tech' : cat === 'Desk Toys Novelty Gifts' ? 'Desk Toys & Novelty Gifts' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Bracket */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Price Range
          </h4>
          <div className="space-y-2">
            {priceBrackets.map((bracket) => {
              const isActive = currentFilters.priceBracket === bracket.value;
              return (
                <button
                  key={bracket.value}
                  onClick={() => togglePrice(bracket.value)}
                  className={cn(
                    "flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors",
                    isActive ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"
                  )}>
                    {isActive && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {bracket.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
