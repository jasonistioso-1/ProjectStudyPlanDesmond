import React from 'react';
import { Star, MessageSquareQuote, GraduationCap } from 'lucide-react';

export default function StudentTestimonials() {
  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Bachelor of IT (Software Major)',
      campus: 'PT3 Solutions Perth Campus',
      rating: 5,
      avatarBg: 'bg-emerald-700',
      initials: 'AJ',
      quote: 'The Study Plan Repository saved me 2 semesters! When I had to adjust my schedule due to unit prerequisites, the drag-and-drop builder automatically checked availability and auto-balanced my workload.'
    },
    {
      name: 'Sarah Lin',
      role: 'Bachelor of Data Analytics',
      campus: 'PT3 Solutions Singapore Campus',
      rating: 5,
      avatarBg: 'bg-teal-700',
      initials: 'SL',
      quote: 'Signing my digital student agreement online was super fast. My Academic Chair recommended the revised study plan, and my official Certificate of Entitlement was issued instantly.'
    },
    {
      name: 'Marcus Vance',
      role: 'Master of IT (Postgraduate)',
      campus: 'PT3 Solutions Online Portal',
      rating: 5,
      avatarBg: 'bg-indigo-700',
      initials: 'MV',
      quote: 'The real-time validation engine gave me clear warnings whenever I tried placing a unit in an unoffered trimester. It prevented enrolment errors before semester start.'
    }
  ];

  return (
    <section className="py-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-[#008652] mb-1">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#008652]" /> Student & Chair Feedback
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student & Faculty Experiences
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Read how PT3 Solutions students and Academic Chairs streamline study planning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium italic mb-6">
                "{item.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className={`w-9 h-9 rounded-full ${item.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                {item.initials}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
                <p className="text-[10px] font-semibold text-slate-500">{item.role}</p>
                <span className="text-[10px] text-[#008652] font-mono font-bold flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3 h-3" /> {item.campus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
