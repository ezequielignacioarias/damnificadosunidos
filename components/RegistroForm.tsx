'use client';

import type {
  FormEvent,
  Dispatch,
  SetStateAction,
} from 'react';

type UnidadItem = {
  localidad: string;
  customLocalidad: string;
  desarrollo: string;
  numeroLote: string;
  manzana: string;
  tipoBien: string;
  tipoInstrumento: string;
  problema: string;
  anioCompra: string;
  formaPago: string;
  estadoPago: string;
  entidadOperacion: string;
  intermediario: string;
};

type FormularioRegistro = {
  nombre: string;
  celular: string;
  cantidad: number;
  personasAfectadas: string;
  unidades: UnidadItem[];
};

type Props = {
  form: FormularioRegistro;
  setForm: Dispatch<SetStateAction<FormularioRegistro>>;
  handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  handleCantidadChange: (cantidad: number) => void;
  handleUnidadChange: (
    index: number,
    campo: keyof UnidadItem,
    valor: string
  ) => void;
  labelClass: string;
  inputClass: string;
  LOCALIDADES: string[];
  LOCALIDADES_MAP: Record<string, string[]>;
  PROBLEMAS: string[];
  ENTIDADES_OPERACION: string[];
  TIPOS_BIEN: string[];
  TIPOS_INSTRUMENTO: string[];
  ANIOS_COMPRA: string[];
  FORMAS_PAGO: string[];
  ESTADOS_PAGO: string[];
  consent: boolean;
  setConsent: Dispatch<SetStateAction<boolean>>;
  errorMsg: string;
  setErrorMsg: Dispatch<SetStateAction<string>>;
  loading: boolean;
  success: boolean;
};

