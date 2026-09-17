import React from 'react';
import { Cpu, Database, ShieldCheck, Code, BookOpen } from 'lucide-react';

export default function CourseCatalogPreview() {
  const courses = [
    {
      code: 'B1390',
      title: 'Bachelor of IT (Software Systems & Enterprise Tech)',
      category: 'Software Engineering',
      duration: '3 Years (72 CP)',
      badgeBg: 'bg-emerald-50 text-[#008652] border-emerald-200',
      iconBg: 'bg-[#008652]',
      icon: Cpu,
      units: ['ICT159 Programming', 'ICT167 Computer Science', 'ICT285 Databases', 'ICT302 Capstone']
    },
    {
      code: 'B1420',
      title: 'Bachelor of Data Analytics & Business Intelligence',
      category: 'Data Science',
      duration: '3 Years (72 CP)',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-700',
      icon: Database,
      units: ['MAS183 Statistical Data', 'ICT220 Big Data', 'ICT285 Databases', 'ICT305 Data Viz']
    },
    {
      code: 'B1390-SEC',
      title: 'Bachelor of IT (Cyber Security & Forensics)',
      category: 'Cybersecurity',
      duration: '3 Years (72 CP)',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-700',
      icon: ShieldCheck,
      units: ['ICT111 Cyber Fundamentals', 'ICT280 Info Security Policy', 'ICT378 Cyber Forensics', 'ICT387 Ethical Hacking']
    },
    {
      code: 'M1220',
      title: 'Master of Information Technology (Advanced Data Analytics)',
      category: 'Postgraduate Degree',
      duration: '2 Years (48 CP)',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-700',
      icon: Code,
      units: ['ICT521 IT Practice', 'ICT606 Data Mining', 'ICT610 Cloud Architecture', 'ICT620 Capstone Project']
    }
  ];

  return (
    <section className="py-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold text-[#008652] dark:text-emerald-400 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#008652] dark:text-emerald-400" /> Academic Degree Pathways
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Course Catalog & Degree Pathways
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            Official degree structures and required course units offered at PT3 Solutions campuses.
          </p>
        </div>
      </div>

      {/* Clean Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course) => {
          const IconComponent = course.icon;
          return (
            <div
              key={course.code}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl ${course.iconBg} text-white flex items-center justify-center shadow-sm`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border font-mono ${course.badgeBg}`}>
                    {course.code}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  {course.category}
                </span>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#008652] dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {course.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Duration: {course.duration}
                </p>

                {/* Key Units Tags */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Key Units Included:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.units.map((u, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
