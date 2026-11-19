
'use client';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalConfirmacion({
  isOpen,
  onConfirm,
  onCancel,
}: ModalConfirmacionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="text-3xl mb-2">⚠️</div>

        <h3 className="text-sm font-bold text-white mb-2">
          ¿Eliminar registro?
        </h3>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Esta acción eliminará permanentemente el registro seleccionado
          y no se puede deshacer.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-xs sm:text-sm font-bold hover:bg-red-500 cursor-pointer"
          >
            Sí, eliminar
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-800 text-slate-300 rounded-xl py-2.5 text-xs sm:text-sm hover:bg-slate-700 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