export default function RegistroForm({
  form,
  setForm,
  handleSubmit,
  handleCantidadChange,
  handleUnidadChange,
  labelClass,
  inputClass,
  LOCALIDADES,
  LOCALIDADES_MAP,
  PROBLEMAS,
  ENTIDADES_OPERACION,
  TIPOS_BIEN,
  TIPOS_INSTRUMENTO,
  ANIOS_COMPRA,
  FORMAS_PAGO,
  ESTADOS_PAGO,
  consent,
  setConsent,
  errorMsg,
  setErrorMsg,
  loading,
  success,
}: Props) {
  const cantidadFamilia = Number(form.personasAfectadas);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-xl">
      <h2 className="text-base sm:text-lg font-bold text-sky-400 mb-2 flex items-center gap-2">
        📝 Registrar mi caso
      </h2>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Completá los datos principales para guardar tu registro.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Nombre y apellido o alias *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={40}
                value={form.nombre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombre: e.target.value.slice(0, 40),
                  })
                }
                placeholder="Ej.: Juan Pérez"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="sm:hidden">
              <label className={labelClass}>
                Número de WhatsApp / Celular *
              </label>
              <input
                type="tel"
                required
                autoComplete="tel"
                maxLength={25}
                inputMode="tel"
                value={form.celular}
                onChange={(e) =>
                  setForm({
                    ...form,
                    celular: e.target.value.replace(/[^\d+()\s-]/g, ''),
                  })
                }
                placeholder="Ej.: +54 9 341 5123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className={labelClass}>
                ¿Cuántos lotes vas a registrar? *
              </label>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      handleCantidadChange(num);
                      setErrorMsg('');
                    }}
                    aria-pressed={form.cantidad === num}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      form.cantidad === num
                        ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden sm:block">
              <label className={labelClass}>
                Número de WhatsApp / Celular *
              </label>
              <input
                type="tel"
                required
                autoComplete="tel"
                maxLength={25}
                inputMode="tel"
                value={form.celular}
                onChange={(e) =>
                  setForm({
                    ...form,
                    celular: e.target.value.replace(/[^\d+()\s-]/g, ''),
                  })
                }
                placeholder="Ej.: +54 9 341 5123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className={labelClass}>
                ¿Cuántos familiares están afectados? (opcional)
              </label>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        personasAfectadas:
                          cantidadFamilia === num ? '' : String(num),
                      });
                      setErrorMsg('');
                    }}
                    aria-pressed={cantidadFamilia === num}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      cantidadFamilia === num
                        ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-5">
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4">
            🔑 Datos principales del lote adquirido
          </h3>

          {form.unidades.map((unid, index) => (
            <div
              key={index}
              className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 mb-4 space-y-4 shadow-inner"
            >
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold text-slate-200">
                  Lote #{index + 1}
                </span>

                {form.unidades.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const unidades = form.unidades.filter(
                        (_, i) => i !== index
                      );

                      setForm({
                        ...form,
                        cantidad: unidades.length,
                        unidades,
                      });

                      setErrorMsg('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                  >
                    ✕ Eliminar lote
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Localidad *</label>
                  <select
                    value={unid.localidad}
                    required
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'localidad',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Seleccioná localidad
                    </option>

                    {LOCALIDADES.map((localidad) => (
                      <option key={localidad} value={localidad}>
                        {localidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    {unid.localidad === 'Otra'
                      ? 'Especificá la localidad *'
                      : 'Desarrollo / barrio *'}
                  </label>

                  {unid.localidad === 'Otra' ? (
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={unid.customLocalidad}
                      onChange={(e) =>
                        handleUnidadChange(
                          index,
                          'customLocalidad',
                          e.target.value
                        )
                      }
                      placeholder="Nombre de la localidad"
                      className={inputClass}
                    />
                  ) : (
                    <select
                      value={unid.desarrollo}
                      required
                      onChange={(e) =>
                        handleUnidadChange(
                          index,
                          'desarrollo',
                          e.target.value
                        )
                      }
                      className={inputClass}
                      disabled={!unid.localidad}
                    >
                      <option value="" disabled>
                        Seleccioná desarrollo
                      </option>

                      {(LOCALIDADES_MAP[unid.localidad] || []).map(
                        (desarrollo) => (
                          <option key={desarrollo} value={desarrollo}>
                            {desarrollo}
                          </option>
                        )
                      )}
                    </select>
                  )}
                </div>
              </div>

              {unid.localidad === 'Otra' && (
                <div>
                  <label className={labelClass}>
                    Nombre del desarrollo o barrio *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={unid.desarrollo}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'desarrollo',
                        e.target.value
                      )
                    }
                    placeholder="Nombre del barrio"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Número de lote *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={unid.numeroLote}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'numeroLote',
                        e.target.value.slice(0, 30)
                      )
                    }
                    placeholder="Ej.: 45, 45A o 12 bis"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Podés usar letras, números, espacios y guiones.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Manzana (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={unid.manzana}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'manzana',
                        e.target.value.slice(0, 30)
                      )
                    }
                    placeholder="Ej.: 3, 3B o A"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Si no sabés la manzana, dejá el campo vacío.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Situación del lote *
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    Elegí el problema principal que afecta a este lote.
                  </p>
                  <select
                    value={unid.problema}
                    required
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'problema',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Seleccioná la situación principal
                    </option>

                    {PROBLEMAS.map((problema) => (
                      <option key={problema} value={problema}>
                        {problema}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    ¿Dónde realizaste la operación? *
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    Indicá la empresa, inmobiliaria o vendedor.
                  </p>
                  <select
                    value={unid.entidadOperacion}
                    required
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'entidadOperacion',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Seleccioná dónde realizaste la operación
                    </option>

                    {ENTIDADES_OPERACION.map((entidad) => (
                      <option key={entidad} value={entidad}>
                        {entidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {unid.entidadOperacion === 'Otro' && (
                <div>
                  <label className={labelClass}>
                    Especificá la empresa, entidad o vendedor *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={unid.intermediario}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'intermediario',
                        e.target.value
                      )
                    }
                    placeholder="Nombre, si lo conocés"
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-800/60">
                <div>
                  <label className={labelClass}>
                    Año de compra o firma
                  </label>
                  <select
                    value={unid.anioCompra}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'anioCompra',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">No especificar</option>
                    {ANIOS_COMPRA.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Tipo de bien
                  </label>
                  <select
                    value={unid.tipoBien}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'tipoBien',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">No especificar</option>
                    {TIPOS_BIEN.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Tipo de contrato
                  </label>
                  <select
                    value={unid.tipoInstrumento}
                    onChange={(e) =>
                      handleUnidadChange(
                        index,
                        'tipoInstrumento',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">No especificar</option>
                    {TIPOS_INSTRUMENTO.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <details className="group border-t border-slate-800/80 pt-4">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                  <div>
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      Información financiera (opcional)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Forma de pago y estado del pago.
                    </p>
                  </div>
                  <span className="text-sky-400 text-sm transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 pb-1">
                  <div>
                    <label className={labelClass}>
                      Forma de pago / moneda
                    </label>
                    <select
                      value={unid.formaPago}
                      onChange={(e) =>
                        handleUnidadChange(
                          index,
                          'formaPago',
                          e.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">No especificar</option>
                      {FORMAS_PAGO.map((pago) => (
                        <option key={pago} value={pago}>
                          {pago}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Estado del pago
                    </label>
                    <select
                      value={unid.estadoPago}
                      disabled={
                        unid.formaPago === 'Pago total - USD' ||
                        unid.formaPago === 'Pago total - Pesos'
                      }
                      onChange={(e) =>
                        handleUnidadChange(
                          index,
                          'estadoPago',
                          e.target.value
                        )
                      }
                      className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">No especificar</option>
                      {ESTADOS_PAGO.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>

                    {(unid.formaPago === 'Pago total - USD' ||
                      unid.formaPago === 'Pago total - Pesos') && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        El pago total se considera finalizado.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-sky-500 cursor-pointer"
          />
          <span className="text-[11px] text-slate-400 leading-relaxed">
            🔒 Acepto que mis datos se guarden de forma confidencial en
            el marco de la Ley 25.326 de Protección de Datos Personales
            y se utilicen solamente con fines estadísticos y de coordinación
            legal. Mis datos de contacto no serán publicados. Puedo
            solicitar que se corrijan o eliminen escribiendo a
            @damnificadosunidos.
          </span>
        </label>

        {errorMsg && (
          <div
            role="alert"
            className="bg-amber-950/80 border border-amber-800/80 text-amber-300 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-3"
          >
            <span className="text-base">⚠️</span>
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-sky-500/25 cursor-pointer disabled:opacity-50"
        >
          {loading
            ? 'Guardando en la base de datos...'
            : 'Guardar mi caso'}
        </button>

        {success && (
          <div
            role="status"
            className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 p-4 rounded-xl text-xs sm:text-sm text-center font-medium"
          >
            <p>✓ ¡Registro guardado con éxito!</p>
            <p className="text-emerald-200/80 font-normal mt-1">
              Gracias por sumarte. Tu caso fue registrado correctamente.
            </p>
          </div>
        )}
      </form>
    </section>
  );
}