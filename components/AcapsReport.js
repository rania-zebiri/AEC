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

    const [status, setStatus] = React.useState('idle'); // idle, generating, ready
    const [periodFrom, setPeriodFrom] = React.useState(lastMonthStr);
    const [periodTo, setPeriodTo] = React.useState(today);
    const [language, setLanguage] = React.useState('fr');
    const [reportType, setReportType] = React.useState('standard');
    const [sections, setSections] = React.useState(
        SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: sec.defaultChecked }), {})
    );
    const [signatory, setSignatory] = React.useState('');

    const handleToggleSection = (id) => {
        setSections(prev => ({ ...prev, [id]: !prev[id] }));
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
        <div className="relative h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate overflow-hidden" data-name="acaps-page" data-file="components/AcapsReport.js">
            
            {/* Left Panel: Configuration */}
            <div className="w-[420px] bg-carbon border-r border-ash flex flex-col shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                <div className="p-6 border-b border-ash bg-graphite/50 shrink-0">
                    <h1 className="text-[20px] font-mono font-medium text-pure m-0 flex items-center gap-3">
                        <div className="icon-file-check-2 text-teal"></div>
                        ACAPS Report Generator
                    </h1>
                    <p className="font-sans text-[13px] text-fog mt-2">Configure and generate the automated regulatory compliance submission.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    
                    {/* Period */}
                    <div>
                        <label className="label-text">Reporting Period</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <span className="text-[11px] text-fog font-mono uppercase mb-1 block">From</span>
                                <input type="date" className="input-field" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <span className="text-[11px] text-fog font-mono uppercase mb-1 block">To</span>
                                <input type="date" className="input-field" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Language & Type */}
                    <div className="space-y-6">
                        <div>
                            <label className="label-text mb-2">Report Language</label>
                            <div className="flex bg-graphite border border-ash rounded-[6px] p-1">
                                <button 
                                    className={`flex-1 py-1.5 text-sm font-sans font-semibold rounded-[4px] transition-colors ${language === 'fr' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                                    onClick={() => { setLanguage('fr'); setStatus('idle'); }}
                                >
                                    Français
                                </button>
                                <button 
                                    className={`flex-1 py-1.5 text-sm font-sans font-semibold rounded-[4px] transition-colors ${language === 'ar' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                                    onClick={() => { setLanguage('ar'); setStatus('idle'); }}
                                >
                                    العربية
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label-text mb-2">Report Type</label>
                            <div className="relative">
                                <select 
                                    className="input-field appearance-none cursor-pointer"
                                    value={reportType}
                                    onChange={e => { setReportType(e.target.value); setStatus('idle'); }}
                                >
                                    <option value="standard">Standard Submission</option>
                                    <option value="detailed">Detailed Analysis (Audit)</option>
                                    <option value="summary">Executive Summary</option>
                                </select>
                                <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Sections Checklist */}
                    <div>
                        <label className="label-text flex items-center justify-between mb-3">
                            <span>Include Sections</span>
                            <button className="text-[11px] text-teal hover:underline normal-case" onClick={() => setSections(SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: true }), {}))}>Select All</button>
                        </label>
                        <div className="bg-graphite border border-ash rounded-[8px] p-4 space-y-3">
                            {SECTIONS.map(sec => (
                                <label key={sec.id} className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input 
                                            type="checkbox" 
                                            className="peer sr-only"
                                            checked={sections[sec.id]}
                                            onChange={() => { handleToggleSection(sec.id); setStatus('idle'); }}
                                        />
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${sections[sec.id] ? 'bg-blue border-blue text-pure' : 'bg-carbon border-ash text-transparent group-hover:border-fog'}`}>
                                            <div className="icon-check text-[12px]"></div>
                                        </div>
                                    </div>
                                    <span className={`font-sans text-sm transition-colors ${sections[sec.id] ? 'text-cloud' : 'text-fog'}`}>{sec.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Signatory & Stamp */}
                    <div className="space-y-4">
                        <div>
                            <label className="label-text">Signatory Name</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. Chief Risk Officer" 
                                value={signatory}
                                onChange={e => { setSignatory(e.target.value); setStatus('idle'); }}
                            />
                        </div>
                        <div>
                            <label className="label-text">Company Stamp (Optional)</label>
                            <button className="w-full h-[40px] border border-dashed border-ash hover:border-fog rounded-[6px] bg-graphite flex items-center justify-center gap-2 text-fog hover:text-cloud transition-colors text-sm font-sans">
                                <div className="icon-upload text-sm"></div>
                                Upload Stamp Image
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-ash bg-carbon shrink-0">
                    <button 
                        className="w-full bg-blue hover:bg-opacity-90 text-pure font-sans text-[16px] font-semibold rounded-[6px] h-[48px] flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleGenerate}
                        disabled={status === 'generating'}
                    >
                        {status === 'generating' ? (
                            <><div className="icon-loader animate-spin mr-2"></div> Generating...</>
                        ) : (
                            <>Generate Report <div className="icon-arrow-right ml-2"></div></>
                        )}
                    </button>
                    <div className="text-center mt-4 font-sans text-[12px] text-fog flex items-center justify-center gap-1.5">
                        <div className="icon-history text-xs"></div>
                        Last generated: 15/01/2025 09:42 — <a href="#" className="text-teal hover:underline">Download</a>
                    </div>
                </div>
            </div>

            {/* Right Panel: Live Preview */}
            <div className="flex-1 bg-slate overflow-y-auto flex flex-col items-center p-8 relative">
                
                {status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                        <div className="icon-file-search text-6xl text-fog opacity-20 mb-4"></div>
                        <p className="font-mono text-fog opacity-50">Configure parameters and click Generate</p>
                    </div>
                )}

                {status === 'generating' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate/80 backdrop-blur-sm z-20">
                        <div className="w-12 h-12 border-4 border-ash border-t-blue rounded-full animate-spin mb-4"></div>
                        <h3 className="font-mono text-[18px] text-pure animate-pulse">Compiling ACAPS Report...</h3>
                        <p className="font-sans text-sm text-fog mt-2">Aggregating portfolio data and formatting tables</p>
                    </div>
                )}

                <div className={`w-full max-w-[850px] transition-all duration-500 ${status === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8 pointer-events-none blur-[2px]'}`}>
                    
                    {status === 'ready' && (
                        <div className="w-full bg-blue/10 border border-blue/30 rounded-[8px] p-4 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-blue">
                                    <div className="icon-check"></div>
                                </div>
                                <div>
                                    <div className="font-sans font-bold text-pure text-sm">Report Ready!</div>
                                    <div className="font-sans text-[12px] text-cloud">The document has been successfully generated and formatted.</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn-outline bg-carbon border-ash text-sm h-[32px]">
                                    <div className="icon-printer mr-2 text-[14px]"></div> Print
                                </button>
                                <button className="btn-primary bg-blue text-sm h-[32px]">
                                    <div className="icon-download mr-2 text-[14px]"></div> Download PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {/* The "Paper" Document Preview */}
                    <div className={`bg-pure text-[#1a1a1a] shadow-paper rounded-sm p-12 min-h-[1100px] font-sans ${isRtl ? 'font-arabic text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        
                        {/* Letterhead */}
                        <div className="border-b-2 border-slate-300 pb-6 mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[#0D1117]">COMPANY NAME LOGO</h2>
                                <p className="text-sm text-gray-500 mt-1">Département de Gestion des Risques</p>
                            </div>
                            <div className={`text-sm text-gray-500 ${isRtl ? 'text-left' : 'text-right'}`}>
                                <p>Réf: ACAPS-2026-{new Date().getMonth() + 1}</p>
                                <p>Date: {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-SA')}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-[#0D1117] mb-2">{langData.title}</h1>
                            <h2 className="text-lg text-gray-600 font-medium">{langData.subtitle}</h2>
                            <div className="mt-4 inline-block px-4 py-1 border border-gray-300 bg-gray-50 rounded text-sm font-semibold">
                                {langData.preparedFor}
                            </div>
                            <p className="mt-4 text-sm text-gray-600 font-mono">
                                {langData.date} {periodFrom} — {periodTo}
                            </p>
                        </div>

                        {/* Report Content */}
                        <div className="space-y-8 text-sm leading-relaxed text-gray-800">
                            {SECTIONS.filter(s => sections[s.id]).map(sec => (
                                <div key={sec.id} className="animate-in fade-in duration-500">
                                    <h3 className="text-lg font-bold text-[#0D1117] mb-3 border-b border-gray-200 pb-1">{langData.headers[sec.id]}</h3>
                                    <p className="mb-4">{langData.texts[sec.id]}</p>
                                    
                                    {/* Mock Tables for specific sections */}
                                    {sec.id === 'largest' && (
                                        <table className="w-full border-collapse mb-4 text-xs">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className={`border border-gray-300 p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'العميل' : 'Client'}</th>
                                                    <th className={`border border-gray-300 p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المنطقة' : 'Zone'}</th>
                                                    <th className="border border-gray-300 p-2 text-center">{isRtl ? 'رأس المال (د.ج)' : 'Capital (DZD)'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-300 p-2">Sonatrach Complex A</td>
                                                    <td className="border border-gray-300 p-2">Zone IIb</td>
                                                    <td className="border border-gray-300 p-2 text-center font-mono">850,000,000</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 p-2">Port of Algiers</td>
                                                    <td className="border border-gray-300 p-2">Zone III</td>
                                                    <td className="border border-gray-300 p-2 text-center font-mono">420,000,000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}

                                    {sec.id === 'pml' && (
                                        <div className="bg-gray-50 p-4 border border-gray-200 text-center font-mono font-bold text-lg text-red-700 my-4">
                                            {isRtl ? 'إجمالي الخسارة المحتملة: 3.2 مليار د.ج' : 'PML Gross: 3.2 Billion DZD'}
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {Object.values(sections).every(v => !v) && (
                                <div className="text-center py-10 text-gray-400 italic">
                                    {isRtl ? 'لم يتم تحديد أي أقسام للتقرير.' : 'Aucune section sélectionnée pour le rapport.'}
                                </div>
                            )}
                        </div>

                        {/* Signatures */}
                        <div className="mt-20 pt-8 border-t border-gray-200">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="font-bold text-gray-800">{isRtl ? 'الختم والتوقيع' : 'Cachet et Signature'}</p>
                                    <p className="text-gray-600 mt-1">{signatory || (isRtl ? '[اسم الموقع]' : '[Nom du Signataire]')}</p>
                                </div>
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs text-center">
                                    {isRtl ? 'مكان الختم' : 'Emplacement Cachet'}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 text-center">
                        <div className="text-xs text-fog max-w-2xl mx-auto flex items-center justify-center gap-2">
                            <div className="icon-shield-alert text-amber"></div>
                            This report is auto-generated from live portfolio data and formatted to meet ACAPS submission standards. Always verify with your compliance officer before submission.
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};