// components/AcapsReport.js
const { useState } = React;

const SECTIONS = [
  { id: 'geo', label: 'Geographic distribution of risks', defaultChecked: true },
  { id: 'largest', label: 'Largest individual risks', defaultChecked: true },
  { id: 'zone3', label: 'Zone III concentration analysis', defaultChecked: true },
  { id: 'hotspots', label: 'Hotspot identification', defaultChecked: true },
  { id: 'actions', label: 'Corrective actions taken', defaultChecked: true },
  { id: 'pml', label: 'PML sensitivity analysis', defaultChecked: true },
];

const PREVIEW_CONTENT = {
  fr: {
    title: "Rapport Réglementaire d'Exposition au Risque Sismique",
    subtitle: "Conformément aux directives de l'ACAPS sur la gestion des risques catastrophiques",
    preparedFor: "Autorité de Contrôle des Assurances et de la Prévoyance Sociale (ACAPS)",
    date: "Période de déclaration :",
    headers: {
      geo: "1. Distribution Géographique des Risques",
      largest: "2. Principaux Risques Individuels",
      zone3: "3. Analyse de Concentration en Zone III",
      hotspots: "4. Identification des Zones de Concentration (Hotspots)",
      actions: "5. Mesures Correctives Adoptées",
      pml: "6. Analyse de Sensibilité PML"
    },
    texts: {
      geo: "L'exposition totale de la compagnie s'élève à 14,5 milliards DZD, répartie sur 58 wilayas. Les zones à haut risque (Zone III et IIb) représentent 40% de l'engagement global.",
      largest: "Le tableau suivant détaille les engagements les plus importants du portefeuille...",
      zone3: "La wilaya d'Alger et de Blida concentrent la majorité de l'exposition en Zone III, représentant un engagement net de 3,2 milliards DZD.",
      hotspots: "Deux wilayas ont dépassé le seuil de rétention d'alerte précoce (75%) : Blida (82%) et Tipaza (78%).",
      actions: "Souscription suspendue temporairement pour les grands risques industriels en Zone III. Réassurance facultative activée pour les renouvellements critiques.",
      pml: "Le PML modélisé pour un séisme de magnitude 6,5 dans le bassin d'Alger est estimé à 3,2 milliards DZD (perte brute) et 1,0 milliard DZD (nette de réassurance)."
    }
  },
  ar: {
    title: "التقرير التنظيمي للتعرض لخطر الزلازل",
    subtitle: "وفقاً لتوجيهات هيئة مراقبة التأمينات والاحتياط الاجتماعي (ACAPS)",
    preparedFor: "هيئة مراقبة التأمينات والاحتياط الاجتماعي (ACAPS)",
    date: "فترة التقرير:",
    headers: {
      geo: "1. التوزيع الجغرافي للمخاطر",
      largest: "2. المخاطر الفردية الكبرى",
      zone3: "3. تحليل التركز في المنطقة الثالثة",
      hotspots: "4. تحديد بؤر التركز (Hotspots)",
      actions: "5. الإجراءات التصحيحية المتخذة",
      pml: "6. تحليل حساسية الحد الأقصى للخسارة المحتملة (PML)"
    },
    texts: {
      geo: "يبلغ إجمالي تعرض الشركة 14.5 مليار دينار جزائري، موزعة على 58 ولاية. تمثل المناطق عالية المخاطر (المنطقة III و IIb) 40٪ من إجمالي الالتزامات.",
      largest: "يوضح الجدول التالي أهم الالتزامات في المحفظة...",
      zone3: "تتركز معظم التعرضات في المنطقة الثالثة في ولايتي الجزائر والبليدة، وتستحوذ على التزام صافٍ قدره 3.2 مليار دينار جزائري.",
      hotspots: "تجاوزت ولايتان حد الإنذار المبكر للاحتفاظ (75٪): البليدة (82٪) وتيبازة (78٪).",
      actions: "تم تعليق الاكتتاب مؤقتاً للمخاطر الصناعية الكبرى في المنطقة الثالثة. تفعيل إعادة التأمين الاختياري للتجديدات الحرجة.",
      pml: "يقدر الحد الأقصى للخسارة المحتملة (PML) لزلزال بقوة 6.5 في حوض الجزائر العاصمة بـ 3.2 مليار دينار جزائري (إجمالي الخسارة) و 1.0 مليار دينار جزائري (صافي بعد إعادة التأمين)."
    }
  }
};

const AcapsReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];

  const [status, setStatus] = useState('idle');
  const [periodFrom, setPeriodFrom] = useState(lastMonthStr);
  const [periodTo, setPeriodTo] = useState(today);
  const [language, setLanguage] = useState('fr');
  const [reportType, setReportType] = useState('standard');
  const [sections, setSections] = useState(
    SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: sec.defaultChecked }), {})
  );
  const [signatory, setSignatory] = useState('');

  const handleToggleSection = (id) => {
    setSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    setSections(SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: true }), {}));
    setStatus('idle');
  };

  const handleGenerate = () => {
    setStatus('generating');
    setTimeout(() => {
      setStatus('ready');
    }, 2000);
  };

  const langData = PREVIEW_CONTENT[language];
  const isRtl = language === 'ar';

  return (
    <div className="h-[calc(100vh-56px)] flex bg-slate overflow-hidden" style={{ minWidth: '900px' }}>

      {/* Left Panel: Configuration - FIXE AVEC LARGEUR MINIMALE */}
      <div className="bg-carbon border-r border-ash flex flex-col shrink-0 overflow-y-auto" style={{ width: '420px', minWidth: '420px', maxWidth: '420px' }}>

        <div className="p-5 border-b border-ash bg-graphite/50 shrink-0 sticky top-0 bg-carbon z-10">
          <h1 className="text-lg font-mono font-medium text-pure m-0 flex items-center gap-2">
            <i className="lucide-file-check-2 text-teal text-lg"></i>
            ACAPS Report Generator
          </h1>
          <p className="font-sans text-[11px] text-fog mt-1.5">Configure and generate the automated regulatory compliance submission.</p>
        </div>

        <div className="flex-1 p-5 space-y-6">

          {/* Period */}
          <div>
            <label className="text-[9px] text-fog font-semibold uppercase tracking-wider block mb-1">Reporting Period</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[9px] text-fog font-mono uppercase mb-0.5 block">From</span>
                <input type="date" className="input-field h-8 text-xs" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
              </div>
              <div className="flex-1">
                <span className="text-[9px] text-fog font-mono uppercase mb-0.5 block">To</span>
                <input type="date" className="input-field h-8 text-xs" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Language & Type */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-fog font-semibold uppercase tracking-wider block mb-1">Report Language</label>
              <div className="flex bg-graphite border border-ash rounded-md p-0.5">
                <button
                  className={`flex-1 py-1 text-[11px] font-sans font-semibold rounded transition-colors ${language === 'fr' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                  onClick={() => { setLanguage('fr'); setStatus('idle'); }}
                >
                  Français
                </button>
                <button
                  className={`flex-1 py-1 text-[11px] font-sans font-semibold rounded transition-colors ${language === 'ar' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                  onClick={() => { setLanguage('ar'); setStatus('idle'); }}
                >
                  العربية
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-fog font-semibold uppercase tracking-wider block mb-1">Report Type</label>
              <div className="relative">
                <select
                  className="input-field h-8 text-xs appearance-none cursor-pointer"
                  value={reportType}
                  onChange={e => { setReportType(e.target.value); setStatus('idle'); }}
                >
                  <option value="standard">Standard Submission</option>
                  <option value="detailed">Detailed Analysis (Audit)</option>
                  <option value="summary">Executive Summary</option>
                </select>
                <i className="lucide-chevron-down absolute right-2.5 top-2 text-fog pointer-events-none text-xs"></i>
              </div>
            </div>
          </div>

          {/* Sections Checklist */}
          <div>
            <label className="text-[9px] text-fog font-semibold uppercase tracking-wider flex items-center justify-between mb-1.5">
              <span>Include Sections</span>
              <button className="text-[9px] text-teal hover:underline normal-case" onClick={handleSelectAll}>Select All</button>
            </label>
            <div className="bg-graphite border border-ash rounded-md p-3 space-y-2">
              {SECTIONS.map(sec => (
                <label key={sec.id} className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={sections[sec.id]}
                      onChange={() => { handleToggleSection(sec.id); setStatus('idle'); }}
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${sections[sec.id] ? 'bg-blue border-blue text-pure' : 'bg-carbon border-ash text-transparent group-hover:border-fog'}`}>
                      <i className="lucide-check text-[9px]"></i>
                    </div>
                  </div>
                  <span className={`font-sans text-[11px] transition-colors ${sections[sec.id] ? 'text-cloud' : 'text-fog'}`}>{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Signatory & Stamp */}
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-fog font-semibold uppercase tracking-wider block mb-1">Signatory Name</label>
              <input
                type="text"
                className="input-field h-8 text-xs"
                placeholder="e.g. Chief Risk Officer"
                value={signatory}
                onChange={e => { setSignatory(e.target.value); setStatus('idle'); }}
              />
            </div>
            <div>
              <label className="text-[9px] text-fog font-semibold uppercase tracking-wider block mb-1">Company Stamp (Optional)</label>
              <button className="w-full h-8 border border-dashed border-ash hover:border-fog rounded-md bg-graphite flex items-center justify-center gap-1.5 text-fog hover:text-cloud transition-colors text-[10px] font-sans">
                <i className="lucide-upload text-xs"></i>
                Upload Stamp Image
              </button>
            </div>
          </div>

        </div>

        {/* Footer Action - Sticky en bas */}
        <div className="p-5 border-t border-ash bg-carbon shrink-0 sticky bottom-0 bg-carbon z-10">
          <button
            className="w-full bg-blue hover:bg-opacity-90 text-pure font-sans text-[13px] font-semibold rounded-md h-10 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
            onClick={handleGenerate}
            disabled={status === 'generating'}
          >
            {status === 'generating' ? (
              <><i className="lucide-loader-2 animate-spin mr-1.5 text-xs"></i> Generating...</>
            ) : (
              <>Generate Report <i className="lucide-arrow-right ml-1.5 text-xs"></i></>
            )}
          </button>
          <div className="text-center mt-2 font-sans text-[9px] text-fog flex items-center justify-center gap-1">
            <i className="lucide-history text-[10px]"></i>
            Last generated: 15/01/2025 09:42 — <a href="#" className="text-teal hover:underline">Download</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Live Preview - SCROLLABLE */}
      <div className="flex-1 bg-slate overflow-y-auto flex flex-col items-center p-6 relative">

        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <i className="lucide-file-search text-4xl text-fog opacity-20 mb-2"></i>
            <p className="font-mono text-fog opacity-50 text-xs">Configure parameters and click Generate</p>
          </div>
        )}

        {status === 'generating' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate/80 backdrop-blur-sm z-20">
            <div className="w-9 h-9 border-3 border-ash border-t-blue rounded-full animate-spin mb-2"></div>
            <h3 className="font-mono text-sm text-pure">Compiling ACAPS Report...</h3>
            <p className="font-sans text-[10px] text-fog mt-1">Aggregating portfolio data and formatting tables</p>
          </div>
        )}

        <div className={`w-full max-w-[800px] transition-all duration-500 ${status === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-6 pointer-events-none blur-[1px]'}`}>

          {status === 'ready' && (
            <div className="w-full bg-blue/10 border border-blue/30 rounded-md p-2.5 mb-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue/20 flex items-center justify-center text-blue">
                  <i className="lucide-check text-xs"></i>
                </div>
                <div>
                  <div className="font-sans font-bold text-pure text-[11px]">Report Ready!</div>
                  <div className="font-sans text-[9px] text-cloud">The document has been successfully generated and formatted.</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-outline bg-carbon border-ash text-[10px] h-6 px-2.5 flex items-center gap-1">
                  <i className="lucide-printer text-[10px]"></i> Print
                </button>
                <button className="btn-primary bg-blue text-[10px] h-6 px-2.5 flex items-center gap-1">
                  <i className="lucide-download text-[10px]"></i> Download PDF
                </button>
              </div>
            </div>
          )}

          {/* The "Paper" Document Preview */}
          <div className={`bg-pure text-[#1a1a1a] shadow-paper rounded-sm p-6 min-h-[950px] font-sans text-xs ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Letterhead */}
            <div className="border-b-2 border-slate-300 pb-4 mb-5 flex justify-between items-end">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#0D1117]">COMPANY NAME LOGO</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Département de Gestion des Risques</p>
              </div>
              <div className={`text-[10px] text-gray-500 ${isRtl ? 'text-left' : 'text-right'}`}>
                <p>Réf: ACAPS-2026-{new Date().getMonth() + 1}</p>
                <p>Date: {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-SA')}</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#0D1117] mb-1.5">{langData.title}</h1>
              <h2 className="text-sm text-gray-600 font-medium">{langData.subtitle}</h2>
              <div className="mt-2 inline-block px-2.5 py-0.5 border border-gray-300 bg-gray-50 rounded text-[10px] font-semibold">
                {langData.preparedFor}
              </div>
              <p className="mt-2 text-[10px] text-gray-600 font-mono">
                {langData.date} {periodFrom} — {periodTo}
              </p>
            </div>

            {/* Report Content */}
            <div className="space-y-5 leading-relaxed text-gray-800">
              {SECTIONS.filter(s => sections[s.id]).map(sec => (
                <div key={sec.id}>
                  <h3 className="text-sm font-bold text-[#0D1117] mb-1.5 border-b border-gray-200 pb-0.5">{langData.headers[sec.id]}</h3>
                  <p className="mb-2 text-xs">{langData.texts[sec.id]}</p>

                  {sec.id === 'largest' && (
                    <table className="w-full border-collapse mb-2 text-[10px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className={`border border-gray-300 p-1 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'العميل' : 'Client'}</th>
                          <th className={`border border-gray-300 p-1 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المنطقة' : 'Zone'}</th>
                          <th className="border border-gray-300 p-1 text-center">{isRtl ? 'رأس المال (د.ج)' : 'Capital (DZD)'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-1">Sonatrach Complex A</td>
                          <td className="border border-gray-300 p-1">Zone IIb</td>
                          <td className="border border-gray-300 p-1 text-center font-mono">850,000,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1">Port of Algiers</td>
                          <td className="border border-gray-300 p-1">Zone III</td>
                          <td className="border border-gray-300 p-1 text-center font-mono">420,000,000</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {sec.id === 'pml' && (
                    <div className="bg-gray-50 p-2 border border-gray-200 text-center font-mono font-bold text-sm text-red-700 my-2">
                      {isRtl ? 'إجمالي الخسارة المحتملة: 3.2 مليار د.ج' : 'PML Gross: 3.2 Billion DZD'}
                    </div>
                  )}
                </div>
              ))}

              {Object.values(sections).every(v => !v) && (
                <div className="text-center py-6 text-gray-400 italic text-xs">
                  {isRtl ? 'لم يتم تحديد أي أقسام للتقرير.' : 'Aucune section sélectionnée pour le rapport.'}
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-bold text-gray-800 text-xs">{isRtl ? 'الختم والتوقيع' : 'Cachet et Signature'}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">{signatory || (isRtl ? '[اسم الموقع]' : '[Nom du Signataire]')}</p>
                </div>
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-[9px] text-center">
                  {isRtl ? 'مكان الختم' : 'Emplacement Cachet'}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 text-center">
            <div className="text-[9px] text-fog max-w-2xl mx-auto flex items-center justify-center gap-1">
              <i className="lucide-shield-alert text-amber text-[10px]"></i>
              This report is auto-generated from live portfolio data and formatted to meet ACAPS submission standards.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};