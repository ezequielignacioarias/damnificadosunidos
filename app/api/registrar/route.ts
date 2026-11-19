import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
}

if (!redisUrl || !redisToken) {
  throw new Error('Faltan UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN.');
}

const redis = new Redis({ url: redisUrl, token: redisToken });

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TIPOS_BIEN = ['Lote urbano', 'Lote comercial', 'Lote mixto', 'Local o negocio'] as const;

const TIPOS_CONTRATO = [
  'Boleto de compraventa',
  'Contrato de adhesión / Fideicomiso',
  'Reserva / Seña',
  'Cesión de derechos',
  'Escritura traslativa de dominio',
  'Otro documento / Sin documentación',
] as const;

const PROBLEMAS = [
  'Demora en la fecha de entrega',
  'Obra frenada o sin avances',
  'Falta de posesión definitiva',
  'Imposibilidad para poder escriturar',
  'Falta de servicios básicos',
  'Incumplimiento contractual grave',
  'Otra situación / Caso especial',
] as const;

const ANIOS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016 o anterior'] as const;
const FORMAS_PAGO = ['Pago total - USD', 'Pago total - Pesos', 'Financiado - USD', 'Financiado - Pesos', 'Otro / Mixto'] as const;
const ESTADOS_PAGO = ['En curso', 'Finalizado'] as const;
const ENTIDADES = ['Grupo Roma', 'JR', 'Ahora', 'V+V', 'Vendedor Particular', 'Intermediario', 'Otro'] as const;

const textoObligatorio = (max: number) => z.string().trim().min(1).max(max);
const textoOpcional = (max: number) => z.string().trim().max(max).optional().default('');

const identificadorLote = z
  .string()
  .trim()
  .min(1, 'El identificador es obligatorio.')
  .max(30, 'El identificador no puede superar los 30 caracteres.')
  .regex(/^[\p{L}\p{N}]+(?:[ -]+[\p{L}\p{N}]+)*$/u, 'Usá letras, números, espacios o guiones.');

const identificadorManzana = z.union([identificadorLote, z.literal('')]).optional().default('');

const RowSchema = z
  .object({
    nombre: z.string().trim().min(2).max(100),
    celular: z
      .string()
      .trim()
      .min(1, 'Ingresá tu número de celular.')
      .max(25, 'El número no puede superar los 25 caracteres.')
      .regex(/^\+?[\d\s().-]+$/, 'Ingresá un celular válido.')
      .refine((val) => {
        const digitos = val.replace(/\D/g, '');
        return digitos.length >= 8 && digitos.length <= 15;
      }, 'El número debe contener entre 8 y 15 dígitos.'),
    localidad: textoObligatorio(80),
    desarrollo: textoObligatorio(80),
    lote: identificadorLote,
    manzana: identificadorManzana,
    problema: z.enum(PROBLEMAS),
    tipo_bien: z.union([z.enum(TIPOS_BIEN), z.literal('')]).optional().default(''),
    tipo_contrato: z.union([z.enum(TIPOS_CONTRATO), z.literal('')]).optional().default(''),
    anio_compra: z.union([z.enum(ANIOS), z.literal('')]).optional().default(''),
    forma_pago: z.union([z.enum(FORMAS_PAGO), z.literal('')]).optional().default(''),
    estado_pago: z.union([z.enum(ESTADOS_PAGO), z.literal('')]).optional().default(''),
    entidad_operacion: z.union([z.enum(ENTIDADES), z.literal('')]).optional().default(''),
    intermediario: textoOpcional(100),
  })
  .strict()
  .superRefine((registro, ctx) => {
    if (
      (registro.forma_pago === 'Pago total - USD' || registro.forma_pago === 'Pago total - Pesos') &&
      registro.estado_pago &&
      registro.estado_pago !== 'Finalizado'
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'El pago total debe figurar como finalizado.',
        path: ['estado_pago'],
      });
    }

    if (registro.entidad_operacion === 'Otro' && !registro.intermediario.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Especificá la empresa, entidad o vendedor.',
        path: ['intermediario'],
      });
    }
  });

const BodySchema = z
  .object({
    rows: z.array(RowSchema).min(1).max(5),
    personas_afectadas_familia: z.number().int().min(0).max(5),
  })
  .strict();

const normalizar = (valor: string) => valor.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'desconocida';

    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá nuevamente más tarde.' }, { status: 429 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Datos de registro inválidos.' }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Revisá el formulario: hay campos inválidos o incompletos.' }, { status: 400 });
    }

    const { rows } = parsed.data;
    const lotesVistos = new Set<string>();

    for (const row of rows) {
      const clave = [normalizar(row.localidad), normalizar(row.desarrollo), normalizar(row.lote)].join('\u001f');
      if (lotesVistos.has(clave)) {
        return NextResponse.json({ error: 'Hay números de lote repetidos en el formulario.' }, { status: 409 });
      }
      lotesVistos.add(clave);
    }

    const grupoRegistroId = randomUUID();
    const rowsToInsert = rows.map((row, index) => ({
      ...row,
      celular: row.celular.trim().replace(/\s+/g, ' '),
      lote: row.lote.trim().replace(/\s+/g, ' '),
      manzana: row.manzana.trim().replace(/\s+/g, ' '),
      grupo_registro_id: grupoRegistroId,
      personas_afectadas_familia: index === 0 ? parsed.data.personas_afectadas_familia : null,
    }));

    const { error } = await supabase.from('registros').insert(rowsToInsert);
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Este lote ya está registrado para esa localidad y desarrollo.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'No pudimos guardar el registro. Intentá nuevamente.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Registro guardado con éxito.' });
  } catch (err) {
    console.error('Error interno en /api/registrar:', err);
    return NextResponse.json({ error: 'Error interno en el servidor.' }, { status: 500 });
  }
}