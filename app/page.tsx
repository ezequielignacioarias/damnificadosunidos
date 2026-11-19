'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import RegistroForm from '@/components/RegistroForm';
import Toast from '@/components/Toast';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import PreguntasFrecuentes from '@/components/PreguntasFrecuentes';
import AdminPanel from '@/components/AdminPanel';
import EstadisticasPublicas from '@/components/EstadisticasPublicas';

const SUPABASE_URL = 'https://anequmcpprmvrdattagm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cFIwIj4aD2AH21485elTrA_8DjUX-R1';
const ADMIN_UID = 'f7bfd7b3-84c2-44cd-8a31-20ab38f64182';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const LOCALIDADES_MAP: Record<string, string[]> = {
  Ybarlucea: ['Campo Madero 1', 'Campo Madero 2', 'El Naranjo 1', 'El Naranjo 2', 'Foresta', 'Vitta Norte'],
  Soldini: ['Orígenes'],
  Piñero: ['Los Muchachos'],
  'Pueblo Esther': ['Comunidad Evolutiva', 'Tierra de Autores'],
  Zavalla: ['Comunidad Evolutiva'],
  Alvear: ['Eco Pueblo'],
  Roldán: ['Clos del Este'],
  'General Lagos': ['Vitta', 'Vitta Río', 'Vitta Urbano'],
  Otra: [],
};

const LOCALIDADES = Object.keys(LOCALIDADES_MAP);

const celularValido = (valor: string): boolean => {
  const numero = valor.trim();
  const digitos = numero.replace(/\D/g, '');
  return numero.length <= 25 && /^\+?[\d\s().-]+$/.test(numero) && digitos.length >= 8 && digitos.length <= 15;
};

const TIPOS_BIEN = ['Lote urbano', 'Lote comercial', 'Lote mixto', 'Local o negocio'];
const TIPOS_INSTRUMENTO = [
  'Boleto de compraventa',
  'Contrato de adhesión / Fideicomiso',
  'Reserva / Seña',
  'Cesión de derechos',
  'Escritura traslativa de dominio',
  'Otro documento / Sin documentación',
];
const ANIOS_COMPRA = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016 o anterior'];
const FORMAS_PAGO = ['Pago total - USD', 'Pago total - Pesos', 'Financiado - USD', 'Financiado - Pesos', 'Otro / Mixto'];
const ESTADOS_PAGO = ['En curso', 'Finalizado'];
const ENTIDADES_OPERACION = ['Grupo Roma', 'JR', 'Ahora', 'V+V', 'Vendedor Particular', 'Intermediario', 'Otro'];
const PROBLEMAS = [
  'Demora en la fecha de entrega',
  'Obra frenada o sin avances',
  'Falta de posesión definitiva',
  'Imposibilidad para poder escriturar',
  'Falta de servicios básicos',
  'Incumplimiento contractual grave',
  'Otra situación / Caso especial',
];

interface UnidadItem {
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
}

interface Registro {
  id?: string;
  grupo_registro_id?: string;
  personas_afectadas_familia?: number | null;
  nombre?: string;
  celular?: string | null;
  localidad?: string;
  desarrollo: string;
  lote?: string | null;
  manzana?: string | null;
  unidad?: string | null;
  tipo_bien?: string;
  tipoBien?: string;
  tipo_contrato?: string;
  tipoInstrumento?: string;
  problema: string;
  anio_compra?: string;
  anioCompra?: string;
  forma_pago?: string;
  formaPago?: string;
  estado_pago?: string;
  estadoPago?: string;
  entidad_operacion?: string;
  entidadOperacion?: string;
  intermediario?: string;
  created_at?: string;
}

interface DesarrolloAnalisis {
  count: number;
  problema: string;
  entidad: string;
}

interface EstadisticasResumen {
  personas_registradas: number;
  lotes_registrados: number;
  barrios_afectados: number;
  familiares_afectados: number;
}

const ESTADISTICAS_VACIAS: EstadisticasResumen = {
  personas_registradas: 0,
  lotes_registrados: 0,
  barrios_afectados: 0,
  familiares_afectados: 0,
};

const nuevaUnidad = (): UnidadItem => ({
  localidad: '',
  customLocalidad: '',
  desarrollo: '',
  numeroLote: '',
  manzana: '',
  tipoBien: '',
  tipoInstrumento: '',
  problema: '',
  anioCompra: '',
  formaPago: '',
  estadoPago: '',
  entidadOperacion: '',
  intermediario: '',
});

