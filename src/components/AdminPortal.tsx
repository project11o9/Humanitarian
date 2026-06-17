import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Lock, ShieldCheck, LogOut, Send, 
  Landmark, Check, AlertCircle, CheckCircle2, X,
  Clock, SlidersHorizontal, Moon, Sun, Save
} from "lucide-react";
import { ChatRoom, ChatMessage, AdminUser, VerifiedDonation } from "../types";

interface AdminPortalProps {
  rooms: ChatRoom[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
  verifiedDonations: VerifiedDonation[];
  setVerifiedDonations: React.Dispatch<React.SetStateAction<VerifiedDonation[]>>;
  onClosePortal: () => void;
}

export default function AdminPortal({
  rooms,
  setRooms,
  verifiedDonations,
  setVerifiedDonations,
  onClosePortal
}: AdminPortalProps) {
  // Login Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("bait_admin_logged") === "true";
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("bait_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Login credentials (preset for ease)
  const [email, setEmail] = useState("manager@bait-al-rahma.org");
  const [password, setPassword] = useState("direct-ground-2026");
  const [loginError, setLoginError] = useState("");

  // Room queue and input states
  const [activeRoomId, setActiveRoomId] = useState<string>("room-active");
  const [chatInput, setChatInput] = useState("");

  // Inline approval / verify state
  const [approvingMsgId, setApprovingMsgId] = useState<string | null>(null);
  const [inputApprovedAmount, setInputApprovedAmount] = useState<number>(5000);

  // Editable Bank Details Template persistence state
  const [bankAccountTitle, setBankAccountTitle] = useState(() => {
    return localStorage.getItem("bait_bank_title") || "Bait Al-Rahma Trust Initiative";
  });
  const [bankName, setBankName] = useState(() => {
    return localStorage.getItem("bait_bank_name") || "State Bank of India (Central Delhi)";
  });
  const [bankAccountNumber, setBankAccountNumber] = useState(() => {
    return localStorage.getItem("bait_bank_account") || "80942011943";
  });
  const [bankIfscCode, setBankIfscCode] = useState(() => {
    return localStorage.getItem("bait_bank_ifsc") || "SBIN0010482";
  });
  const [bankCustomNote, setBankCustomNote] = useState(() => {
    return localStorage.getItem("bait_bank_note") || "Thank you so much for your noble support and generous trust in Bait Al-Rahma. Please upload your wire transaction receipt screenshot here so our accounts desk can immediately verify your contribution and issue your Sec 80G tax clearance certificate. Peace be with you!";
  });

  // Dynamic Away Auto-Reply config states
  const [awayReplyEnabled, setAwayReplyEnabled] = useState(() => {
    return localStorage.getItem("bait_away_reply_enabled") !== "false";
  });
  const [awayMessage, setAwayMessage] = useState(() => {
    return localStorage.getItem("bait_away_message") || "شكراً لتواصلكم مع بيت الرحمة. We are currently outside of our standard support hours (9:00 AM - 5:00 PM) and unavailable. Our volunteers will trace and verify your contribution details as soon as we return. Peace be upon you.";
  });
  const [supportStartHour, setSupportStartHour] = useState(() => {
    return Number(localStorage.getItem("bait_support_hour_start") || "9");
  });
  const [supportEndHour, setSupportEndHour] = useState(() => {
    return Number(localStorage.getItem("bait_support_hour_end") || "17");
  });
  const [forceAwayMode, setForceAwayMode] = useState(() => {
    return localStorage.getItem("bait_force_away_mode") === "true";
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync template values to localStorage on any state modification
  useEffect(() => {
    // If the saved note in localStorage is the old default, migrate to the new thank you note
    const saved = localStorage.getItem("bait_bank_note");
    if (saved && saved.includes("Please carry out your wire transfer")) {
      const newDefault = "Thank you so much for your noble support and generous trust in Bait Al-Rahma. Please upload your wire transaction receipt screenshot here so our accounts desk can immediately verify your contribution and issue your Sec 80G tax clearance certificate. Peace be with you!";
      setBankCustomNote(newDefault);
      localStorage.setItem("bait_bank_note", newDefault);
    }
  }, []);

  // Sync template values to localStorage on any state modification
  useEffect(() => {
    localStorage.setItem("bait_bank_title", bankAccountTitle);
    localStorage.setItem("bait_bank_name", bankName);
    localStorage.setItem("bait_bank_account", bankAccountNumber);
    localStorage.setItem("bait_bank_ifsc", bankIfscCode);
    localStorage.setItem("bait_bank_note", bankCustomNote);
  }, [bankAccountTitle, bankName, bankAccountNumber, bankIfscCode, bankCustomNote]);

  useEffect(() => {
    localStorage.setItem("bait_away_reply_enabled", awayReplyEnabled ? "true" : "false");
    localStorage.setItem("bait_away_message", awayMessage);
    localStorage.setItem("bait_support_hour_start", supportStartHour.toString());
    localStorage.setItem("bait_support_hour_end", supportEndHour.toString());
    localStorage.setItem("bait_force_away_mode", forceAwayMode ? "true" : "false");
  }, [awayReplyEnabled, awayMessage, supportStartHour, supportEndHour, forceAwayMode]);

  // Compute off-hours status
  const currentHour = new Date().getHours();
  const isOutsideHours = currentHour < supportStartHour || currentHour >= supportEndHour;
  const isCurrentlyAway = forceAwayMode || isOutsideHours;

  // Auto scroll
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rooms, activeRoomId]);

  // Login authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== "direct-ground-2026" && password !== "admin123") {
      setLoginError("Invalid clearance key. Use 'direct-ground-2026' for testing.");
      return;
    }
    const user: AdminUser = {
      email,
      role: "Donation Manager",
      name: "Sarah Jameel"
    };
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem("bait_admin_logged", "true");
    localStorage.setItem("bait_admin_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("bait_admin_logged");
    localStorage.removeItem("bait_admin_user");
  };

  // Dispatch live response chat message
  const handleSendResponse = (textToSend?: string) => {
    const finalTxt = textToSend !== undefined ? textToSend : chatInput;
    if (!finalTxt.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRooms(prev => prev.map(r => {
      if (r.id === activeRoomId) {
        const newMsg: ChatMessage = {
          id: `support-msg-${Date.now()}`,
          sender: "support",
          senderName: "Sarah (NGO Support Guide)",
          text: finalTxt,
          timestamp
        };
        return {
          ...r,
          lastMessage: finalTxt,
          time: "Just now",
          unread: false,
          messages: [...r.messages, newMsg],
          lastActive: new Date().toISOString()
        };
      }
      return r;
    }));

    if (textToSend === undefined) {
      setChatInput("");
    }
  };

  // Click-to-dispatch official bank remittance coordinates (DYNAMICS)
  const handleQuickDispatchCoords = () => {
    const referenceCode = "BAR-AID-RE-" + Math.floor(100000 + Math.random() * 900000);
    const formattedText = `🏦 OFFICIAL NGO BANK REMITTANCE CREDENTIALS 🏦

Account Title: ${bankAccountTitle}
Beneficiary Bank: ${bankName}
Account Number: ${bankAccountNumber}
IFSC Code: ${bankIfscCode}
Exemption Reference Code: ${referenceCode}

${bankCustomNote}`;

    handleSendResponse(formattedText);
  };

  // In-line verify deposit receipt
  const handleVerifyDonationAmount = (roomId: string, messageId: string, amount: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updatedMessages = r.messages.map(m => {
          if (m.id === messageId && m.uploadedFile) {
            return {
              ...m,
              uploadedFile: {
                ...m.uploadedFile,
                verificationStatus: "Verified" as const,
                verifiedAmount: amount,
                receiptDownloadUrl: `https://bait-al-rahma.org/receipt-${Date.now()}.pdf`
              }
            };
          }
          return m;
        });

        const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const autoThanks: ChatMessage = {
          id: `msg-verification-thanks-${Date.now()}`,
          sender: "support",
          senderName: "Sarah (NGO Support Guide)",
          text: `✅ PAYMENT WIRE COMPLETED AND VERIFIED ✅\n\nWe have successfully verified your transfer of ₹${amount.toLocaleString()} for the: "${r.intendedAllocation || "Humanitarian Corridor"}".\n\nYour 80G statutory tax exemption receipt is locked and ready for immediate download. Thank you for your support.`,
          timestamp: replyTimestamp
        };

        return {
          ...r,
          status: "Verified" as const,
          lastMessage: `✓ Verified transfer of ₹${amount.toLocaleString()}`,
          messages: [...updatedMessages, autoThanks]
        };
      }
      return r;
    }));

    // Register receipt in public listing cache
    const targetRoom = rooms.find(r => r.id === roomId);
    const newDonation: VerifiedDonation = {
      id: `verified-tx-${Date.now()}`,
      roomName: targetRoom?.visitorName || "Supporter",
      email: targetRoom?.visitorEmail || "supporter@solidarity.org",
      amount: amount,
      allocation: targetRoom?.intendedAllocation || "Emergency Relief Corridor",
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referenceId: `BART-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      country: targetRoom?.country || "India"
    };

    setVerifiedDonations(prev => [newDonation, ...prev]);
    setApprovingMsgId(null);
  };

  const handleRejectReceipt = (roomId: string, messageId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updatedMessages = r.messages.map(m => {
          if (m.id === messageId && m.uploadedFile) {
            return {
              ...m,
              uploadedFile: {
                ...m.uploadedFile,
                verificationStatus: "Rejected" as const
              }
            };
          }
          return m;
        });

        const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const autoReject: ChatMessage = {
          id: `msg-verification-fail-${Date.now()}`,
          sender: "support",
          senderName: "Sarah (NGO Support Guide)",
          text: `❌ WIRE VERIFICATION DISCREPANCY ❌\n\nOur accounts audit team was unable to trace the transfer with the provided transaction file. Please verify the transaction details inside your banking app and submit a clear screenshot.`,
          timestamp: replyTimestamp
        };

        return {
          ...r,
          status: "Rejected" as const,
          lastMessage: "Manual submission rejected",
          messages: [...updatedMessages, autoReject]
        };
      }
      return r;
    }));
    setApprovingMsgId(null);
  };

  const selectedActiveRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // RENDER ADMIN PORTAL AUTHENTICATION
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1E3A8A]" />

          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C] border border-orange-100 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#0F172A]">Staff Access Desk</h2>
            <p className="text-xs text-neutral-500 leading-normal">
              Internal Control Panel — Verify and assist donors in real-time.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-600 block">Operator Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-850 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-slate-600 block">Security Password Key</label>
                <span className="text-[9px] text-[#EA580C] font-semibold">* Preset for easy evaluation</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-850 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="text-[11px] text-zinc-650 leading-relaxed p-3 bg-orange-50/50 rounded-lg border border-orange-100">
              💡 For instant testing access, simply click the button below. The verified key code <code className="bg-white px-1.5 py-0.5 rounded text-[#EA580C] font-bold border border-orange-100">direct-ground-2026</code> is pre-filled.
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-xs text-red-700 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-black uppercase rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer animate-fade-in"
            >
              Sign In to Staff Desk
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onClosePortal}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 uppercase transition"
            >
              ← Back to Donor Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MINIMAL STAFF WORKSPACE: SIDE-BY-SIDE CONVERSATIONS LIST & ACTIVE CHAT WINDOW
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-[#059669] border border-emerald-100 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight uppercase text-slate-900">NGO Staff Support Room</h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500 uppercase font-sans font-bold tracking-wider mt-0.5">
              Secure Live Chat Support Console • Live Donor Stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Operator Panel</span>
            <span className="font-extrabold text-[#0F172A]">{currentUser?.name}</span>
          </div>

          <button
            onClick={onClosePortal}
            className="px-3.5 py-2 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 border border-slate-200 cursor-pointer"
          >
            ← View Donor Page
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase flex items-center gap-1 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Side-by-Side Main Panel */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* PANEL 1: ACTIVE DONOR CONVERSATIONS DECK (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden min-h-[300px] lg:min-h-[580px] lg:max-h-[580px] shadow-2xs">
          
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
              Support Queue ({rooms.length})
            </span>
          </div>

          {/* Connected Chats Queue List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-slate-50/15">
            {rooms.length === 0 ? (
              <div className="text-center text-xs text-neutral-400 py-10 font-bold">
                No active donor chats setup.
              </div>
            ) : (
              rooms.map((r) => {
                const isActive = activeRoomId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRoomId(r.id);
                      setRooms(prev => prev.map(room => room.id === r.id ? { ...room, unread: false } : room));
                    }}
                    className={`w-full text-left p-3 rounded-xl transition flex gap-2 items-start cursor-pointer border ${
                      isActive 
                        ? "bg-[#1E3A8A]/5 border-[#1E3A8A]/35 text-[#1E3A8A]" 
                        : "border-transparent bg-white hover:bg-slate-50 text-slate-700 shadow-3xs"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 font-sans border border-slate-250/40">
                      {r.visitorName.charAt(0)}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-xs font-black text-slate-900 truncate block max-w-[100px]">{r.visitorName}</span>
                        <span className="text-[8px] font-mono text-neutral-400 font-bold">{r.time}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5 font-medium">{r.lastMessage}</p>
                    </div>

                    {r.unread && (
                      <span className="h-2 w-2 bg-[#EA580C] rounded-full self-center shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: ACTIVE CHAT CONVERSATION WORKSPACE (6 Columns on Large Screens) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden min-h-[450px] lg:min-h-[580px] lg:max-h-[580px] shadow-2xs">
          
          {/* Selected Donor Info Header & Status */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900">{selectedActiveRoom.visitorName}</span>
                <span className="text-[9.5px] bg-orange-100 text-orange-950 px-2 py-0.5 rounded font-black uppercase tracking-wider font-sans">
                  📍 {selectedActiveRoom.intendedAllocation || "General Aid Corridor"}
                </span>
              </div>
              <span className="text-[10.5px] text-slate-500 block font-mono mt-0.5">{selectedActiveRoom.visitorEmail}</span>
            </div>

            <button
              onClick={handleQuickDispatchCoords}
              className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-[10px] font-black uppercase rounded-lg shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Send Bank Coordinates</span>
            </button>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/10">
            {selectedActiveRoom.messages.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs font-semibold">No messages in this chat.</div>
            ) : (
              selectedActiveRoom.messages.map((m) => {
                const isStaff = m.sender === "support";
                return (
                  <div key={m.id} className={`flex ${isStaff ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                    <div className={`max-w-[85%] p-3.5 rounded-xl border text-xs whitespace-pre-wrap shadow-3xs ${
                      isStaff 
                        ? "bg-[#1E3A8A] border-[#1E3A8A] text-white rounded-tr-xs" 
                        : "bg-white border-slate-200 text-slate-800 rounded-tl-xs"
                    }`}>
                      <div className="flex justify-between items-baseline gap-4 mb-1 text-[9.5px]">
                        <span className={`font-black uppercase tracking-wider ${isStaff ? "text-amber-200" : "text-neutral-500"}`}>
                          {m.senderName}
                        </span>
                        <span className="font-mono text-stone-300 opacity-90">{m.timestamp}</span>
                      </div>
                      
                      <span className="font-medium leading-relaxed block">{m.text}</span>

                      {/* Integrated In-line Verification Action for transaction file attachments */}
                      {m.uploadedFile && (
                        <div className="mt-3 bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-left space-y-2 max-w-sm">
                          <span className="text-[9.5px] font-black tracking-wider text-amber-400 block uppercase border-b border-neutral-800 pb-1">
                            Uploaded Remittance Voucher
                          </span>
                          
                          <div className="h-32 rounded bg-slate-950 border border-slate-800 overflow-hidden relative mx-auto my-1">
                            <img 
                              src={m.uploadedFile.url} 
                              alt="Voucher receipt slip" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono py-1">
                            <span>Status: <b className={m.uploadedFile.verificationStatus === "Verified" ? "text-emerald-400 font-extrabold" : "text-amber-500"}>{m.uploadedFile.verificationStatus || "Pending Auditing"}</b></span>
                            <span>{m.uploadedFile.size}</span>
                          </div>

                          {/* Action Buttons inside the receipt bubble itself */}
                          {!m.uploadedFile.verificationStatus && (
                            <div className="pt-2 border-t border-neutral-800 space-y-2">
                              {approvingMsgId === m.id ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <label className="text-[8.5px] font-black uppercase text-amber-400 block pb-0.5">Approved Amount (₹)</label>
                                  </div>
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      value={inputApprovedAmount}
                                      onChange={(e) => setInputApprovedAmount(Number(e.target.value))}
                                      className="flex-1 p-1 bg-slate-950 border border-neutral-700 rounded text-[11px] font-mono text-white text-center font-bold focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleVerifyDonationAmount(selectedActiveRoom.id, m.id, inputApprovedAmount)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center justify-center transition cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setApprovingMsgId(null)}
                                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center justify-center transition cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setApprovingMsgId(m.id);
                                      setInputApprovedAmount(5000);
                                    }}
                                    className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer flex justify-center items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve Deposit</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectReceipt(selectedActiveRoom.id, m.id)}
                                    className="py-1 px-2.5 bg-red-650 hover:bg-red-700 text-white rounded text-[9.5px] font-bold uppercase transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatScrollRef} />
          </div>

          {/* Active Chat Send Input */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendResponse();
              }}
              placeholder={`Send message to ${selectedActiveRoom.visitorName}...`}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-[#1E3A8A] text-xs text-slate-950 font-medium"
            />
            
            <button
              onClick={() => handleSendResponse()}
              disabled={!chatInput.trim()}
              className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] disabled:bg-slate-100 disabled:text-slate-400 hover:scale-[1.01] text-white rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* PANEL 3: AUTOMATION AND EDITABLE BANK COORDINATES DESK (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-y-auto p-4 space-y-4 max-h-[580px] shadow-2xs">
          
          <div className="pb-2 border-b border-slate-150 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#EA580C]" />
            <h3 className="text-xs font-extrabold uppercase text-[#0F172A] tracking-wider font-sans">
              Templates & Auto-Reply
            </h3>
          </div>

          {/* SECTION A: REGULATORY SUPPORT HOURS & AWAY CONFIGURATOR */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wide flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Support Away Reply
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={awayReplyEnabled}
                  onChange={(e) => setAwayReplyEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* Support Hours settings */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Start Hour (24h)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={supportStartHour}
                  onChange={(e) => setSupportStartHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                  className="w-full px-2 py-1 bg-white border border-slate-250 rounded font-mono text-[11px] font-bold text-slate-800 text-center focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">End Hour (24h)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={supportEndHour}
                  onChange={(e) => setSupportEndHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                  className="w-full px-2 py-1 bg-white border border-slate-250 rounded font-mono text-[11px] font-bold text-slate-800 text-center focus:outline-none"
                />
              </div>
            </div>

            {/* Forced Manual Override for testing simulated off-hours */}
            <div className="flex items-center justify-between py-1 bg-white px-2 rounded border border-slate-200/60">
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-700 block">Force Away Test</span>
                <span className="text-[8px] text-neutral-400 block">Simulate offline state</span>
              </div>
              <input
                type="checkbox"
                checked={forceAwayMode}
                onChange={(e) => setForceAwayMode(e.target.checked)}
                className="rounded text-orange-500 cursor-pointer h-3.5 w-3.5 focus:ring-0"
              />
            </div>

            {/* Simulated Live System Status representation */}
            <div className={`p-2 rounded text-[10px] font-bold flex items-center justify-between border ${
              isCurrentlyAway && awayReplyEnabled
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <span className="flex items-center gap-1">
                {isCurrentlyAway && awayReplyEnabled ? <Moon className="w-3.5 h-3.5 shrink-0" /> : <Sun className="w-3.5 h-3.5 shrink-0 animate-spin-slow" />}
                {isCurrentlyAway && awayReplyEnabled ? "OFFLINE (Away active)" : "OPERATING ONLINE"}
              </span>
              <span className="font-mono text-[9px]">Local time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {/* Editable Away auto response message templates */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-600 block">Custom Away Message Text</label>
              <textarea
                rows={3}
                value={awayMessage}
                onChange={(e) => setAwayMessage(e.target.value)}
                className="w-full p-2 bg-white border border-slate-250 rounded-lg text-[10px] font-semibold text-slate-800 leading-normal focus:outline-none"
                placeholder="Offline auto-reply text template..."
              />
            </div>
          </div>

          {/* SECTION B: EDITABLE BANK DETAILS TEMPLATE PREVIEWER & SENDER */}
          <div className="bg-orange-50/50 rounded-xl border border-orange-150 p-3 space-y-2.5">
            <span className="text-[10px] font-black uppercase text-[#EA580C] tracking-wide flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              Bank Template Details
            </span>

            <div className="space-y-2 pt-1 border-t border-orange-200/50">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Account Title</label>
                <input
                  type="text"
                  value={bankAccountTitle}
                  onChange={(e) => setBankAccountTitle(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10.5px] font-semibold text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Beneficiary Bank</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10.5px] font-semibold text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10.5px] font-mono font-bold text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfscCode}
                  onChange={(e) => setBankIfscCode(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10.5px] font-mono font-bold text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Thank You Note Footer</label>
                <textarea
                  rows={2}
                  value={bankCustomNote}
                  onChange={(e) => setBankCustomNote(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-stone-700 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Direct Send button synced with current state configuration */}
            <button
              onClick={handleQuickDispatchCoords}
              className="w-full py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white text-[10.5px] font-black uppercase rounded-lg shadow-2xs hover:shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Send Custom Coordinates</span>
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
