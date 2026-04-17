// components/Login.js - Version avec carte simple
const Login = () => {
  return (
    <div className="min-h-screen flex bg-slate selection:bg-teal/30 selection:text-teal relative" data-name="login-page" data-file="components/Login.js">
      <div className="fixed inset-0 noise-bg z-50 pointer-events-none"></div>

      {/* Left Panel - Branding & Carte Simple */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-carbon to-[#0A0D12] border-r border-ash/50 overflow-hidden flex-col justify-between p-8">

        {/* Branding Top */}
        <div className="relative z-20">
          <div className="font-mono text-2xl font-bold tracking-tighter text-pure flex items-center gap-2 mb-2">
            <i className="lucide-shield text-teal text-2xl"></i>
            <span>GAM ASSURANCE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] text-fog uppercase tracking-widest">Powered by</span>
            <div className="font-mono text-xs font-bold text-cloud flex items-center gap-1">
              <i className="lucide-activity text-teal text-xs"></i>
              TREMOR
            </div>
          </div>
        </div>

        {/* Carte Simple de l'Algérie */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-8">
          <div className="relative w-[280px] h-[280px]">
            {/* Cercle extérieur */}
            <div className="absolute inset-0 rounded-full bg-teal/5 border border-teal/20 animate-pulse"></div>

            {/* Carte SVG stylisée */}
            <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-glow">
              {/* Fond de la carte */}
              <path d="M150,30 L220,60 L250,120 L240,180 L200,240 L150,270 L100,240 L60,180 L50,120 L80,60 Z"
                fill="none" stroke="#39D0D8" strokeWidth="1.5" strokeOpacity="0.3" />

              {/* Contour de l'Algérie stylisé */}
              <path d="M150,40 L210,65 L240,115 L230,170 L195,225 L150,250 L105,225 L70,170 L60,115 L90,65 Z"
                fill="url(#gradAlgeria)" stroke="#39D0D8" strokeWidth="2" strokeOpacity="0.8" />

              {/* Points des villes principales */}
              <circle cx="140" cy="120" r="4" fill="#DA3633" className="animate-ping-slow" />
              <circle cx="140" cy="120" r="3" fill="#DA3633" />
              <text x="145" y="115" className="text-[6px] fill-teal font-mono">Alger</text>

              <circle cx="90" cy="110" r="3" fill="#D29922" />
              <text x="65" y="108" className="text-[5px] fill-fog font-mono">Oran</text>

              <circle cx="185" cy="115" r="3" fill="#D29922" />
              <text x="190" y="113" className="text-[5px] fill-fog font-mono">Constantine</text>

              <circle cx="205" cy="135" r="2.5" fill="#D29922" />
              <text x="210" y="133" className="text-[5px] fill-fog font-mono">Annaba</text>

              <circle cx="150" cy="180" r="3" fill="#2EA043" />
              <text x="130" y="195" className="text-[5px] fill-fog font-mono">Ouargla</text>

              <circle cx="100" cy="220" r="2" fill="#2EA043" />
              <text x="70" y="230" className="text-[5px] fill-fog font-mono">Tamanrasset</text>

              {/* Gradient */}
              <defs>
                <linearGradient id="gradAlgeria" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#39D0D8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1F6FEB" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>

            {/* Points d'activité sismique animés */}
            <div className="absolute top-[40%] left-[48%]">
              <div className="w-2 h-2 bg-red rounded-full shadow-[0_0_10px_rgba(218,54,51,0.8)]">
                <div className="animate-ping absolute inset-0 rounded-full bg-red opacity-60"></div>
              </div>
            </div>
            <div className="absolute top-[38%] left-[32%]">
              <div className="w-1.5 h-1.5 bg-amber rounded-full shadow-[0_0_8px_rgba(210,153,34,0.6)]">
                <div className="animate-ping absolute inset-0 rounded-full bg-amber opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Bottom Decor */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-carbon/80 backdrop-blur border border-ash rounded-lg font-sans text-[10px] text-cloud font-medium tracking-wider mb-2">
            <div className="w-1.5 h-1.5 bg-green rounded-full"></div>
            Réseau Sécurisé GAM
          </div>
          <p className="font-sans text-[11px] text-fog max-w-sm">
            Système d'Intelligence Sismique interne.<br/>Connexion chiffrée de bout en bout.
          </p>
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/30 via-transparent to-carbon/50 z-0 pointer-events-none"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative z-20 px-6 py-8 bg-slate overflow-y-auto">
        <div className="w-full max-w-[380px]">

          <div className="mb-8 text-center lg:text-left">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center items-center gap-2 mb-5 font-mono text-xl font-bold text-pure">
              <i className="lucide-shield text-teal text-xl"></i>
              GAM ASSURANCE
            </div>
            <h1 className="text-2xl font-mono text-pure mb-1">Connexion — GAM Assurance</h1>
            <p className="font-sans text-sm text-fog">Veuillez vous identifier pour accéder à votre espace.</p>
          </div>

          {/* SSO Button */}
          <button className="w-full h-11 flex items-center justify-center gap-2 border border-ash rounded-xl text-cloud hover:text-pure hover:bg-graphite transition-all mb-5 text-sm font-medium">
            <i className="lucide-building-2 text-fog text-sm"></i>
            <span>Connexion via réseau GAM</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-ash flex-1"></div>
            <div className="font-sans text-[10px] text-fog uppercase tracking-wider">Ou identifiants directs</div>
            <div className="h-px bg-ash flex-1"></div>
          </div>

          {/* Standard Form */}
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = 'index.html'; }}>
            <div>
              <label className="font-sans text-xs font-medium text-cloud mb-1 block">Email Professionnel</label>
              <input type="email" className="w-full bg-graphite border border-ash rounded-xl px-4 py-3 text-sm text-cloud focus:border-teal focus:outline-none transition-all" placeholder="prenom.nom@gam-assurance.dz" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-sans text-xs font-medium text-cloud block">Mot de passe</label>
                <a href="#" className="font-sans text-[11px] text-teal hover:text-teal/80 transition-colors">Mot de passe oublié ?</a>
              </div>
              <input type="password" className="w-full bg-graphite border border-ash rounded-xl px-4 py-3 text-sm text-cloud focus:border-teal focus:outline-none transition-all" placeholder="••••••••" required />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-teal to-blue-600 hover:from-teal/90 hover:to-blue-700 text-pure font-sans font-semibold rounded-xl py-3 mt-3 transition-all duration-300 shadow-lg">
              Se connecter
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="font-sans text-xs text-fog">
              Vous n'avez pas de compte ? <a href="signup.html" className="text-teal hover:underline">Contactez votre administrateur système.</a>
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-ash text-center lg:text-left">
            <p className="font-sans text-[11px] text-fog leading-relaxed">
              Accès réservé aux employés de GAM Assurance.<br/>
              Pour tout problème de connexion, contactez la DSI.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(57, 208, 216, 0.3));
        }
      `}</style>
    </div>
  );
};