const formularioInicial = () => ({
  nombre: '',
  celular: '',
  cantidad: 1,
  personasAfectadas: '',
  unidades: [nuevaUnidad()] as UnidadItem[],
});

const inputClass = 'w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 transition-colors';
const labelClass = 'block text-[11px] text-slate-300 mb-1.5 font-medium';

export default function Home() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [desarrollosPublicos, setDesarrollosPublicos] = useState<Record<string, DesarrolloAnalisis>>({});
  const [registrosPrivados, setRegistrosPrivados] = useState<Registro[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasResumen>(ESTADISTICAS_VACIAS);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [consent, setConsent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registroIdAEliminar, setRegistroIdAEliminar] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [form, setForm] = useState(formularioInicial);

  const showToast = useCallback((message: string) => setToastMessage(message), []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(false), 5000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const fetchPublicData = useCallback(async () => {
    const { data, error } = await supabase
      .from('analisis_publico_barrios')
      .select('localidad, desarrollo, lotes_registrados, problema_informado, entidad_involucrada')
      .order('localidad', { ascending: true })
      .order('desarrollo', { ascending: true });

    if (error) return false;

    const agrupados: Record<string, DesarrolloAnalisis> = {};
    for (const registro of data ?? []) {
      const localidad = registro.localidad?.trim() || 'Sin localidad';
      const desarrollo = registro.desarrollo?.trim() || 'Sin desarrollo';
      const clave = `${desarrollo} (${localidad})`;
      agrupados[clave] = {
        count: Number(registro.lotes_registrados ?? 0),
        problema: registro.problema_informado || 'Sin especificar',
        entidad: registro.entidad_involucrada || 'Sin especificar',
      };
    }

    setDesarrollosPublicos(agrupados);
    return true;
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    const { data, error } = await supabase
      .from('estadisticas_publicas')
      .select('personas_registradas, lotes_registrados, barrios_afectados, familiares_afectados')
      .single();

    if (error || !data) return false;

    setEstadisticas({
      personas_registradas: Number(data.personas_registradas ?? 0),
      lotes_registrados: Number(data.lotes_registrados ?? 0),
      barrios_afectados: Number(data.barrios_afectados ?? 0),
      familiares_afectados: Number(data.familiares_afectados ?? 0),
    });
    return true;
  }, []);

  const getAdminSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return data.session?.user.id === ADMIN_UID;
  }, []);

  const fetchPrivateData = useCallback(async () => {
    const autorizado = await getAdminSession();
    if (!autorizado) {
      setRegistrosPrivados([]);
      setIsAdmin(false);
      return false;
    }

    const { data, error } = await supabase.from('registros').select('*').order('created_at', { ascending: false });
    if (error) {
      setRegistrosPrivados([]);
      return false;
    }

    setRegistrosPrivados((data ?? []) as Registro[]);
    return true;
  }, [getAdminSession]);

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchPublicData(), fetchEstadisticas()]);
        if (!active) return;
        const autorizado = await getAdminSession();
        if (!active) return;
        setIsAdmin(autorizado);
        setAuthReady(true);
        if (autorizado) await fetchPrivateData();
      } catch (error) {
        console.error('Error inicial:', error);
      } finally {
        if (active) setInitialLoading(false);
      }
    };
    void loadInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const autorizado = session?.user.id === ADMIN_UID;
      setIsAdmin(autorizado);
      if (!autorizado) {
        setRegistrosPrivados([]);
        return;
      }
      window.setTimeout(() => { if (active) void fetchPrivateData(); }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchPublicData, fetchEstadisticas, fetchPrivateData, getAdminSession]);

  const confirmarEliminarRegistro = (id: string) => {
    if (!id || !isAdmin) return;
    setRegistroIdAEliminar(id);
    setDeleteModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!registroIdAEliminar || !isAdmin || !(await getAdminSession())) {
      setDeleteModalOpen(false);
      setRegistroIdAEliminar(null);
      return;
    }

    const { error } = await supabase.from('registros').delete().eq('id', registroIdAEliminar);
    if (error) {
      showToast('Error al eliminar: ' + error.message);
      return;
    }

    setDeleteModalOpen(false);
    setRegistroIdAEliminar(null);
    await Promise.all([fetchPrivateData(), fetchPublicData(), fetchEstadisticas()]);
    showToast('Registro eliminado correctamente.');
  };

  const CAMPOS_EDITABLES = new Set([
    'nombre',
    'celular',
    'localidad',
    'desarrollo',
    'lote',
    'manzana',
    'problema',
    'tipo_bien',
    'tipo_contrato',
    'anio_compra',
    'forma_pago',
    'estado_pago',
    'entidad_operacion',
    'intermediario',
  ]);

  const handleUpdateField = async (id: string, campo: string, valor: string) => {
    if (!CAMPOS_EDITABLES.has(campo) || !isAdmin || !(await getAdminSession())) return;

    const valorNormalizado = valor.trim();
    if (campo === 'celular' && !celularValido(valorNormalizado)) {
      showToast('Ingresá un celular válido (entre 8 y 15 dígitos).');
      return;
    }

    const { error } = await supabase.from('registros').update({ [campo]: valorNormalizado }).eq('id', id);
    if (error) {
      showToast('Error al actualizar: ' + error.message);
      return;
    }

    await Promise.all([fetchPrivateData(), fetchPublicData(), fetchEstadisticas()]);
    showToast('Registro actualizado correctamente.');
  };

  const handleCantidadChange = (qty: number) => {
    const cantidad = Math.max(1, Math.min(5, qty));
    setForm((prev) => {
      const unidades = [...prev.unidades];
      if (cantidad > unidades.length) {
        while (unidades.length < cantidad) unidades.push(nuevaUnidad());
      } else {
        unidades.splice(cantidad);
      }
      return { ...prev, cantidad, unidades };
    });
    setErrorMsg('');
  };

  const handleUnidadChange = (index: number, field: keyof UnidadItem, value: string) => {
    setForm((prev) => {
      const unidades = [...prev.unidades];
      const actual = { ...unidades[index] };

      if (field === 'localidad') {
        actual.localidad = value;
        actual.customLocalidad = '';
        actual.desarrollo = '';
        if (value !== 'Otra') {
          const desarrollos = LOCALIDADES_MAP[value] || [];
          if (desarrollos.length === 1) actual.desarrollo = desarrollos[0];
        }
      } else {
        actual[field] = value;
      }

      if (field === 'formaPago') {
        if (value === 'Pago total - USD' || value === 'Pago total - Pesos') {
          actual.estadoPago = 'Finalizado';
        } else if (actual.estadoPago === 'Finalizado' && ['Financiado - USD', 'Financiado - Pesos', 'Otro / Mixto'].includes(value)) {
          actual.estadoPago = '';
        }
      }

      if (field === 'entidadOperacion' && value !== 'Otro') {
        actual.intermediario = '';
      }

      unidades[index] = actual;
      return { ...prev, unidades };
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccess(false);

    if (!consent) {
      setErrorMsg('Para guardar tu caso tenés que aceptar el tratamiento de tus datos.');
      return;
    }
    if (form.nombre.trim().length < 2) {
      setErrorMsg('Ingresá tu nombre, apellido o alias.');
      return;
    }
    if (!celularValido(form.celular)) {
      setErrorMsg('Ingresá un celular válido.');
      return;
    }

    const cantidadPersonas = form.personasAfectadas.trim() === '' ? 0 : Number(form.personasAfectadas);
    if (!Number.isInteger(cantidadPersonas) || cantidadPersonas < 0 || cantidadPersonas > 5) {
      setErrorMsg('La cantidad de familiares debe estar entre 0 y 5.');
      return;
    }

    for (let i = 0; i < form.unidades.length; i++) {
      const unidad = form.unidades[i];
      const num = i + 1;
      if (!unidad.localidad) { setErrorMsg(`Seleccioná la localidad de la unidad ${num}.`); return; }
      if (unidad.localidad === 'Otra' && !unidad.customLocalidad.trim()) { setErrorMsg(`Especificá la localidad de la unidad ${num}.`); return; }
      if (!unidad.desarrollo.trim()) { setErrorMsg(`Completá el desarrollo de la unidad ${num}.`); return; }
      if (!unidad.numeroLote.trim()) { setErrorMsg(`El número de lote de la unidad ${num} es obligatorio.`); return; }
      if (!unidad.problema) { setErrorMsg(`Seleccioná la situación del lote ${num}.`); return; }
      if (!unidad.entidadOperacion) { setErrorMsg(`Seleccioná dónde se realizó la operación del lote ${num}.`); return; }
      if (unidad.entidadOperacion === 'Otro' && !unidad.intermediario.trim()) { setErrorMsg(`Especificá el vendedor de la unidad ${num}.`); return; }
    }

    setLoading(true);
    const rowsToInsert = form.unidades.map((unidad) => ({
      nombre: form.nombre.trim(),
      celular: form.celular.trim(),
      localidad: unidad.localidad === 'Otra' ? unidad.customLocalidad.trim() : unidad.localidad,
      desarrollo: unidad.desarrollo.trim(),
      lote: unidad.numeroLote.trim().replace(/\s+/g, ' '),
      manzana: unidad.manzana.trim().replace(/\s+/g, ' '),
      problema: unidad.problema,
      tipo_bien: unidad.tipoBien,
      tipo_contrato: unidad.tipoInstrumento,
      anio_compra: unidad.anioCompra,
      forma_pago: unidad.formaPago,
      estado_pago: unidad.estadoPago,
      entidad_operacion: unidad.entidadOperacion,
      intermediario: unidad.entidadOperacion === 'Otro' ? unidad.intermediario.trim() : '',
    }));

    try {
      const response = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rowsToInsert, personas_afectadas_familia: cantidadPersonas }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMsg(result.error || 'Hubo un error al registrar los casos.');
        return;
      }

      await Promise.all([fetchPublicData(), fetchEstadisticas()]);
      if (isAdmin) await fetchPrivateData();

      setForm(formularioInicial());
      setConsent(false);
      setSuccess(true);
      showToast('¡Registro guardado con éxito!');
    } catch {
      setErrorMsg('Error de conexión con el servidor. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword });

    if (error || data.user?.id !== ADMIN_UID) {
      if (data?.user?.id) await supabase.auth.signOut();
      setIsAdmin(false);
      setRegistrosPrivados([]);
      showToast('Acceso denegado o credenciales incorrectas.');
      return;
    }

    setIsAdmin(true);
    setShowAdminModal(false);
    setAdminEmail('');
    setAdminPassword('');
    await fetchPrivateData();
    showToast('Sesión de administrador iniciada.');
  };

  const handleAdminSignOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setRegistrosPrivados([]);
    showToast('Sesión cerrada correctamente.');
  };

  const totalRegistros = estadisticas.lotes_registrados;
  const metaObjetivo = (Math.floor(totalRegistros / 50) + 1) * 50;
  const tituloMeta = totalRegistros < 50 ? 'Objetivo inicial' : 'Objetivo actual';
  const porcentajeMeta = Math.min(100, Math.round((totalRegistros / metaObjetivo) * 100));
  const cantidadBarrios = estadisticas.barrios_afectados;

  const filteredDesarrollos = Object.entries(desarrollosPublicos).filter(([desarrollo]) =>
    desarrollo.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const exportCsv = async () => {
    if (!isAdmin || !(await getAdminSession()) || registrosPrivados.length === 0) return;

    const encabezados = [
      'Nombre', 'Personas en familia', 'Celular', 'Localidad', 'Desarrollo', 'Lote', 'Manzana',
      'Tipo de Bien', 'Tipo de Contrato', 'Problema', 'Año de Compra', 'Forma de Pago', 'Estado del Pago', 'Entidad', 'Intermediario', 'Fecha'
    ];

    const celda = (valor: unknown) => {
      let texto = String(valor ?? '');
      if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const filas = registrosPrivados.map((r) => {
      const fecha = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';
      const celular = r.celular && /^\d+$/.test(r.celular) ? `\t${r.celular}` : r.celular;
      return [
        r.nombre, r.personas_afectadas_familia, celular, r.localidad, r.desarrollo, r.lote, r.manzana,
        r.tipoBien || r.tipo_bien, r.tipoInstrumento || r.tipo_contrato, r.problema, r.anio_compra || r.anioCompra,
        r.forma_pago || r.formaPago, r.estado_pago || r.estadoPago, r.entidad_operacion || r.entidadOperacion, r.intermediario, fecha
      ].map(celda).join(';');
    });

    const csv = ['\uFEFF' + encabezados.map(celda).join(';'), ...filas].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'damnificados_registros_privados.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Reporte CSV descargado con éxito.');
  };

  const downloadCardAsImage = async () => {
    if (!isAdmin || !(await getAdminSession())) return;
    const node = document.getElementById('reporte-tarjeta-visual');
    if (!node) return;

    try {
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2, backgroundColor: '#080c14' });
      const link = document.createElement('a');
      link.download = `damnificados-reporte-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Imagen PNG generada con éxito.');
    } catch {
      showToast('No se pudo generar la imagen.');
    }
  };

  if (initialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <Image src="/logo-damnificados-unidos.png" alt="Damnificados Unidos" width={320} height={320} priority className="h-auto w-56 sm:w-64" />
          <p className="mt-5 text-sm font-medium text-slate-300">Preparando el formulario…</p>
          <div role="progressbar" aria-label="Cargando" className="relative mt-4 h-1 w-40 overflow-hidden rounded-full bg-slate-800">
            <div className="loading-bar h-full w-1/3 rounded-full bg-sky-400" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080c14] px-3 py-6 font-sans text-[#f1f5f9] selection:bg-sky-500 selection:text-white sm:px-6 sm:py-10">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 border-b border-slate-800/80 pb-6 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-sky-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <a href="https://instagram.com/damnificadosunidos" target="_blank" rel="noopener noreferrer" className="hover:underline">
              @damnificadosunidos
            </a>
          </div>

          <h1 className="mb-3 bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text px-2 text-2xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Registro de Damnificados
          </h1>

          <p className="mx-auto max-w-lg px-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
            Formulario online diseñado para generar una base de datos que permita dimensionar y gestionar la problemática existente.
          </p>
        </header>

        <EstadisticasPublicas
          seccion="resumen"
          totalRegistros={totalRegistros}
          metaObjetivo={metaObjetivo}
          tituloMeta={tituloMeta}
          porcentajeMeta={porcentajeMeta}
          cantidadBarrios={cantidadBarrios}
          personasRegistradas={estadisticas.personas_registradas}
          lotesRegistrados={estadisticas.lotes_registrados}
          barriosAfectados={estadisticas.barrios_afectados}
          familiaresAfectados={estadisticas.familiares_afectados}
          desarrollos={[]}
        />

        <RegistroForm
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          handleCantidadChange={handleCantidadChange}
          handleUnidadChange={handleUnidadChange}
          labelClass={labelClass}
          inputClass={inputClass}
          LOCALIDADES={LOCALIDADES}
          LOCALIDADES_MAP={LOCALIDADES_MAP}
          PROBLEMAS={PROBLEMAS}
          ENTIDADES_OPERACION={ENTIDADES_OPERACION}
          TIPOS_BIEN={TIPOS_BIEN}
          TIPOS_INSTRUMENTO={TIPOS_INSTRUMENTO}
          ANIOS_COMPRA={ANIOS_COMPRA}
          FORMAS_PAGO={FORMAS_PAGO}
          ESTADOS_PAGO={ESTADOS_PAGO}
          consent={consent}
          setConsent={setConsent}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          loading={loading}
          success={success}
        />

        <EstadisticasPublicas
          seccion="analisis"
          totalRegistros={totalRegistros}
          metaObjetivo={metaObjetivo}
          tituloMeta={tituloMeta}
          porcentajeMeta={porcentajeMeta}
          cantidadBarrios={cantidadBarrios}
          personasRegistradas={estadisticas.personas_registradas}
          lotesRegistrados={estadisticas.lotes_registrados}
          barriosAfectados={estadisticas.barrios_afectados}
          familiaresAfectados={estadisticas.familiares_afectados}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          desarrollos={filteredDesarrollos}
        />

        {authReady && isAdmin && (
          <AdminPanel
            registrosPrivados={registrosPrivados}
            unidadesRegistradas={totalRegistros}
            cantidadBarrios={cantidadBarrios}
            onSignOut={handleAdminSignOut}
            onDelete={confirmarEliminarRegistro}
            onUpdateField={handleUpdateField}
            onExportCsv={exportCsv}
            onDownloadImage={downloadCardAsImage}
          />
        )}

        <ModalConfirmacion
          isOpen={deleteModalOpen}
          onConfirm={() => void ejecutarEliminacion()}
          onCancel={() => { setDeleteModalOpen(false); setRegistroIdAEliminar(null); }}
        />

        <PreguntasFrecuentes />

        <footer className="space-y-3 border-t border-slate-800/80 pb-8 pt-6 text-center">
          <p className="text-xs text-slate-500">Plataforma comunitaria autogestionada por propietarios y afectados.</p>
          {!isAdmin && (
            <button type="button" onClick={() => setShowAdminModal(true)} className="cursor-pointer text-xs text-slate-600 hover:text-sky-400">
              🔒 Acceso exclusivo administradores
            </button>
          )}
        </footer>

        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="mb-3 text-sm font-bold text-white">🔐 Acceso restringido</h3>
              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <input
                  type="email"
                  placeholder="Correo de administrador"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-sky-400 focus:outline-none sm:text-sm"
                  required
                  autoFocus
                  autoComplete="username"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-sky-400 focus:outline-none sm:text-sm"
                  required
                  autoComplete="current-password"
                />
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 cursor-pointer rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-500 sm:text-sm">
                    Entrar
                  </button>
                  <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-2.5 text-xs text-slate-300 hover:bg-slate-700 sm:text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}