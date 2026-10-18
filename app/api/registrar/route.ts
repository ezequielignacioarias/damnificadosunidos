import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Usar el algoritmo de ventana deslizante compatible con REST API estándar
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

const supabaseUrl = 'https://anequmcpprmvrdattagm.supabase.co';
const supabaseAnonKey = 'sb_publishable_cFIwIj4aD2AH21485elTrA_8DjUX-R1';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes registradas desde esta red. Por favor, intente nuevamente más tarde.',
          limit,
          remaining,
          reset 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Datos de registro inválidos.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('registros')
      .insert(rows);

    if (error) {
      if (error.code === '23505' || error.message.includes('idx_unico_unidad_limpia')) {
        return NextResponse.json(
          { error: 'Una o más de las unidades que intentas registrar ya se encuentran en la base de datos.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Hubo un error al registrar los casos: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Registro guardado con éxito.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno en el servidor: ' + error.message },
      { status: 500 }
    );
  }
}