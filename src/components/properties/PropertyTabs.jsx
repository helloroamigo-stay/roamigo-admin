import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const PropertyTabs = ({
  activeTab,
  setActiveTab,
  propertiesCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PENDING_APPROVAL')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'PENDING_APPROVAL'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Awaiting Review</span>
          <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-brand-700 rounded-full font-bold">
            {propertiesCount.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLISHED')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'PUBLISHED'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Active Listings</span>
          <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-emerald-700 rounded-full font-bold">
            {propertiesCount.published}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OTHER')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'OTHER'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Drafts & Suspended</span>
        </button>
      </div>

      <Link
        to="/properties/new"
        className="flex items-center gap-2 py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer w-fit"
      >
        <Plus className="w-4.5 h-4.5" />
        <span>Add Property</span>
      </Link>
    </div>
  );
};
