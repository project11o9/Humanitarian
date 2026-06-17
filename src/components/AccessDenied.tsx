import React from "react";
import { ShieldAlert, LogOut, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/volunteer-login");
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center z-50 px-4">
      <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-sans font-black text-sm tracking-tight text-[#0F172A] uppercase block">
            Bait Al-Rahma Volunteer Portal
          </span>
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans font-normal">
            Your logged-in account <strong className="text-[#0F172A]">{profile?.email}</strong> with role <strong className="capitalize">{profile?.role}</strong> is not authorized to access this section of the Volunteer Portal.
          </p>
          {profile?.status === "disabled" && (
            <p className="text-[11px] text-red-600 font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg mt-2">
              Status Notice: Your volunteer profile has been disabled by administrators.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-stretch">
          <Link
            to="/"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Donor Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-black uppercase py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-orange-200" />
            <span>Sign Out & Switch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
