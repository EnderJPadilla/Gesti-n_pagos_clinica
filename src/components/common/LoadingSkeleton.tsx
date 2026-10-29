/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      <div className="h-9 bg-slate-200/70 rounded-md w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 py-2 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-5 bg-slate-200/60 rounded"
              style={{ width: `${Math.max(40, 100 - cIdx * 10)}%` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 border border-slate-200 rounded-lg animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 rounded w-2/3"></div>
      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
    </div>
  );
};
