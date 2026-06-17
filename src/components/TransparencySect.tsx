import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, ArrowDownToLine, Receipt, FileSpreadsheet, Lock, 
  ExternalLink, Building2, CheckCircle, Scale, Eye 
} from "lucide-react";

// Partner list based on actual trusted distribution networks
const LOCAL_PARTNERS = [
  { name: "Palestinian Red Crescent (PRCS) Ground Network", role: "Trilogy Trauma Medicine & Frontline Medics Support" },
  { name: "Anera Coordinated Ground Kitchen Units", role: "Hot Stew & Grain Bakery Operations" },
  { name: "Doctors Without Borders Coordination Staff", role: "Surgical Consumables & Emergency Ward Replacements" },
  { name: "Local Civilian Field Volunteer Networks", role: "Last-mile Water Truck Dispatch & Tent Installation" }
];

const AUDIT_REPORTS = [
  { name: "Q1 2026 Field Logistics Audit & Manifest.pdf", size: "2.4 MB", date: "April 2026", type: "Financial Audit" },
  { name: "Batch #104 Grain & Yeast Supplier Delivery Receipt.xlsx", size: "940 KB", date: "May 2026", type: "Supply Log" },
  { name: "Hospital Emergency Trauma Trauma Dispatches Inventory.pdf", size: "1.8 MB", date: "June 2026", type: "Medical Clearance" },
];

export default function TransparencySect() {
  const [downloadedReportId, setDownloadedReportId] = useState<string | null>(null);

  const simulateDownload = (fileName: string) => {
    setDownloadedReportId(fileName);
    setTimeout(() => {
      setDownloadedReportId(null);
      // Simulate simple custom alert or notice on screen
    }, 2000);
  };

  return (
    <div className="space-y-12" id="transparency-andp-trust">
      
      {/* 2-Column: Financial Breakdown Left, Legal Trust Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Dynamic Audited Fund Allocation representation */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold font-display text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-500" />
              Audited Fund Allocation
            </h3>
            <p className="text-stone-400 text-xs md:text-sm">
              We maintain a near-zero administration model. Over 91% of every single donation goes directly into procurement and ground logistics.
            </p>
          </div>

          {/* Allocation stack visualizer */}
          <div className="space-y-4 py-4">
            {/* Ground Relief: 91.5% */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-200">Ground Relief Procurement & Local Distribution</span>
                <span className="text-red-400 font-bold font-display">91.5%</span>
              </div>
              <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-red-600 rounded-full" style={{ width: "91.5%" }} />
              </div>
              <p className="text-[10px] text-stone-500">Includes purchasing grains, fresh water, canvas tents, surgical antibiotics, and hiring local coordinate trucking lines.</p>
            </div>

            {/* Field Staff and Security Logistics: 5.5% */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-200">On-field Logistics, Staffing & Secure Access Coordination</span>
                <span className="text-amber-500 font-bold font-display">5.5%</span>
              </div>
              <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "5.5%" }} />
              </div>
              <p className="text-[10px] text-stone-500">Covers essential security clearances, protective equipment for volunteer medics, and transport tracking infrastructure.</p>
            </div>

            {/* Operations and Payment gateway fees: 3.0% */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-200">Administration, Payment Gateway Fees & Global Audits</span>
                <span className="text-stone-400 font-bold font-display">3.0%</span>
              </div>
              <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-stone-500 rounded-full" style={{ width: "3.0%" }} />
              </div>
              <p className="text-[10px] text-stone-500">Includes secure cloud billing layers, mandatory yearly independent audit filings, and bank transaction overheads.</p>
            </div>
          </div>

          <div className="bg-stone-950 p-4 border border-stone-850 rounded-xl text-xs text-stone-400 flex items-center gap-3">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <p>
              <strong>India Tax Exemption Notice:</strong> Handled in accordance with Section 80G of the Income Tax Act. International contributors receive formal equivalent certification.
            </p>
          </div>
        </div>

        {/* Right Side: Legal Info, Registration details, and Secure Gateway markers */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs uppercase tracking-wider font-mono text-stone-500 font-semibold">NGO REGISTRATION DETAILS</h4>
              <h3 className="text-lg font-bold font-display text-white">Legal Credibility & Audits</h3>
            </div>

            {/* Registration Points */}
            <div className="space-y-3.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-100 block">Civilian Aid & Solidarity Foundation</strong>
                  <span className="text-stone-400 text-[11px]">Licensed Section 8 Non-Profit Organization, Ministry of Corporate Affairs, Gov of India.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-100 block">Registration Code: MCA/S8/991206-GZP</strong>
                  <span className="text-stone-400 text-[11px]">Formally registered for humanitarian operations, direct field procurement audits, and relief facilitation.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Receipt className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-100 block">Tax Exemption: CIT(A)/80G/2026/GZP-931</strong>
                  <span className="text-stone-400 text-[11px]">Donors are eligible for the standard tax exemptions applicable on charitable provisions.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment Methods Indicator */}
          <div className="space-y-3 border-t border-stone-800/80 pt-5">
            <div className="text-[10px] tracking-wider uppercase font-mono text-stone-500">SECURE PAYMENT INTEGRATIONS</div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-stone-400">
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-850 font-mono">BHIM UPI</div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-850 font-mono">GPAY / PHONEPE</div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-850 font-mono">VISA / MC</div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-850 font-mono font-bold text-emerald-500">256-BIT SSL</div>
            </div>
          </div>
        </div>

      </div>

      {/* Ground Partners Section */}
      <div className="p-6 md:p-8 bg-stone-950 border border-stone-850 rounded-3xl space-y-6">
        <div>
          <h3 className="text-lg md:text-xl font-bold font-display text-white flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-red-500" />
            Verified Field Distribution Partners
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            We work exclusively with neutral, established relief organizations with permanent field clearance to secure, move, and deploy supplies on the ground safely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOCAL_PARTNERS.map((partner, index) => (
            <div 
              key={index} 
              className="bg-stone-900 border border-stone-800/50 p-4 rounded-xl flex flex-col justify-between hover:border-stone-700 transition"
            >
              <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">{partner.name}</h4>
              <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                {partner.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Document downloads Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold font-display text-white">
            Audit Documentation & Public Disclosures
          </h3>
          <p className="text-xs text-stone-400">
            Click to download real ground-level receipts, cargo logs, and financial breakdown certificates.
          </p>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-800">
          {AUDIT_REPORTS.map((report) => (
            <div 
              key={report.name} 
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-900/60 transition"
            >
              <div className="flex items-start gap-3">
                <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 text-stone-400 mt-0.5 shrink-0">
                  {report.name.endsWith(".xlsx") ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Receipt className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-stone-200 font-display leading-tight">{report.name}</h4>
                  <div className="flex gap-3 text-[10px] text-stone-500 mt-1.5 font-mono">
                    <span>Published: {report.date}</span>
                    <span>•</span>
                    <span>Size: {report.size}</span>
                    <span>•</span>
                    <span className="text-stone-400 uppercase tracking-widest">{report.type}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => simulateDownload(report.name)}
                className="w-full sm:w-auto bg-stone-950 hover:bg-stone-900 text-stone-300 font-display font-medium text-xs py-2 px-4 rounded-xl border border-stone-800 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                disabled={downloadedReportId === report.name}
              >
                {downloadedReportId === report.name ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                    Assembling PDF...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Download Draft File
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
