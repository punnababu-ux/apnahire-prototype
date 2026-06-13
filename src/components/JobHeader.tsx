interface JobHeaderProps {
  activeTab: 'applied' | 'database';
  onTabChange: (tab: 'applied' | 'database') => void;
  appliedCount: number;
}

export function JobHeader({ activeTab, onTabChange, appliedCount }: JobHeaderProps) {
  return (
    <div className="flex items-center gap-0 px-4 h-12 bg-white border-b border-gray-200 flex-shrink-0">
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 mr-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <span className="text-sm font-semibold text-gray-900">Field Sales Executive</span>
      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-[11px] font-semibold">Active</span>

      <div className="w-px h-4 bg-gray-300 mx-3" />
      <span className="text-xs text-gray-500">Saket, Delhi-NCR</span>
      <div className="w-px h-4 bg-gray-300 mx-3" />
      <button className="text-xs text-emerald-600 font-medium">Edit</button>

      <div className="flex-1" />

      <div className="flex border border-gray-200 rounded-lg overflow-hidden h-8">
        <button
          onClick={() => onTabChange('applied')}
          className={`px-3 text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'applied'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Applied to job ({appliedCount})
        </button>
        <div className="w-px bg-gray-200" />
        <button
          onClick={() => onTabChange('database')}
          className={`px-3 text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'database'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Database (42,321)
        </button>
      </div>

      <button className="w-8 h-8 flex items-center justify-center text-gray-400 ml-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>
  );
}
