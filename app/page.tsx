'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anequmcpprmvrdattagm.supabase.co';
const supabaseAnonKey = 'sb_publishable_cFIwIj4aD2AH21485elTrA_8DjUX-R1';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCALIDADES_MAP: Record<string, string[]> = {
  'Ybarlucea': ['Campo Madero 1', 'Campo Madero 2', 'El Naranjo 1', 'El Naranjo 2', 'Foresta', 'Vitta Norte'],
  'Soldini': ['Orígenes'],
  'Piñero': ['Los Muchachos'],
  'Pueblo Esther': ['Comunidad Evolutiva', 'Tierra de Autores'],
  'Zavalla': ['Comunidad Evolutiva'],
  'Alvear': ['Eco Pueblo'],
  'Roldán': ['Clos del Este'],
  'General Lagos': ['Vitta', 'Vitta Río', 'Vitta Urbano'],
  'Otra': [],
};

const LOCALIDADES = Object.keys(LOCALIDADES_MAP);

interface UnidadItem {
  localidad: string;
  customLocalidad: string;
  desarrollo: string;
  unidad: string;
  tipoBien: string;
  problema: string;
  anioCompra: string;
  formaPago: string;
  estadoPago: string;
  entidadOperacion: string;
  intermediario: string;
}

interface Registro {
  id?: string;
  nombre?: string;
  email?: string;
  contacto?: string;
  tipo_contacto?: string;
  localidad?: string;
  desarrollo: string;
  unidad?: string;
  tipoBien?: string;
  tipo_bien?: string;
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

const TIPOS_BIEN = [
  'Lote urbano',
  'Lote comercial',
  'Lote mixto',
  'Local o negocio'
];

const ANIOS_COMPRA = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016 o anterior'
];

const FORMAS_PAGO = [
  'Pago total - USD',
  'Pago total - Pesos',
  'Financiado - USD',
  'Financiado - Pesos',
  'Otro / Mixto'
];

const ESTADOS_PAGO = [
  'En curso',
  'Finalizado'
];

const ENTIDADES_OPERACION = [
  'Grupo Roma',
  'JR',
  'Ahora',
  'V+V',
  'Vendedor Particular',
  'Intermediario',
  'Otro',
];

const FAQ_DATA = [
  {
    q: '¿Tiene algún costo sumarse al registro?',
    a: 'No, el registro es gratuito y confidencial. El único objetivo es dimensionar el volumen real de afectados.'
  },
  {
    q: '¿Qué pasa con mis datos personales?',
    a: 'Los datos registrados se resguardan de forma estrictamente confidencial en la base de datos bajo el amparo de la Ley 25.326 de Protección de Datos Personales. Solo serán utilizados para fines estadísticos.'
  },
  {
    q: '¿Quiénes están organizando esta iniciativa?',
    a: 'Es un espacio autogestionado por vecinos de los diferentes desarrollos vinculados al Grupo Roma.'
  }
];

