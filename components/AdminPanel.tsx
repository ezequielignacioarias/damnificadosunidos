'use client';

interface RegistroAdmin {
  id?: string;
  nombre?: string;
  celular?: string | null;
  localidad?: string;
  desarrollo: string;
  lote?: string | null;
  manzana?: string | null;
  problema: string;
  tipo_bien?: string;
  tipoBien?: string;
  tipo_contrato?: string;
  tipoInstrumento?: string;
  anio_compra?: string;
  anioCompra?: string;
  forma_pago?: string;
  formaPago?: string;
  estado_pago?: string;
  estadoPago?: string;
  entidad_operacion?: string;
  entidadOperacion?: string;
  personas_afectadas_familia?: number | null;
  intermediario?: string;
  created_at?: string;
}

interface AdminPanelProps {
  registrosPrivados: RegistroAdmin[];
  unidadesRegistradas: number;
  cantidadBarrios: number;
  onSignOut: () => void | Promise<void>;
  onDelete: (id: string) => void;
  onUpdateField: (id: string, campo: string, valor: string) => Promise<void>;
  onExportCsv: () => void;
  onDownloadImage: () => void;
}

export default function AdminPanel({
  registrosPrivados,
  unidadesRegistradas,
  cantidadBarrios,
  onSignOut,
  onDelete,
  onUpdateField,
  onExportCsv,
  onDownloadImage,
}: AdminPanelProps) {
  return (
    <section className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-5 sm:p-7 mb-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center mb-4">
        <h2 className="text-base sm:text-lg font-bold text-emerald-400">
          🔒 Panel privado de administrador
        </h2>

        <button
          type="button"
          onClick={() => void onSignOut()}
          className="text-xs text-slate-400 hover:text-red-400 underline cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4">
        Listado completo para uso exclusivo de coordinación legal. Editá cualquier campo directamente en las celdas y salí de ellas para guardar los cambios automáticamente.
      </p>

      <div className="overflow-x-auto max-h-[500px] mb-4 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs min-w-[1800px]">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="p-3 w-16">Acciones</th>
              <th className="p-3 w-24">Fecha</th>
              <th className="p-3 w-36">Nombre</th>
              <th className="p-3 w-32">Celular</th>
              <th className="p-3 w-28">Localidad</th>
              <th className="p-3 w-36">Desarrollo</th>
              <th className="p-3 w-24">Lote</th>
              <th className="p-3 w-24">Manzana</th>
              <th className="p-3 w-40">Problema</th>
              <th className="p-3 w-32">Tipo de bien</th>
              <th className="p-3 w-40">Tipo de contrato</th>
              <th className="p-3 w-24">Año compra</th>
              <th className="p-3 w-36">Forma de pago</th>
              <th className="p-3 w-32">Estado pago</th>
              <th className="p-3 w-32">Canal / Entidad</th>
              <th className="p-3 w-36">Intermediario</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50">
            {registrosPrivados.map((r, i) => {
              const campos: [string, string][] = [
                ['nombre', r.nombre || ''],
                ['celular', r.celular || ''],
                ['localidad', r.localidad || ''],
                ['desarrollo', r.desarrollo || ''],
                ['lote', r.lote ?? ''],
                ['manzana', r.manzana ?? ''],
                ['problema', r.problema || ''],
                ['tipo_bien', r.tipo_bien || r.tipoBien || ''],
                ['tipo_contrato', r.tipo_contrato || r.tipoInstrumento || ''],
                ['anio_compra', r.anio_compra || r.anioCompra || ''],
                ['forma_pago', r.forma_pago || r.formaPago || ''],
                ['estado_pago', r.estado_pago || r.estadoPago || ''],
                ['entidad_operacion', r.entidad_operacion || r.entidadOperacion || ''],
                ['intermediario', r.intermediario || ''],
              ];

              return (
                <tr key={r.id ?? i} className="hover:bg-slate-800/30">
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => { if (r.id) onDelete(r.id); }}
                      title="Eliminar registro"
                      className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>

                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('es-AR') : '-'}
                  </td>

                  {campos.map(([campo, valor]) => (
                    <td className="p-3" key={campo}>
                      <input
                        type="text"
                        defaultValue={valor}
                        onBlur={(e) => {
                          const nuevoValor = e.currentTarget.value.trim();
                          if (r.id && nuevoValor !== valor) {
                            void onUpdateField(r.id, campo, nuevoValor);
                          }
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onExportCsv}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
        >
          📥 Descargar reporte completo (CSV)
        </button>

        <button
          type="button"
          onClick={onDownloadImage}
          className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold px-4 py-3.5 rounded-xl text-sm cursor-pointer"
        >
          📸 Descargar resumen (PNG)
        </button>
      </div>

      <div className="fixed left-[-10000px] top-0 pointer-events-none">
        <div id="reporte-tarjeta-visual" className="bg-[#080c14] border border-slate-800 rounded-2xl p-8 w-[600px] text-slate-100 font-sans">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-xs font-extrabold text-sky-400 tracking-wider uppercase">@damnificadosunidos</span>
              <h3 className="text-xl font-black text-white mt-1">Reporte de Situación Colectiva</h3>
            </div>
            <span className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              {new Date().toLocaleDateString('es-AR')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-sky-400 mb-1">{cantidadBarrios}</div>
              <div className="text-xs uppercase font-bold text-slate-400">Barrios afectados</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-emerald-400 mb-1">{unidadesRegistradas}</div>
              <div className="text-xs uppercase font-bold text-slate-400">Unidades involucradas</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center border-t border-slate-800 pt-4">
            Base de datos comunitaria autogestionada • Ley 25.326 de Protección de Datos Personales
          </div>
        </div>
      </div>
    </section>
  );
}