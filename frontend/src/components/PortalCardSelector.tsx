import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  GraduationCap, 
  ArrowRight, 
  X, 
  LogIn, 
  UserPlus, 
  HelpCircle
} from 'lucide-react';

interface PortalCardSelectorProps {
  className?: string;
  onSelectRole?: (role: 'admin' | 'student') => void;
}

export const PortalCardSelector: React.FC<PortalCardSelectorProps> = ({
  className = '',
  onSelectRole
}) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'student' | null>(null);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRole(null);
      }
    };
    if (selectedRole) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRole]);

  const handleCardClick = (role: 'admin' | 'student') => {
    if (onSelectRole) {
      onSelectRole(role);
      return;
    }
    setSelectedRole(role);
  };

  const handleGoToLogin = () => {
    if (!selectedRole) return;
    navigate(`/login?role=${selectedRole}`);
  };

  const handleGoToRegister = () => {
    if (!selectedRole) return;
    navigate(`/register?role=${selectedRole}`);
  };

  const roleInfo = selectedRole === 'admin' 
    ? {
        title: 'Admin / Staff Portal',
        badge: 'Authorized Personnel Only',
        badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
        iconBg: 'bg-slate-950/90 border-slate-800/90',
        icon: <ShieldCheck className="w-8 h-8 text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]" />,
        accentColor: 'text-purple-400',
        btnBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
      }
    : {
        title: 'Student Portal',
        badge: 'Open to All Students',
        badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
        iconBg: 'bg-gradient-to-tr from-purple-800 to-purple-600',
        icon: <GraduationCap className="w-8 h-8 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" />,
        accentColor: 'text-emerald-400',
        btnBg: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'
      };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. ROLE CARDS SELECTION                                   */}
      {/* ========================================================= */}
      <div className={`w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 px-4 ${className}`}>
        
        {/* 1. Admin / Staff Card */}
        <div 
          onClick={() => handleCardClick('admin')}
          className="w-full max-w-sm bg-[#090e1a]/90 backdrop-blur-2xl border border-slate-800/90 hover:border-purple-500/50 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(147,51,234,0.18)] group cursor-pointer"
        >
          {/* Dark Rounded Icon Container */}
          <div className="w-20 h-20 bg-slate-950/90 border border-slate-800/90 rounded-3xl flex items-center justify-center mb-6 shadow-inner shadow-black/60 group-hover:scale-105 group-hover:border-purple-500/40 transition-all duration-300">
            <ShieldCheck className="w-10 h-10 text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
          </div>

          {/* Badge Pill */}
          <span className="bg-purple-950/60 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-purple-800/50 tracking-wider uppercase shadow-xs">
            Authorized Personnel Only
          </span>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8">
            Admin / Staff
          </h3>

          {/* Action Button */}
          <button
            type="button"
            className="w-full bg-[#040812] hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg cursor-pointer group/btn pointer-events-none"
          >
            <span>Access Admin Portal</span>
            <ArrowRight className="w-4 h-4 text-purple-400 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 2. Student Portal Card */}
        <div 
          onClick={() => handleCardClick('student')}
          className="w-full max-w-sm bg-[#090e1a]/90 backdrop-blur-2xl border border-slate-800/90 hover:border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(16,185,129,0.18)] group cursor-pointer"
        >
          {/* Purple Gradient Icon Container */}
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-800 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-all duration-300">
            <GraduationCap className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" />
          </div>

          {/* Badge Pill */}
          <span className="bg-emerald-950/60 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-800/50 tracking-wider uppercase shadow-xs">
            Open to All Students
          </span>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8">
            Student Portal
          </h3>

          {/* Action Button */}
          <button
            type="button"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer group/btn pointer-events-none"
          >
            <span>Access Student Portal</span>
            <ArrowRight className="w-4 h-4 text-slate-950 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ACCOUNT STATUS QUESTION MODAL                          */}
      {/* ========================================================= */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          {/* Backdrop click to dismiss */}
          <div 
            className="absolute inset-0"
            onClick={() => setSelectedRole(null)}
          />

          {/* Modal Content Box */}
          <div className="relative z-10 w-full max-w-md bg-[#090e1a] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Portal Header Badge */}
            <div className={`w-16 h-16 ${roleInfo.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-slate-800`}>
              {roleInfo.icon}
            </div>

            <span className={`${roleInfo.badgeColor} text-[11px] font-bold px-3.5 py-1 rounded-full mb-2 border uppercase tracking-wider`}>
              {roleInfo.title}
            </span>

            {/* Question Heading */}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2 justify-center">
              <HelpCircle className="w-5 h-5 text-emerald-400 inline" />
              Do you have an account already?
            </h3>

            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Please choose an option below to proceed to the <span className={`font-semibold ${roleInfo.accentColor}`}>{roleInfo.title}</span>.
            </p>

            {/* Selection Options */}
            <div className="w-full flex flex-col gap-3.5">
              
              {/* Option 1: Yes, Sign In */}
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full group/btn p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all duration-200 shadow-md hover:shadow-emerald-500/10 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/btn:scale-105 transition-transform">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover/btn:text-emerald-400 transition-colors">
                      Yes, I have an account
                    </h4>
                    <p className="text-xs text-slate-400">
                      Sign in with your email & password
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover/btn:text-emerald-400 group-hover/btn:translate-x-1 transition-all" />
              </button>

              {/* Option 2: No, Register */}
              <button
                type="button"
                onClick={handleGoToRegister}
                className="w-full group/btn p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between text-left transition-all duration-200 shadow-md hover:shadow-purple-500/10 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover/btn:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover/btn:text-purple-400 transition-colors">
                      No, I need to create one
                    </h4>
                    <p className="text-xs text-slate-400">
                      Register a new {selectedRole === 'admin' ? 'admin / staff' : 'intern'} profile
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover/btn:text-purple-400 group-hover/btn:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Back / Cancel button */}
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="mt-5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
            >
              ← Choose a different portal
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PortalCardSelector;