export default function Home() {
  const [registrosPublicos, setRegistrosPublicos] = useState<Registro[]>([]);
  const [registrosPrivados, setRegistrosPrivados] = useState<Registro[]>([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registroIdAEliminar, setRegistroIdAEliminar] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    tipoContacto: '',
    contacto: '',
    email: '',
    cantidad: 1,
    unidades: [
      {
        localidad: '',
        customLocalidad: '',
        desarrollo: '',
        unidad: '',
        tipoBien: '',
        problema: '',
        anioCompra: '',
        formaPago: '',
        estadoPago: '',
        entidadOperacion: '',
        intermediario: ''
      }
    ] as UnidadItem[]
  });

  const fetchPublicData = async () => {
    const { data, error } = await supabase
      .from('registros_publicos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al cargar análisis público:', error.message);
    } else if (data) {
      setRegistrosPublicos(data);
    }
  };

  const fetchPrivateData = async () => {
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al cargar panel privado:', error.message);
    } else if (data) {
      setRegistrosPrivados(data);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchPublicData();

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAdmin(true);
        fetchPrivateData();
      }
    };

    loadInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
      if (session) {
        fetchPrivateData();
      } else {
        setRegistrosPrivados([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdateField = async (id: string, campo: string, valor: string) => {
    const valorLimpio = valor.trim();
    const { error } = await supabase
      .from('registros')
      .update({ [campo]: valorLimpio })
      .eq('id', id);

    if (error) {
      showToast('Error al actualizar el registro: ' + error.message);
    } else {
      fetchPrivateData();
      fetchPublicData();
      showToast('Registro actualizado correctamente.');
    }
  };

  const confirmarEliminarRegistro = (id: string) => {
    setRegistroIdAEliminar(id);
    setDeleteModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!registroIdAEliminar) return;

    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('id', registroIdAEliminar);

    setDeleteModalOpen(false);
    setRegistroIdAEliminar(null);

    if (error) {
      showToast('Error al eliminar: ' + error.message);
    } else {
      fetchPrivateData();
      fetchPublicData();
      showToast('Registro eliminado con éxito.');
    }
  };

  const handleCantidadChange = (qty: number) => {
    const nuevaCantidad = Math.max(1, Math.min(10, qty));
    const unidadesActuales = [...form.unidades];
    
    if (nuevaCantidad > unidadesActuales.length) {
      for (let i = unidadesActuales.length; i < nuevaCantidad; i++) {
        unidadesActuales.push({
          localidad: '',
          customLocalidad: '',
          desarrollo: '',
          unidad: '',
          tipoBien: '',
          problema: '',
          anioCompra: '',
          formaPago: '',
          estadoPago: '',
          entidadOperacion: '',
          intermediario: ''
        });
      }
    } else {
      unidadesActuales.splice(nuevaCantidad);
    }

    setForm({ ...form, cantidad: nuevaCantidad, unidades: unidadesActuales });
  };

  const handleUnidadChange = (index: number, field: keyof UnidadItem, value: string) => {
    const nuevasUnidades = [...form.unidades];
    
    if (field === 'localidad') {
      if (value === 'Otra') {
        nuevasUnidades[index] = {
          ...nuevasUnidades[index],
          localidad: value,
          customLocalidad: '',
          desarrollo: ''
        };
      } else {
        const posiblesDesarrollos = LOCALIDADES_MAP[value] || [];
        nuevasUnidades[index] = {
          ...nuevasUnidades[index],
          localidad: value,
          customLocalidad: '',
          desarrollo: posiblesDesarrollos[0] || ''
        };
      }
    } else {
      nuevasUnidades[index] = { ...nuevasUnidades[index], [field]: value };
    }

    if (field === 'formaPago') {
      if (value === 'Pago total - USD' || value === 'Pago total - Pesos') {
        nuevasUnidades[index].estadoPago = 'Finalizado';
      }
    }
    
    if (field === 'entidadOperacion' && value !== 'Otro') {
      nuevasUnidades[index].intermediario = '';
    }

    setForm({ ...form, unidades: nuevasUnidades });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    const limpiarUnidad = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(lote|mz|manzana|unidad|n[°º]?)\b/g, '')
        .replace(/[^a-z0-9]/g, '');
    };

    for (const u of form.unidades) {
      const localidadFinal = u.localidad === 'Otra' ? (u.customLocalidad || 'Otra') : u.localidad;
      const desarrolloFinal = u.localidad === 'Otra' ? (u.desarrollo || 'Sin especificar') : u.desarrollo;
      const unidadIngresadaLimpia = limpiarUnidad(u.unidad);

      const { data: existingData, error: checkError } = await supabase
        .from('registros')
        .select('desarrollo, localidad, unidad')
        .eq('localidad', localidadFinal)
        .eq('desarrollo', desarrolloFinal);

      if (!checkError && existingData) {
        const duplicado = existingData.some(
          r => limpiarUnidad(r.unidad || '') === unidadIngresadaLimpia
        );

        if (duplicado) {
          setLoading(false);
          setErrorMsg(`La unidad "${u.unidad}" en "${desarrolloFinal}" (${localidadFinal}) ya se encuentra registrada en la base de datos.`);
          return;
        }
      }
    }

    const rowsToInsert = form.unidades.map(u => {
      const localidadFinal = u.localidad === 'Otra' ? (u.customLocalidad || 'Otra') : u.localidad;
      const desarrolloFinal = u.localidad === 'Otra' ? (u.desarrollo || 'Sin especificar') : u.desarrollo;

      return {
        nombre: form.nombre.trim(),
        tipo_contacto: form.tipoContacto,
        contacto: (form.tipoContacto === 'Celular' || form.tipoContacto === 'Ambos') ? form.contacto.trim() : null,
        email: (form.tipoContacto === 'Correo' || form.tipoContacto === 'Ambos') ? form.email.trim().toLowerCase() : null,
        localidad: localidadFinal,
        desarrollo: desarrolloFinal,
        unidad: u.unidad.trim(),
        tipo_bien: u.tipoBien,
        problema: u.problema,
        anio_compra: u.anioCompra,
        forma_pago: u.formaPago,
        estado_pago: u.estadoPago,
        entidad_operacion: u.entidadOperacion,
        intermediario: u.entidadOperacion === 'Otro' ? u.intermediario.trim() : ''
      };
    });

    try {
      const response = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rowsToInsert }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        setErrorMsg(result.error || 'Hubo un error al registrar los casos.');
        return;
      }

      setLoading(false);
      fetchPublicData();
      if (isAdmin) fetchPrivateData();

      setForm({ 
        nombre: '', 
        tipoContacto: '',
        contacto: '',
        email: '',
        cantidad: 1,
        unidades: [
          {
            localidad: '',
            customLocalidad: '',
            desarrollo: '',
            unidad: '',
            tipoBien: '',
            problema: '',
            anioCompra: '',
            formaPago: '',
            estadoPago: '',
            entidadOperacion: '',
            intermediario: ''
          }
        ]
      });
      setSuccess(true);
      showToast('¡Registro guardado con éxito!');
      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Error de conexión con el servidor. Inténtalo nuevamente.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      showToast('Acceso denegado: ' + error.message);
    } else {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminEmail('');
      setAdminPassword('');
      fetchPrivateData();
      showToast('Sesión de administrador iniciada.');
    }
  };

  const totalRegistros = registrosPublicos.length;
  const metaObjetivo = totalRegistros < 50 ? 50 : Math.ceil((totalRegistros + 1) / 50) * 50;
  const tituloMeta = totalRegistros < 50 ? 'Meta Inicial' : 'Meta Actual';
  const porcentajeMeta = Math.min(100, Math.round((totalRegistros / metaObjetivo) * 100));

  const desarrollosAgrupados = registrosPublicos.reduce((acc: Record<string, { 
    count: number; 
    problemasMap: Record<string, number>;
    entidadesMap: Record<string, number>;
  }>, r) => {
    const claveDesarrollo = `${r.desarrollo} (${r.localidad || 'Sin localidad'})`;
    if (!acc[claveDesarrollo]) {
      acc[claveDesarrollo] = { count: 0, problemasMap: {}, entidadesMap: {} };
    }
    acc[claveDesarrollo].count++;
    
    const prob = r.problema || 'Sin especificar';
    acc[claveDesarrollo].problemasMap[prob] = (acc[claveDesarrollo].problemasMap[prob] || 0) + 1;

    const entidad = r.entidad_operacion || r.entidadOperacion || 'Sin especificar';
    acc[claveDesarrollo].entidadesMap[entidad] = (acc[claveDesarrollo].entidadesMap[entidad] || 0) + 1;

    return acc;
  }, {});

  const desarrollosAnalisis: Record<string, { 
    count: number; 
    problema: string; 
    entidad: string;
  }> = {};

  for (const [dev, data] of Object.entries(desarrollosAgrupados)) {
    let maxProb = '', maxEntidad = '';
    let maxProbCount = -1, maxEntidadCount = -1;

    for (const [prob, count] of Object.entries(data.problemasMap)) {
      if (count > maxProbCount) { maxProbCount = count; maxProb = prob; }
    }
    for (const [ent, count] of Object.entries(data.entidadesMap)) {
      if (count > maxEntidadCount) { maxEntidadCount = count; maxEntidad = ent; }
    }

    desarrollosAnalisis[dev] = { 
      count: data.count, 
      problema: maxProb, 
      entidad: maxEntidad
    };
  }

  const filteredDesarrollos = Object.entries(desarrollosAnalisis).filter(([dev]) =>
    dev.toLowerCase().includes(busqueda.toLowerCase())
  );

  const exportCsv = () => {
    if (registrosPrivados.length === 0) return showToast('No hay datos para exportar.');
    
    let csv = '\uFEFFNombre;Tipo Contacto;Contacto;Email;Localidad;Desarrollo;Unidad;Tipo de Bien;Problema;Año de Compra;Forma de Pago;Estado del Pago;Entidad Operación;Intermediario;Fecha\n';
    
    registrosPrivados.forEach(r => {
      const fechaFormateada = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';
      const contactoLimpio = r.contacto ? `\t${r.contacto}` : '';
      
      csv += `"${r.nombre || ''}";"${r.tipo_contacto || ''}";"${contactoLimpio}";"${r.email || ''}";"${r.localidad || ''}";"${r.desarrollo}";"${r.unidad || ''}";"${r.tipoBien || r.tipo_bien || ''}";"${r.problema}";"${r.anio_compra || r.anioCompra || ''}";"${r.forma_pago || r.formaPago || ''}";"${r.estado_pago || r.estadoPago || ''}";"${r.entidad_operacion || r.entidadOperacion || ''}";"${r.intermediario || ''}";"${fechaFormateada}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'damnificados_registros_privados.csv';
    link.click();
    showToast('Reporte CSV descargado con éxito.');
  };

  const downloadCardAsImage = async () => {
    const node = document.getElementById('reporte-tarjeta-visual');
    if (node) {
      try {
        const htmlToImage = await import('html-to-image');
        node.style.opacity = '1';
        const dataUrl = await htmlToImage.toPng(node, { quality: 0.95, backgroundColor: '#080c14' });
        node.style.opacity = '0';
        
        const link = document.createElement('a');
        link.download = `damnificados-reporte-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
        showToast('Imagen PNG generada con éxito.');
      } catch (err) {
        console.error('Error al generar la imagen:', err);
        const node = document.getElementById('reporte-tarjeta-visual');
        if (node) node.style.opacity = '0';
        showToast('No se pudo generar la imagen del reporte.');
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-[#f1f5f9] px-3 sm:px-6 py-6 sm:py-10 font-sans overflow-x-hidden selection:bg-sky-500 selection:text-white relative">

      {toastMessage && (
        <div key={toastMessage} className="fixed bottom-6 right-8 sm:right-6 z-50 bg-slate-900 border border-sky-500/50 text-sky-200 rounded-xl shadow-2xl text-xs font-medium animate-fade-in max-w-[240px] sm:max-w-xs overflow-hidden">
          <div className="flex items-center gap-2 p-3 pb-2.5">
            <span className="text-sky-400 shrink-0 text-sm">ℹ️</span>
            <span className="leading-tight break-words flex-1">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold px-1"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-slate-950 h-1">
            <div className="bg-sky-400 h-full w-full animate-toast-progress"></div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-progress {
          animation: toastProgress 4s linear forwards;
        }
      `}</style>

      <div className="max-w-3xl mx-auto w-full">
        
        <header className="text-center mb-8 pb-6 border-b border-slate-800/80 relative">
          <div className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-sky-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm hover:border-sky-500/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <a href="https://instagram.com/damnificadosunidos" target="_blank" rel="noopener noreferrer" className="hover:underline">
              @damnificadosunidos
            </a>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-200 tracking-tight mb-3 px-2">
            Registro de Damnificados
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto px-2 leading-relaxed">
            Web diseñada para generar una base de datos que permita dimensionar y gestionar la problemática existente.
          </p>
        </header>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-sky-400">🎯</span> {tituloMeta}: {metaObjetivo} Registros
            </span>
            <span className="text-xs font-extrabold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-0.5 rounded-full">
              {totalRegistros} / {metaObjetivo}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800/80 p-0.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.4)]" 
              style={{ width: `${porcentajeMeta}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            {totalRegistros < 50 
              ? 'Objetivo inicial de 50 registros para dimensionar el impacto real en la región. ¡Compartí la página con otros vecinos afectados!' 
              : `Objetivo actualizado a ${metaObjetivo} registros para dimensionar el impacto real en la región. ¡Compartí la página con otros vecinos afectados!`
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-md">
            <div className="text-2xl sm:text-3xl font-black text-sky-400 mb-0.5">
              {Object.keys(desarrollosAnalisis).length}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Barrios Afectados</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center shadow-md">
            <div className="text-2xl sm:text-3xl font-black text-sky-400 mb-0.5">
              {totalRegistros}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidades Registradas</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-xl">
          <h2 className="text-base sm:text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
            <span>📝</span> Registrar mi caso
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">Nombre y Apellido (o Alias)</label>
                <input 
                  type="text" 
                  required 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value})} 
                  placeholder="Ej: Juan Pérez" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">Medio de contacto</label>
                <select 
                  value={form.tipoContacto} 
                  required
                  onChange={e => {
                    const nuevoTipo = e.target.value;
                    setForm({
                      ...form, 
                      tipoContacto: nuevoTipo,
                      contacto: nuevoTipo === 'Correo' ? '' : form.contacto,
                      email: nuevoTipo === 'Celular' ? '' : form.email
                    });
                  }} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400 transition-colors"
                >
                  <option value="" disabled>Seleccione medio de contacto</option>
                  <option value="Celular">Celular</option>
                  <option value="Correo">Correo</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form.tipoContacto === 'Celular' || form.tipoContacto === 'Ambos') && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-medium">Número de Celular / WhatsApp</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={15}
                    minLength={8}
                    value={form.contacto} 
                    onChange={e => setForm({...form, contacto: e.target.value.replace(/\D/g, '')})} 
                    placeholder="Ej: 3415123456" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400 transition-colors" 
                  />
                </div>
              )}

              {(form.tipoContacto === 'Correo' || form.tipoContacto === 'Ambos') && (
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-medium">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    placeholder="Ej: juan@email.com" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400 transition-colors" 
                  />
                </div>
              )}

<div>
  <label className="block text-xs text-slate-300 mb-1.5 font-medium">Cantidad de Unidades / Lotes a Registrar</label>
  <input 
    type="text" 
    inputMode="numeric"
    pattern="[0-9]*"
    required 
    value={form.cantidad === 1 ? '' : form.cantidad}
    placeholder="1"
    onFocus={(e) => {
      // Al hacer foco, si vale 1, limpiamos visualmente para que no moleste
      e.target.value = '';
    }}
    onChange={e => {
      const val = e.target.value.replace(/\D/g, '');
      if (val === '') {
        setForm({ ...form, cantidad: 1 });
      } else {
        const num = parseInt(val, 10);
        handleCantidadChange(num > 5 ? 5 : num);
      }
    }}
    onBlur={(e) => {
      if (e.target.value === '' || !form.cantidad) {
        handleCantidadChange(1);
      }
    }}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400 transition-colors" 
  />
</div>
            </div>

            <div className="border-t border-slate-800/80 pt-5 mt-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span>🔑</span> Detalle de las unidades adquiridas
              </h3>
              
              {form.unidades.map((unid, index) => (
                <div key={index} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 mb-4 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-2.5">
                    <span>Unidad / Lote #{index + 1}</span>
                    {form.unidades.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          const nuevasUnidades = form.unidades.filter((_, i) => i !== index);
                          setForm({ ...form, cantidad: nuevasUnidades.length, unidades: nuevasUnidades });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        ✕ Eliminar unidad
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Localidad</label>
                      <select value={unid.localidad} required onChange={e => handleUnidadChange(index, 'localidad', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione localidad</option>
                        {LOCALIDADES.map((loc, idx) => (
                          <option key={idx} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                        {unid.localidad === 'Otra' ? 'Especifique la localidad' : 'Desarrollo / Barrio'}
                      </label>

                      {unid.localidad === 'Otra' ? (
                        <input 
                          type="text" 
                          required 
                          value={unid.customLocalidad} 
                          onChange={e => handleUnidadChange(index, 'customLocalidad', e.target.value)} 
                          placeholder="Nombre de la ubicación" 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400" 
                        />
                      ) : (
                        <select value={unid.desarrollo} required onChange={e => handleUnidadChange(index, 'desarrollo', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                          <option value="" disabled>Seleccione desarrollo</option>
                          {(LOCALIDADES_MAP[unid.localidad] || []).map((proy, idx) => (
                            <option key={idx} value={proy}>{proy}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {unid.localidad === 'Otra' && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Especifique el barrio</label>
                      <input 
                        type="text" 
                        required 
                        value={unid.desarrollo} 
                        onChange={e => handleUnidadChange(index, 'desarrollo', e.target.value)} 
                        placeholder="Nombre del desarrollo" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400" 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">N° de Lote / Manzana / Unidad</label>
                      <input type="text" required value={unid.unidad} onChange={e => handleUnidadChange(index, 'unidad', e.target.value)} placeholder="Ej: Lote 45 - Manzana 3" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Bien Adquirido</label>
                      <select value={unid.tipoBien} required onChange={e => handleUnidadChange(index, 'tipoBien', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione tipo de bien</option>
                        {TIPOS_BIEN.map((tipo, idx) => (
                          <option key={idx} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Situación Principal</label>
                      <select value={unid.problema} required onChange={e => handleUnidadChange(index, 'problema', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione situación principal</option>
                        <option value="Demora en la fecha de entrega">Demora en la fecha de entrega</option>
                        <option value="Obra frenada o sin avances">Obra frenada o sin avances</option>
                        <option value="Falta de posesión o posesión precaria">Falta de posesión o posesión precaria</option>
                        <option value="Imposibilidad para poder escriturar">Imposibilidad para poder escriturar</option>
                        <option value="Falta de servicios básicos">Falta de servicios básicos (luz, agua, gas)</option>
                        <option value="Incumplimiento contractual grave">Incumplimiento contractual grave</option>
                        <option value="Otra situación / Caso especial">Otra situación / Caso especial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Año de Compra / Firma</label>
                      <select value={unid.anioCompra} required onChange={e => handleUnidadChange(index, 'anioCompra', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione año de compra</option>
                        {ANIOS_COMPRA.map((anio, idx) => (
                          <option key={idx} value={anio}>{anio}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Forma de Pago / Moneda</label>
                      <select value={unid.formaPago} required onChange={e => handleUnidadChange(index, 'formaPago', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione forma de pago</option>
                        {FORMAS_PAGO.map((pago, idx) => (
                          <option key={idx} value={pago}>{pago}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Estado del Pago</label>
                      <select 
                        value={unid.estadoPago} 
                        required
                        disabled={unid.formaPago === 'Pago total - USD' || unid.formaPago === 'Pago total - Pesos'}
                        onChange={e => handleUnidadChange(index, 'estadoPago', e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>Seleccione estado</option>
                        {ESTADOS_PAGO.map((est, idx) => (
                          <option key={idx} value={est}>{est}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">¿Dónde realizó la operación?</label>
                      <select value={unid.entidadOperacion} required onChange={e => handleUnidadChange(index, 'entidadOperacion', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400">
                        <option value="" disabled>Seleccione entidad</option>
                        {ENTIDADES_OPERACION.map((ent, idx) => (
                          <option key={idx} value={ent}>{ent}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {unid.entidadOperacion === 'Otro' && (
                    <div className="pt-1 animate-fade-in">
                      <label className="block text-[11px] text-slate-400 mb-1 font-medium">Especifique (Otro)</label>
                      <input 
                        type="text" 
                        required
                        value={unid.intermediario} 
                        onChange={e => handleUnidadChange(index, 'intermediario', e.target.value)} 
                        placeholder="Empresa, entidad o vendedor" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400" 
                      />
                    </div>
                  )}

                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 italic leading-relaxed pt-1">
              🔒 Tus datos están protegidos en el marco de la Ley 25.326 de Protección de Datos Personales y se utilizan confidencialmente.
            </p>

            {errorMsg && (
              <div className="bg-amber-950/80 border border-amber-800/80 text-amber-300 p-4 rounded-xl text-xs sm:text-sm my-4 font-medium flex items-start gap-3 animate-fade-in shadow-md">
                <span className="text-base">⚠️</span>
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-sky-500/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando en la base de datos...' : 'Guardar en la base de datos'}
            </button>

            {success && (
              <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 p-3.5 rounded-xl text-xs sm:text-sm mt-4 text-center font-medium animate-fade-in shadow-md">
                ¡Registro guardado con éxito en la base de datos! Gracias por sumarte.
              </div>
            )}
          </form>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
            <h2 className="text-base sm:text-lg font-bold text-sky-400 flex items-center gap-2">
              <span>📊</span> Análisis por Barrio / Localidad (Público)
            </h2>
            <input
              type="text"
              placeholder="🔍 Buscar desarrollo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 w-full md:w-60 transition-colors"
            />
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-4 font-semibold">Desarrollo</th>
                  <th className="pb-3 pr-4 font-semibold">Registros</th>
                  <th className="pb-3 pr-4 font-semibold">Canal Principal</th>
                  <th className="pb-3 font-semibold">Mayor problema reportado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDesarrollos.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">No se encontraron desarrollos con ese nombre.</td></tr>
                ) : (
                  filteredDesarrollos.map(([dev, info], idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-slate-100">{dev}</td>
                      <td className="py-3.5 pr-4">
                        <span className="bg-sky-600/90 text-white font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          {info.count}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300">{info.entidad}</td>
                      <td className="py-3.5 text-slate-300">{info.problema}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-5 sm:p-7 mb-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-2">
                <span>🔒</span> Panel Privado de Administrador
              </h2>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsAdmin(false);
                  setRegistrosPrivados([]);
                  showToast('Sesión cerrada correctamente.');
                }}
                className="text-xs text-slate-400 hover:text-red-400 underline cursor-pointer transition-colors"
              >
                Cerrar sesión de admin
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-4">Listado completo con datos sensibles para uso exclusivo de coordinación legal. Modifica cualquier campo directamente haciendo clic afuera (blur).</p>
            
            <div className="overflow-x-auto max-h-96 mb-4 border border-slate-800 rounded-xl -mx-5 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left text-xs min-w-[1300px]">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-16">Acciones</th>
                    <th className="p-3 w-24">Fecha</th>
                    <th className="p-3 w-36">Nombre</th>
                    <th className="p-3 w-24">Tipo Cto.</th>
                    <th className="p-3 w-32">Contacto</th>
                    <th className="p-3 w-48">Email</th>
                    <th className="p-3 w-28">Localidad</th>
                    <th className="p-3 w-36">Desarrollo</th>
                    <th className="p-3 w-28">Unidad</th>
                    <th className="p-3 w-44">Problema</th>
                    <th className="p-3 w-20">Año</th>
                    <th className="p-3 w-32">Pago</th>
                    <th className="p-3 w-28">Estado Pago</th>
                    <th className="p-3 w-32">Canal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {registrosPrivados.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-3">
                        <button
                          onClick={() => r.id && confirmarEliminarRegistro(r.id)}
                          title="Eliminar registro"
                          className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          🗑️
                        </button>
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.nombre || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.nombre) {
                              handleUpdateField(r.id, 'nombre', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3 text-sky-400 font-medium">{r.tipo_contacto || '-'}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.contacto || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.contacto) {
                              handleUpdateField(r.id, 'contacto', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.email || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.email) {
                              handleUpdateField(r.id, 'email', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.localidad || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.localidad) {
                              handleUpdateField(r.id, 'localidad', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.desarrollo || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.desarrollo) {
                              handleUpdateField(r.id, 'desarrollo', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.unidad || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.unidad) {
                              handleUpdateField(r.id, 'unidad', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={r.problema || ''}
                          onBlur={(e) => {
                            if (r.id && e.target.value !== r.problema) {
                              handleUpdateField(r.id, 'problema', e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-emerald-400"
                        />
                      </td>
                      <td className="p-3 text-slate-300">{r.anio_compra || r.anioCompra || '-'}</td>
                      <td className="p-3 text-slate-300">{r.forma_pago || r.formaPago || '-'}</td>
                      <td className="p-3 text-slate-300">{r.estado_pago || r.estadoPago || '-'}</td>
                      <td className="p-3 text-slate-300">{r.entidad_operacion || r.entidadOperacion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={exportCsv} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📥</span> Descargar Reporte Completo (CSV)
              </button>
              
              <button 
                onClick={downloadCardAsImage}
                className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold px-4 py-3.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📸</span> Descargar Resumen como Imagen PNG
              </button>
            </div>

            <div className="relative h-0 overflow-hidden pointer-events-none">
              <div 
                id="reporte-tarjeta-visual" 
                className="bg-[#080c14] border border-slate-800 rounded-2xl p-8 shadow-2xl w-[600px] text-slate-100 font-sans opacity-0 absolute top-0 left-0"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-extrabold text-sky-400 tracking-wider uppercase">@damnificadosunidos</span>
                    <h3 className="text-xl font-black text-white mt-1">Reporte de Situación Colectiva</h3>
                  </div>
                  <span className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-black text-sky-400 mb-1">{Object.keys(desarrollosAnalisis).length}</div>
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Barrios Afectados</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-black text-emerald-400 mb-1">{totalRegistros}</div>
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Unidades Involucradas</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center border-t border-slate-800 pt-4 leading-relaxed">
                  Base de datos comunitaria autogestionada • Ley 25.326 de Protección de Datos Personales
                </div>
              </div>
            </div>

          </div>
        )}

        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-3 text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="text-sm font-bold text-white mb-2">¿Eliminar registro?</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Esta acción eliminará permanentemente el registro seleccionado de la base de datos de forma irreversible.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={ejecutarEliminacion} 
                  className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-xs sm:text-sm font-bold hover:bg-red-500 cursor-pointer transition-colors shadow-lg shadow-red-600/20"
                >
                  Sí, eliminar
                </button>
                <button 
                  onClick={() => { setDeleteModalOpen(false); setRegistroIdAEliminar(null); }} 
                  className="flex-1 bg-slate-800 text-slate-300 rounded-xl py-2.5 text-xs sm:text-sm hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-8 shadow-xl">
          <h2 className="text-base sm:text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
            <span>❓</span> Preguntas Frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ_DATA.map((item, idx) => (
              <div key={idx} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full text-left p-4 text-xs sm:text-sm font-semibold text-white flex justify-between items-center hover:bg-slate-900/80 transition-colors cursor-pointer gap-3"
                >
                  <span>{item.q}</span>
                  <span className="text-sky-400 text-base font-bold shrink-0">{faqOpen === idx ? '−' : '+'}</span>
                </button>
                {faqOpen === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 border-t border-slate-900/80 leading-relaxed bg-slate-950/90">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center border-t border-slate-800/80 pt-6 pb-8 space-y-3">
          <p className="text-xs text-slate-500">
            Plataforma comunitaria autogestionada por propietarios y afectados.
          </p>
          {!isAdmin && (
            <div>
              <button 
                onClick={() => setShowAdminModal(true)}
                className="text-xs text-slate-600 hover:text-sky-400 transition-colors cursor-pointer"
              >
                🔒 Acceso exclusivo administradores
              </button>
            </div>
          )}
        </footer>

        {showAdminModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-3">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span>🔐</span> Acceso Restringido
              </h3>
              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <input 
                  type="email" 
                  placeholder="Correo de administrador" 
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  required
                  autoFocus
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  required
                />
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 bg-sky-600 text-white rounded-xl py-2.5 text-xs sm:text-sm font-bold hover:bg-sky-500 cursor-pointer transition-colors">
                    Entrar
                  </button>
                  <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 bg-slate-800 text-slate-300 rounded-xl py-2.5 text-xs sm:text-sm hover:bg-slate-700 cursor-pointer transition-colors">
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