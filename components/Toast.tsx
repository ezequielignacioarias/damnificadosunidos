
'use client';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-4 sm:right-6 z-50 bg-slate-900 border border-sky-500/50 text-sky-200 rounded-xl shadow-2xl text-xs font-medium max-w-[300px] overflow-hidden"
      >
        <div className="flex items-center gap-2 p-3">
          <span className="text-sky-400 shrink-0" aria-hidden="true">
            ℹ️
          </span>

          <span className="leading-tight break-words flex-1">
            {message}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer px-1"
            title="Cerrar"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>

        <div className="w-full bg-slate-950 h-1">
          <div className="bg-sky-400 h-full w-full animate-toast-progress" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-toast-progress {
          animation: toastProgress 4s linear forwards;
        }
      `}</style>
    </>
  );
}
