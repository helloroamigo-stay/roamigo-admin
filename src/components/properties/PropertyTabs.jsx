import React from 'react';
import { Plus } from 'lucide-react';

export const PropertyTabs = ({
  activeTab,
  setActiveTab,
  propertiesCount,
  onOpenCreateModal
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
      <div className="flex bg-gray-900/80 p-1 border border-gray-850 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PENDING_APPROVAL')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'PENDING_APPROVAL'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Awaiting Review</span>
          <span className="text-[10px] px-2 py-0.5 bg-gray-950/80 border border-gray-850 text-brand-400 rounded-full font-bold">
            {propertiesCount.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLISHED')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'PUBLISHED'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Active Listings</span>
          <span className="text-[10px] px-2 py-0.5 bg-gray-950/80 border border-gray-850 text-emerald-400 rounded-full font-bold">
            {propertiesCount.published}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OTHER')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'OTHER'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Drafts & Suspended</span>
        </button>
      </div>

      <button
        onClick={onOpenCreateModal}
        className="flex items-center gap-2 py-3 px-6 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl text-sm font-semibold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all cursor-pointer w-fit"
      >
        <Plus className="w-4.5 h-4.5" />
        <span>Add Property</span>
      </button>
    </div>
  );
};
