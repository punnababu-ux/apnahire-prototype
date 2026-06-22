interface Props {
  onClose: () => void;
}

export function InsufficientCreditsModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 flex items-center justify-center">
          <span className="material-icons-round text-[20px] select-none">close</span>
        </button>

        <div className="mb-6">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            <rect x="10" y="38" width="80" height="52" rx="8" fill="#b8d4f0"/>
            <rect x="10" y="38" width="80" height="14" rx="4" fill="#6fa8d6"/>
            <circle cx="42" cy="28" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
            <circle cx="68" cy="20" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
            <circle cx="55" cy="34" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
            <circle cx="88" cy="24" r="14" fill="#e03131"/>
            <path d="M83 19l10 10M93 19l-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#172b4d] mb-2">Insufficient Credits</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You don't have credits to unlock the candidates profiles.<br />Buy more credits now.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#1f8268] hover:bg-[#186b55] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Buy credits
        </button>
      </div>
    </div>
  );
}
