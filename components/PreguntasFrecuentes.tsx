
'use client';

import { useState } from 'react';

const FAQ_DATA = [
  {
    q: '¿Tiene algún costo sumarse al registro?',
    a: 'No, el registro es gratuito y confidencial. El objetivo es dimensionar el volumen real de afectados.',
  },
  {
    q: '¿Qué pasa con mis datos personales?',
    a: 'Los datos registrados se resguardan de forma confidencial en la base de datos bajo el amparo de la Ley 25.326 de Protección de Datos Personales. Se utilizan para fines estadísticos y de coordinación de la comunidad. Los datos de contacto no se publican.',
  },
  {
    q: '¿Quiénes están organizando esta iniciativa?',
    a: 'Es un espacio autogestionado por vecinos de los diferentes desarrollos vinculados al Grupo Roma.',
  },
];

export default function PreguntasFrecuentes() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-8 shadow-xl">
      <h2 className="text-base sm:text-lg font-bold text-sky-400 mb-4">
        ❓ Preguntas frecuentes
      </h2>

      <div className="space-y-3">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = faqOpen === idx;
          const answerId = `faq-answer-${idx}`;

          return (
            <div
              key={item.q}
              className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60"
            >
              <button
                type="button"
                onClick={() =>
                  setFaqOpen(isOpen ? null : idx)
                }
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="w-full text-left p-4 text-xs sm:text-sm font-semibold text-white flex justify-between items-center hover:bg-slate-900/80 cursor-pointer gap-3"
              >
                <span>{item.q}</span>

                <span
                  className="text-sky-400 text-base font-bold shrink-0"
                  aria-hidden="true"
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  className="p-4 pt-0 text-xs text-slate-400 border-t border-slate-900/80 leading-relaxed bg-slate-950/90"
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
