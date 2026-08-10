import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-extrabold text-indigo-500">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-white">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested page URL does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
