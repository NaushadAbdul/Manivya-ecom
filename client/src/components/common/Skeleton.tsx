import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-800/80 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-slate-800 rounded w-1/3" />
          <div className="h-8 bg-slate-800 rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  );
};
