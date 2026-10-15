import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MapPin, Phone } from 'lucide-react';
import { EventConfig } from '../config/eventConfig';

interface FAQSectionProps {
  config: EventConfig;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ config }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-900">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono-tech mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>MISSION INTEL & GUIDELINES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
          Clear answers for recruits, squads, and faculty regarding campus logistics and event rules.
        </p>
      </div>

      <div className="space-y-4 mb-16">
        {config.faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-850 bg-slate-950/70 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {faq.category}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-slate-100">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-900/80">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Campus Logistics & Contact Card */}
      <div className="bg-[#0a0f24] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono-tech uppercase text-cyan-400 block mb-1">
            CAMPUS DISPATCH DIRECTORY
          </span>
          <h3 className="text-lg font-display font-bold text-white mb-2">
            Need Additional Telemetry or Special Assistance?
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Our campus assembly dispatch coordinators and faculty mentors are available 24/7 to resolve
            inquiries, facilitate team matches, and arrange accessibility accommodations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href={`https://wa.me/${config.contactPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/40 text-slate-200 text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Alerts: {config.contactPhone}</span>
          </a>
          <a
            href={`mailto:${config.contactEmail}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>{config.contactEmail}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
