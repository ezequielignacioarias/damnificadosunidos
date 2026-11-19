
'use client';

interface DesarrolloAnalisis {
  count: number;
  problema: string;
  entidad: string;
}

interface EstadisticasPublicasProps {
  seccion: 'resumen' | 'analisis';
  totalRegistros: number;
  metaObjetivo: number;
  tituloMeta: string;
  porcentajeMeta: number;
  cantidadBarrios: number;
  personasRegistradas: number;
  lotesRegistrados: number;
  barriosAfectados: number;
  familiaresAfectados: number;
  busqueda?: string;
  onBusquedaChange?: (valor: string) => void;
  desarrollos: [string, DesarrolloAnalisis][];
}

export default function EstadisticasPublicas({
  seccion,
  totalRegistros,
  metaObjetivo,
  tituloMeta,
  porcentajeMeta,
  cantidadBarrios,
  personasRegistradas,
  lotesRegistrados,
  barriosAfectados,
  familiaresAfectados,
  busqueda = '',
  onBusquedaChange,
  desarrollos,
}: EstadisticasPublicasProps) {
  
  if (seccion === 'resumen') {
    const tarjetas = [
      { titulo: 'Personas registradas', valor: personasRegistradas },
      { titulo: 'Lotes registrados', valor: lotesRegistrados },
      { titulo: 'Barrios afectados', valor: barriosAfectados },
      { titulo: 'Familiares afectados', valor: familiaresAfectados },
    ];

    return (
      <>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center gap-3 mb-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-sky-400">🎯</span>
              {tituloMeta}: {metaObjetivo} Registros
            </span>

            <span className="shrink-0 text-xs font-extrabold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-0.5 rounded-full">
              {totalRegistros} / {metaObjetivo}
            </span>
          </div>

          <div
            className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800/80 p-0.5 overflow-hidden"
            role="progressbar"
            aria-label="Progreso hacia la meta de lotes registrados"
            aria-valuenow={totalRegistros}
            aria-valuemin={0}
            aria-valuemax={metaObjetivo}
          >
            <div
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              style={{ width: `${porcentajeMeta}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            {totalRegistros < 50 ? (
              <>
                Estamos reuniendo los primeros 50 registros oficiales para poder visualizar el impacto real de la problemática en la región.
                <br />
                <span className="mt-2 inline-block">
                  ¡Compartí la página con otros vecinos afectados!
                </span>
              </>
            ) : (
              <>
                Ya alcanzamos {Math.floor(totalRegistros / 50) * 50} lotes registrados.
                El objetivo actual es llegar a {metaObjetivo} para seguir dimensionando el impacto real de esta problemática.
                <br />
                <span className="mt-2 inline-block">
                  ¡Compartí la página con otros vecinos afectados!
                </span>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-6">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.titulo}
              className="min-w-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-md"
            >
              <div className="text-2xl sm:text-3xl font-black text-sky-400 mb-1 break-words tabular-nums">
                {(tarjeta.valor ?? 0).toLocaleString('es-AR')}
              </div>

              <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider leading-relaxed">
                {tarjeta.titulo}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }


  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-sky-400 flex items-center gap-2">
          <span>📊</span>
          Análisis por Barrio / Localidad (Público)
        </h2>

        <input
          type="text"
          placeholder="🔍 Buscar desarrollo..."
          aria-label="Buscar desarrollo"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 w-full md:w-60 transition-colors"
        />
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th scope="col" className="pb-3 pr-4 font-semibold">
                Desarrollo
              </th>
              <th scope="col" className="pb-3 pr-4 font-semibold">
                Lotes
              </th>
              <th scope="col" className="pb-3 pr-4 font-semibold">
                Canal principal
              </th>
              <th scope="col" className="pb-3 font-semibold">
                Mayor problema reportado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {desarrollos.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-slate-500"
                >
                  No se encontraron desarrollos con ese nombre.
                </td>
              </tr>
            ) : (
              desarrollos.map(([dev, info]) => (
                <tr
                  key={dev}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-bold text-slate-100">
                    {dev}
                  </td>

                  <td className="py-3.5 pr-4">
                    <span className="bg-sky-600/90 text-white font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                      {info.count.toLocaleString('es-AR')}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4 text-slate-300">
                    {info.entidad}
                  </td>

                  <td className="py-3.5 text-slate-300">
                    {info.problema}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
