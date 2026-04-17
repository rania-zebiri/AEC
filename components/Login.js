const Login = () => {
    return (
        <div className="min-h-screen flex bg-slate selection:bg-teal/30 selection:text-teal relative" data-name="login-page" data-file="components/Login.js">
            <div className="fixed inset-0 noise-bg z-50"></div>
            
            {/* Left Panel - Branding & Map */}
            <div className="hidden lg:flex w-1/2 relative bg-[#0A0D12] border-r border-ash/50 overflow-hidden flex-col justify-between p-12">
                
                {/* Branding Top */}
                <div className="relative z-20">
                    <div className="font-mono text-3xl font-bold tracking-tighter text-pure flex items-center gap-3 mb-2">
                        <div className="icon-shield text-teal text-4xl"></div>
                        GAM ASSURANCE
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-sans text-[11px] text-fog uppercase tracking-widest">Powered by</span>
                        <div className="font-mono text-[14px] font-bold text-cloud flex items-center gap-1">
                            <div className="icon-activity text-teal text-sm"></div>
                            TREMOR
                        </div>
                    </div>
                </div>

                {/* Map Background */}
                <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                    <div className="w-[150%] h-[150%] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Algeria_location_map.svg/1024px-Algeria_location_map.svg.png')] bg-contain bg-no-repeat bg-center filter grayscale invert opacity-30 transform -rotate-6"></div>
                    {/* Subtle hotspots */}
                    <div className="absolute top-[40%] left-[45%] w-3 h-3 bg-teal rounded-full shadow-[0_0_30px_rgba(57,208,216,0.6)]">
                        <div className="animate-ping absolute inset-0 rounded-full bg-teal opacity-40"></div>
                    </div>
                    <div className="absolute top-[35%] left-[55%] w-2 h-2 bg-teal rounded-full shadow-[0_0_20px_rgba(57,208,216,0.4)] opacity-50"></div>
                </div>

                {/* Left Bottom Decor */}
                <div className="relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-carbon/80 backdrop-blur border border-ash rounded font-sans text-[11px] text-cloud font-medium tracking-wider mb-2">
                        <div className="w-1.5 h-1.5 bg-green rounded-full"></div>
                        Réseau Sécurisé GAM
                    </div>
                    <p className="font-sans text-[13px] text-fog max-w-sm">
                        Système d'Intelligence Sismique interne. Connexion chiffrée de bout en bout.
                    </p>
                </div>
                
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D12]/50 via-transparent to-[#0A0D12] z-10"></div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative z-20 px-8 py-12 bg-slate overflow-y-auto">
                <div className="w-full max-w-[400px]">
                    
                    <div className="mb-10 text-center lg:text-left">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center items-center gap-2 mb-6 font-mono text-2xl font-bold text-pure">
                            <div className="icon-shield text-teal"></div>
                            GAM ASSURANCE
                        </div>
                        <h1 className="text-[28px] font-mono text-pure mb-2">Connexion — GAM Assurance</h1>
                        <p className="font-sans text-[15px] text-fog">Veuillez vous identifier pour accéder à votre espace.</p>
                    </div>

                    {/* SSO Button */}
                    <button className="btn-outline mb-6 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-teal/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="icon-building-2 mr-3 text-fog group-hover:text-pure transition-colors"></div>
                        <span className="relative z-10">Connexion via réseau GAM</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-ash flex-1"></div>
                        <div className="font-sans text-[11px] text-fog uppercase tracking-widest">Ou identifiants directs</div>
                        <div className="h-px bg-ash flex-1"></div>
                    </div>

                    {/* Standard Form */}
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = 'index.html'; }}>
                        <div>
                            <label className="font-sans text-[13px] font-medium text-cloud mb-1.5 block">Email Professionnel</label>
                            <input type="email" className="input-field" placeholder="prenom.nom@gam-assurance.dz" required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="font-sans text-[13px] font-medium text-cloud block">Mot de passe</label>
                                <a href="#" className="font-sans text-[12px] text-teal hover:text-teal/80 transition-colors">Mot de passe oublié ?</a>
                            </div>
                            <input type="password" className="input-field" placeholder="••••••••" required />
                        </div>
                        
                        <button type="submit" className="btn-primary mt-2">
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-12 text-center lg:text-left">
                        <p className="font-sans text-[13px] text-fog">
                            Vous n'avez pas de compte ? <a href="mailto:support.it@gam-assurance.dz" className="text-teal hover:underline">Contactez votre administrateur système.</a>
                        </p>
                    </div>

                    <div className="mt-12 pt-6 border-t border-ash text-center lg:text-left">
                        <p className="font-sans text-[12px] text-fog leading-relaxed">
                            Accès réservé aux employés de GAM Assurance.<br/>
                            Pour tout problème de connexion, contactez la DSI.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};