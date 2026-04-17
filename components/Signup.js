const Signup = () => {
    const [step, setStep] = React.useState(1);
    const [showPassword, setShowPassword] = React.useState(false);
    
    const [formData, setFormData] = React.useState({
        fullName: '',
        matricule: '',
        email: '',
        department: '',
        password: '',
        confirmPassword: '',
        role: '',
        reason: ''
    });

    const [emailError, setEmailError] = React.useState('');

    // Password validation logic
    const reqLength = formData.password.length >= 8;
    const reqUpper = /[A-Z]/.test(formData.password);
    const reqNumber = /[0-9]/.test(formData.password);
    const reqSpecial = /[^A-Za-z0-9]/.test(formData.password);
    const passwordStrength = [reqLength, reqUpper, reqNumber, reqSpecial].filter(Boolean).length;
    
    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'email') {
            if (value && !value.endsWith('@gam-assurance.dz')) {
                setEmailError('Must be a @gam-assurance.dz email address.');
            } else {
                setEmailError('');
            }
        }
    };

    const isStep1Valid = 
        formData.fullName && 
        formData.matricule && 
        formData.email.endsWith('@gam-assurance.dz') && 
        formData.department && 
        passwordStrength === 4 && 
        passwordsMatch;

    const isStep2Valid = !!formData.role;

    const steps = [
        { num: 1, title: 'Your Account' },
        { num: 2, title: 'Access Request' },
        { num: 3, title: 'Confirmation' }
    ];

    const roles = [
        {
            id: 'Risk Manager',
            title: 'Risk Manager',
            desc: 'Full access. View all maps, run simulations, generate reports, configure parameters.',
            for: 'Risk department staff'
        },
        {
            id: 'Underwriter',
            title: 'Underwriter',
            desc: 'Access to underwriting assistant, client scores, portfolio view. Cannot modify system settings.',
            for: 'Underwriting department staff'
        },
        {
            id: 'Analyst',
            title: 'Analyst',
            desc: 'Read-only access to all dashboards, maps, and reports. Cannot enter or modify contracts.',
            for: 'Actuarial and management staff'
        },
        {
            id: 'Viewer',
            title: 'Viewer',
            desc: 'Dashboard and reports only. No map interaction, no simulations.',
            for: 'General management, executive level'
        }
    ];

    return (
        <div className="min-h-screen flex bg-carbon selection:bg-teal/30 selection:text-teal relative" data-name="signup-page" data-file="components/Signup.js">
            
            {/* Left Panel - Fixed Width 300px */}
            <div className="hidden lg:flex w-[300px] shrink-0 bg-slate border-r border-ash overflow-hidden flex-col justify-between p-8 z-10">
                {/* Top Branding */}
                <div>
                    <div className="font-mono text-2xl font-bold tracking-tighter text-pure flex items-center gap-2 mb-2">
                        <div className="icon-shield text-teal text-3xl"></div>
                        GAM
                    </div>
                    <div className="flex items-center gap-2 mb-12">
                        <span className="font-sans text-[10px] text-fog uppercase tracking-widest">Powered by</span>
                        <div className="font-mono text-[12px] font-bold text-cloud">TREMOR</div>
                    </div>

                    {/* Vertical Step Indicator */}
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-ash -z-10"></div>
                        <ul className="space-y-6 relative z-10">
                            {steps.map((s, i) => {
                                const isActive = step === s.num;
                                const isPassed = step > s.num;
                                return (
                                    <li key={s.num} className="flex items-center gap-4">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-mono transition-colors ${
                                            isActive ? 'bg-teal text-slate shadow-[0_0_10px_rgba(57,208,216,0.3)]' : 
                                            isPassed ? 'bg-graphite text-teal border border-teal' : 'bg-graphite text-fog border border-ash'
                                        }`}>
                                            {isPassed ? <div className="icon-check text-[14px]"></div> : s.num}
                                        </div>
                                        <span className={`font-sans text-sm font-medium ${isActive ? 'text-pure' : 'text-fog'}`}>
                                            {s.title}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="mt-8 font-mono text-xl text-pure">
                        {steps.find(s => s.num === step)?.title}
                    </div>
                </div>

                {/* Bottom Help */}
                <div className="pt-6 border-t border-ash/50">
                    <p className="font-sans text-[12px] text-fog">
                        Need help? Contact your system administrator.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8 h-screen overflow-y-auto bg-carbon">
                
                {/* Mobile Header */}
                <div className="lg:hidden w-full max-w-[420px] mb-8">
                    <div className="font-mono text-2xl font-bold text-pure flex items-center gap-2 mb-4">
                        <div className="icon-shield text-teal"></div> GAM
                    </div>
                    <div className="text-fog text-sm mb-2">Step {step} of 3</div>
                    <div className="h-1 w-full bg-graphite rounded-full overflow-hidden">
                        <div className="h-full bg-teal transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
                    </div>
                </div>

                {/* Step 1: YOUR ACCOUNT */}
                {step === 1 && (
                    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-4 duration-300">
                        <h1 className="text-2xl font-mono text-pure mb-1">Create your account</h1>
                        <p className="font-sans text-[14px] text-fog mb-8">Use your GAM Assurance professional credentials.</p>

                        <div className="space-y-5">
                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Full name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field bg-graphite" placeholder="e.g. Ahmed Benali" />
                            </div>

                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Employee ID (Matricule)</label>
                                <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} className="input-field bg-graphite" placeholder="e.g. GAM-2026" />
                                <p className="text-[11px] text-fog mt-1.5">Found on your employee card or HR documents.</p>
                            </div>

                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Professional email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`input-field bg-graphite ${emailError ? 'border-red focus:ring-red' : ''}`} placeholder="name@gam-assurance.dz" />
                                {emailError && <p className="text-red text-[12px] mt-1.5 font-sans flex items-center gap-1"><div className="icon-circle-alert text-sm"></div> {emailError}</p>}
                            </div>

                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Department</label>
                                <select name="department" value={formData.department} onChange={handleChange} className="input-field bg-graphite appearance-none">
                                    <option value="" disabled hidden>Select department...</option>
                                    <option value="Risk Management">Risk Management</option>
                                    <option value="Underwriting">Underwriting</option>
                                    <option value="Actuarial">Actuarial</option>
                                    <option value="General Management">General Management</option>
                                    <option value="IT / DSI">IT / DSI</option>
                                    <option value="Claims">Claims</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        className="input-field bg-graphite pr-10" 
                                        placeholder="Create a strong password" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-cloud"
                                    >
                                        <div className={showPassword ? "icon-eye-off" : "icon-eye"}></div>
                                    </button>
                                </div>
                                
                                {/* Strength Bar */}
                                <div className="flex gap-1 mt-2.5 mb-2">
                                    {[1, 2, 3, 4].map(level => (
                                        <div key={level} className={`h-1 flex-1 rounded-full ${passwordStrength >= level ? 'bg-green' : 'bg-ash'}`}></div>
                                    ))}
                                </div>
                                {/* Checklist */}
                                <ul className="text-[11px] font-sans space-y-1 text-fog">
                                    <li className={reqLength ? "text-green" : ""}><span className="mr-1">{reqLength ? "✓" : "○"}</span> At least 8 characters</li>
                                    <li className={reqUpper ? "text-green" : ""}><span className="mr-1">{reqUpper ? "✓" : "○"}</span> One uppercase letter</li>
                                    <li className={reqNumber ? "text-green" : ""}><span className="mr-1">{reqNumber ? "✓" : "○"}</span> One number</li>
                                    <li className={reqSpecial ? "text-green" : ""}><span className="mr-1">{reqSpecial ? "✓" : "○"}</span> One special character</li>
                                </ul>
                            </div>

                            <div>
                                <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Confirm password</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        className="input-field bg-graphite pr-10" 
                                        placeholder="Repeat password" 
                                    />
                                    {passwordsMatch && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green">
                                            <div className="icon-check"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)} 
                                disabled={!isStep1Valid}
                                className="w-full h-[44px] bg-blue hover:bg-blue/90 disabled:bg-ash disabled:text-fog disabled:cursor-not-allowed text-pure font-sans font-semibold rounded-[6px] flex items-center justify-center transition-colors mt-8"
                            >
                                Continue <div className="icon-arrow-right ml-2 text-sm"></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: ACCESS REQUEST */}
                {step === 2 && (
                    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-4 duration-300">
                        <h1 className="text-2xl font-mono text-pure mb-1">Request your access level</h1>
                        <p className="font-sans text-[14px] text-fog mb-8">Your administrator will review and approve your role before you can sign in.</p>

                        <div className="space-y-4 mb-6">
                            {roles.map(r => (
                                <button 
                                    key={r.id}
                                    onClick={() => setFormData(prev => ({ ...prev, role: r.id }))}
                                    className={`w-full text-left p-4 rounded-[8px] border transition-all relative overflow-hidden ${
                                        formData.role === r.id 
                                        ? 'border-teal bg-[rgba(57,208,216,0.05)]' 
                                        : 'border-ash bg-graphite hover:border-fog'
                                    }`}
                                >
                                    {formData.role === r.id && (
                                        <div className="absolute top-3 right-3 text-teal">
                                            <div className="icon-check"></div>
                                        </div>
                                    )}
                                    <h3 className={`font-mono text-base mb-1 ${formData.role === r.id ? 'text-teal' : 'text-pure'}`}>{r.title}</h3>
                                    <p className="font-sans text-[12px] text-fog mb-2 leading-relaxed">{r.desc}</p>
                                    <p className="font-sans text-[11px] text-cloud opacity-80 uppercase tracking-wide">For: {r.for}</p>
                                </button>
                            ))}
                        </div>

                        <div className="mb-8">
                            <label className="font-sans text-[12px] font-semibold text-cloud mb-1.5 block">Reason for access (optional)</label>
                            <textarea 
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                maxLength={200}
                                className="w-full h-[80px] bg-graphite border border-ash rounded-[6px] p-3 text-sm text-cloud focus:border-teal focus:outline-none resize-none"
                                placeholder="Briefly describe your role and why you need access to TREMOR."
                            ></textarea>
                            <div className="text-right text-[11px] text-fog mt-1">
                                {formData.reason.length} / 200
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <button 
                                onClick={() => setStep(1)}
                                className="font-sans text-[14px] text-fog hover:text-pure transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => setStep(3)} 
                                disabled={!isStep2Valid}
                                className="h-[44px] px-6 bg-blue hover:bg-blue/90 disabled:bg-ash disabled:text-fog disabled:cursor-not-allowed text-pure font-sans font-semibold rounded-[6px] flex items-center justify-center transition-colors"
                            >
                                Submit Request <div className="icon-arrow-right ml-2 text-sm"></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: CONFIRMATION */}
                {step === 3 && (
                    <div className="w-full max-w-[480px] text-center animate-in fade-in zoom-in-95 duration-500">
                        
                        <div className="w-16 h-16 rounded-full border-2 border-teal bg-graphite flex items-center justify-center mx-auto mb-6">
                            <div className="icon-clock text-2xl text-teal"></div>
                        </div>

                        <h1 className="text-[28px] font-mono text-pure mb-4">Request submitted.</h1>
                        
                        <p className="font-sans text-[16px] text-fog mb-2 leading-relaxed">
                            Your account request has been sent to the GAM Assurance system administrator. You will receive an email confirmation at <span className="text-pure">{formData.email}</span> once your access is approved.
                        </p>
                        <p className="font-sans text-[13px] text-fog mb-8">
                            Approval typically takes up to 24 hours during business days.
                        </p>

                        <div className="bg-graphite rounded-[8px] border border-ash p-6 text-left mb-8 shadow-sm">
                            <div className="grid grid-cols-[140px_1fr] gap-y-3 font-sans text-[13px]">
                                <div className="text-fog">Name:</div>
                                <div className="text-cloud font-medium">{formData.fullName}</div>
                                
                                <div className="text-fog">Employee ID:</div>
                                <div className="text-cloud font-medium">{formData.matricule}</div>
                                
                                <div className="text-fog">Email:</div>
                                <div className="text-cloud font-medium">{formData.email}</div>
                                
                                <div className="text-fog">Department:</div>
                                <div className="text-cloud font-medium">{formData.department}</div>
                                
                                <div className="text-fog">Role requested:</div>
                                <div className="text-cloud font-medium">{formData.role}</div>
                            </div>
                        </div>

                        <a href="login.html" className="w-full h-[44px] border border-teal text-teal hover:bg-teal/10 font-sans font-semibold rounded-[6px] flex items-center justify-center transition-colors mb-6">
                            Back to Login
                        </a>

                        <p className="font-sans text-[12px] text-fog">
                            Did not receive a confirmation email? Check your spam folder or contact your administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};