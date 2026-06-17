import React, { useState, useEffect, useRef } from "react";
import { useAuth, UserProfile } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  getDoc, 
  addDoc,
  orderBy 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  createAuditLog 
} from "../services/auditLogService";
import { 
  getPaymentSettings, 
  updatePaymentSettings, 
  PaymentSettings 
} from "../services/paymentSettingsService";
import { 
  sendChatMessage, 
  updateRoomStatusInDb, 
  assignVolunteerToRoom, 
  addInternalNoteToRoom,
  ChatRoom,
  ChatMessage,
  DonationIntent
} from "../services/chatService";
import { 
  getAllUsers, 
  updateUserRoleInDb, 
  updateUserStatusInDb 
} from "../services/authService";
import { 
  MessageSquare, Users, Shield, Landmark, ClipboardList, CheckCircle2, 
  XCircle, Clock, Send, LogOut, FileCheck, Search, HelpCircle, Save, UserCheck, ShieldAlert,
  Sparkles, Cpu, Check, Flame, BookOpen, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function VolunteerPortal() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // Active sub-sections for Admin/Super_admin
  const [activeTab, setActiveTab] = useState<"chats" | "users" | "settings" | "audit">("chats");

  // Real-time collections state
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeIntent, setActiveIntent] = useState<DonationIntent | null>(null);
  
  // Backoffice states
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Input states
  const [inputMessage, setInputMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");

  // Verification Form states
  const [verifiedAmount, setVerifiedAmount] = useState<string>("");
  const [verificationRef, setVerificationRef] = useState<string>("");
  const [verificationNotes, setVerificationNotes] = useState<string>("");

  // Super Admin Management states
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserProfile["role"]>("volunteer");
  const [editStatus, setEditStatus] = useState<UserProfile["status"]>("active");

  const [settingsForm, setSettingsForm] = useState<Partial<PaymentSettings>>({});

  const [showEditBankPanel, setShowEditBankPanel] = useState(false);
  const [bankEditAccountHolder, setBankEditAccountHolder] = useState("");
  const [bankEditBankName, setBankEditBankName] = useState("");
  const [bankEditAccountNumberMasked, setBankEditAccountNumberMasked] = useState("");
  const [bankEditIfsc, setBankEditIfsc] = useState("");
  const [bankEditUpiId, setBankEditUpiId] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI draft states & smart helper values
  const [showAiDraftPanel, setShowAiDraftPanel] = useState(false);
  const [aiDraftTone, setAiDraftTone] = useState("welcome");
  const [generatedAiReply, setGeneratedAiReply] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Redirect if not registered in Auth sync
  useEffect(() => {
    if (!profile || profile.role === "donor" || profile.status !== "active") {
      navigate("/");
    }
  }, [profile, navigate]);

  // Retrieve basic initial super_admin setups
  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getPaymentSettings();
      if (data) {
        setPaymentDetails(data);
        setSettingsForm(data);
        setBankEditAccountHolder(data.accountHolder || "Bait Al-Rahma Trust");
        setBankEditBankName(data.bankName || "State Bank of India (SBI)");
        setBankEditAccountNumberMasked(data.accountNumberMasked || "XXXX-XXXX-9024");
        setBankEditIfsc(data.ifsc || "SBIN0004928");
        setBankEditUpiId(data.upiId || "bait.alrahma@sbi");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (paymentDetails) {
      setBankEditAccountHolder(paymentDetails.accountHolder || "");
      setBankEditBankName(paymentDetails.bankName || "");
      setBankEditAccountNumberMasked(paymentDetails.accountNumberMasked || "");
      setBankEditIfsc(paymentDetails.ifsc || "");
      setBankEditUpiId(paymentDetails.upiId || "");
    }
  }, [paymentDetails]);

  // --- Real-time listener: Support Chat Rooms ---
  useEffect(() => {
    if (!profile) return;

    const roomsRef = collection(db, "chatRooms");
    // Standard query for standard volunteers: fetch assigned or unclaimed rooms.
    // Finance / Admin / Super_admin can track everything.
    const q = profile.role === "volunteer" 
      ? query(roomsRef, where("assignedTo", "in", ["", profile.uid]))
      : query(roomsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedRooms: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        parsedRooms.push(doc.data() as ChatRoom);
      });
      // Sort rooms by last message timestamp descending
      parsedRooms.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setRooms(parsedRooms);

      // Auto-focus on first room if none selected
      if (parsedRooms.length > 0 && !activeRoomId) {
        setActiveRoomId(parsedRooms[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chatRooms");
    });

    return () => unsubscribe();
  }, [profile, activeRoomId]);

  // --- Real-time listener: Messages and Intent Details ---
  useEffect(() => {
    if (!activeRoomId) return;

    const selected = rooms.find(r => r.id === activeRoomId) || null;
    setActiveRoom(selected);
    if (selected) {
      setInternalNote(selected.internalNotes || "");
    }

    // Fetch matching DonationIntent associated values
    if (selected) {
      const intentRef = doc(db, "donationIntents", selected.donationIntentId);
      const unsubscribeIntent = onSnapshot(intentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as DonationIntent;
          setActiveIntent(data);
          setVerifiedAmount(data.amount.toString());
          if (data.transactionReference) {
            setVerificationRef(data.transactionReference);
          }
        }
      });

      // Fetch active message thread
      const messagesRef = collection(db, "chatMessages");
      const q = query(messagesRef, where("roomId", "==", activeRoomId));
      
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const parsedMsgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          parsedMsgs.push(doc.data() as ChatMessage);
        });
        // Sort chronologically ascending
        parsedMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(parsedMsgs);
        
        // AutoScroll to bottom of active conversation panel
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });

      return () => {
        unsubscribeIntent();
        unsubscribeMessages();
      };
    }
  }, [activeRoomId, rooms]);

  // --- Listener: Users and Audit Logs ---
  useEffect(() => {
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) return;

    const loadAdminDetails = async () => {
      const users = await getAllUsers();
      setAllUsers(users);
    };
    loadAdminDetails();

    // Listen to audit logs
    const logsRef = collection(db, "auditLogs");
    const q = query(logsRef, orderBy("createdAt", "desc"));
    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const logsList: any[] = [];
      snapshot.forEach((doc) => {
        logsList.push(doc.data());
      });
      setAuditLogs(logsList);
    });

    return () => unsubscribeLogs();
  }, [profile, activeTab]);

  const handleLogout = async () => {
    if (profile) {
      await createAuditLog(profile.uid, profile.role, "LOG_OUT", "User", profile.uid, { email: profile.email });
    }
    await logout();
    navigate("/volunteer-login");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !profile || !activeRoomId) return;

    await sendChatMessage(
      activeRoomId,
      profile.uid,
      profile.role,
      profile.name,
      inputMessage,
      "text"
    );
    setInputMessage("");
  };

  const claimActiveChat = async () => {
    if (!profile || !activeRoom || !activeIntent) return;
    await assignVolunteerToRoom(activeRoom.id, activeIntent.id, profile.uid, profile.name);
    await createAuditLog(profile.uid, profile.role, "CHAT_ASSIGNMENT", "chatRooms", activeRoom.id, {
      donorUid: activeRoom.donorUid,
      assignedTo: profile.uid
    });
  };

  const saveRoomInternalNote = async () => {
    if (!activeRoom || !profile) return;
    await addInternalNoteToRoom(activeRoom.id, internalNote);
    alert("Internal back office notes saved.");
  };

  // Modify entire status timeline steps
  const changeActiveStatus = async (status: DonationIntent["status"]) => {
    if (!activeRoom || !activeIntent || !profile) return;
    await updateRoomStatusInDb(activeRoom.id, activeIntent.id, status);
    await createAuditLog(profile.uid, profile.role, "STATUS_CHANGE", "donationIntents", activeIntent.id, {
      newStatus: status
    });
  };

  // Dispatch predefined templates
  const dispatchTemplateMessage = async (templateType: string, customText: string) => {
    if (!activeRoomId || !profile) return;
    await sendChatMessage(
      activeRoomId,
      profile.uid,
      profile.role,
      profile.name,
      customText,
      "template"
    );
  };

  const dispatchOfficialPaymentDetails = async () => {
    if (!activeRoomId || !profile || !paymentDetails) return;
    if (!paymentDetails.isActive) {
      alert("Payment routes are currently deactivated. Activate them as Super Admin.");
      return;
    }

    const templateText = `🏦 OFFICIAL DIRECT NGO WIRE CHANNELS 🏦

Account Name: ${paymentDetails.accountHolder}
Beneficiary Bank: ${paymentDetails.bankName}
Account Number (Masked): ${paymentDetails.accountNumberMasked}
IFSC Code: ${paymentDetails.ifsc}
UPI ID: ${paymentDetails.upiId}

⚠️ STRICT SAFE NOTE:
Bait Al-Rahma Trust never asks you to transfer donations to personal or unverified accounts. Transfer only to the official coordinates shown inside this verified support desk. Once completed, share the screenshot and reference key in this window.`;

    await sendChatMessage(
      activeRoomId,
      profile.uid,
      profile.role,
      profile.name,
      templateText,
      "template"
    );

    await createAuditLog(profile.uid, profile.role, "PAYMENT_DETAILS_SHARED", "chatRooms", activeRoomId, {
      donorUid: activeRoom?.donorUid
    });
  };

  const handleSaveAndSendCoordinates = async () => {
    if (!activeRoomId || !profile) return;

    const updatedSettings: Partial<PaymentSettings> = {
      accountHolder: bankEditAccountHolder,
      bankName: bankEditBankName,
      accountNumberMasked: bankEditAccountNumberMasked,
      ifsc: bankEditIfsc,
      upiId: bankEditUpiId,
      isActive: true
    };

    // Save globally so it updates for all chat sessions
    await updatePaymentSettings(updatedSettings, profile.uid);

    // Update local state so other widgets (e.g. settings list) refresh instantly
    const finalSettings = {
      ...paymentDetails,
      ...updatedSettings
    } as PaymentSettings;

    setPaymentDetails(finalSettings);
    setSettingsForm(finalSettings);

    await createAuditLog(profile.uid, profile.role, "PAYMENT_SETTINGS_CHANGED", "paymentSettings", "default", updatedSettings);

    const templateText = `🏦 OFFICIAL DIRECT NGO WIRE CHANNELS 🏦

Account Name: ${updatedSettings.accountHolder}
Beneficiary Bank: ${updatedSettings.bankName}
Account Number (Masked): ${updatedSettings.accountNumberMasked}
IFSC Code: ${updatedSettings.ifsc}
UPI ID: ${updatedSettings.upiId}

⚠️ STRICT SAFE NOTE:
Bait Al-Rahma Trust never asks you to transfer donations to personal or unverified accounts. Transfer only to the official coordinates shown inside this verified support desk. Once completed, share the screenshot and reference key in this window.`;

    await sendChatMessage(
      activeRoomId,
      profile.uid,
      profile.role,
      profile.name,
      templateText,
      "template"
    );

    await createAuditLog(profile.uid, profile.role, "PAYMENT_DETAILS_SHARED", "chatRooms", activeRoomId, {
      donorUid: activeRoom?.donorUid
    });

    setShowEditBankPanel(false);
  };

  // Finance/Admin/Super Admin payment proof verification
  const handleVerifyProof = async (status: "valid" | "invalid") => {
    if (!activeIntent || !profile || !activeRoomId) return;

    try {
      const intentRef = doc(db, "donationIntents", activeIntent.id);
      const now = new Date().toISOString();

      if (status === "valid" && !verifiedAmount) {
        alert("Please specify the verified amount before verifying this contribution.");
        return;
      }

      const receiptId = `BART-REC-${Math.floor(100000 + Math.random() * 900000)}`;

      await updateDoc(intentRef, {
        status: status === "valid" ? "Verified" : "Closed",
        verifiedAmount: status === "valid" ? Number(verifiedAmount) : 0,
        transactionReference: verificationRef,
        receiptId: status === "valid" ? receiptId : "",
        updatedAt: now
      });

      // Save as independent document in receipts collection
      if (status === "valid") {
        const receiptRef = doc(collection(db, "receipts"));
        await setDoc(receiptRef, {
          id: receiptRef.id,
          receiptNumber: receiptId,
          donationIntentId: activeIntent.id,
          donorName: activeIntent.donorName,
          amount: Number(verifiedAmount),
          cause: activeIntent.cause,
          transactionReference: verificationRef,
          verifiedAt: now,
          generatedBy: profile.uid,
          createdAt: now
        });
      }

      await updateRoomStatusInDb(activeRoomId, activeIntent.id, status === "valid" ? "Verified" : "Closed");

      // Notify in chat thread
      const auditMsg = status === "valid" 
        ? `✅ CONTRIBUTION COMPLETED AND VERIFIED ✅

We have successfully cross-verified your remittance file of ₹${Number(verifiedAmount).toLocaleString()} for: "${activeIntent.cause}". 
Verification Notes: ${verificationNotes || "Cleared by financial desk"}
Your receipt reference key is: ${receiptId}. You can download the generated clearance document instantly from your personal donor window.`
        : `❌ SUBMITTED PROOF CANNOT BE VERIFIED ❌

Our accounting division was unable to locate the specified transfer within our banking logs. Please double-check your receipt file.
Audit Note: ${verificationNotes || "No matching logs found"}`;

      await sendChatMessage(
        activeRoomId,
        "system",
        "system",
        "Bait Al-Rahma Accounts Desk",
        auditMsg,
        "system"
      );

      await createAuditLog(profile.uid, profile.role, "DONATION_VERIFIED", "donationIntents", activeIntent.id, {
        verificationStatus: status,
        verifiedAmount: Number(verifiedAmount),
        receiptId
      });

      alert("Remittance review updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Execution error occurred during verification.");
    }
  };

  // User Management
  const submitUserModification = async () => {
    if (!selectedUserToEdit || !profile) return;
    await updateUserRoleInDb(selectedUserToEdit.uid, editRole);
    await updateUserStatusInDb(selectedUserToEdit.uid, editStatus);
    await createAuditLog(profile.uid, profile.role, "USER_ROLE_CHANGED", "users", selectedUserToEdit.uid, {
      newRole: editRole,
      newStatus: editStatus
    });

    // Refresh user listing
    const users = await getAllUsers();
    setAllUsers(users);
    setSelectedUserToEdit(null);
    alert("Staff authorization parameters updated.");
  };

  // Settings modification
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== "super_admin") {
      alert("Operation rejected. Only Super Admin carries settings edit permission.");
      return;
    }

    await updatePaymentSettings(settingsForm, profile.uid);
    setPaymentDetails(settingsForm as PaymentSettings);
    await createAuditLog(profile.uid, profile.role, "PAYMENT_SETTINGS_CHANGED", "paymentSettings", "default", settingsForm);
    alert("Official payment routes stored securely.");
  };

  const generateAiSmartDraft = () => {
    if (!activeIntent) return;
    setIsGeneratingAi(true);
    
    // High-fidelity automated template composer matching campaign context
    setTimeout(() => {
      let draftText = "";
      const donorName = activeIntent.donorName || "Honored Donor";
      const cause = activeIntent.cause || "our general emergency campaigns";
      const amount = activeIntent.amount ? `₹${activeIntent.amount.toLocaleString()}` : "your specified amount";
      
      switch (aiDraftTone) {
        case "welcome":
          draftText = `Assalamu Alaikum ${donorName},\n\nWe have received your intention to support "${cause}" with a contribution of ${amount}. Our team is ready to assist you. \n\nWould you like us to share our official banking credentials so you can execute the direct bank transfer securely? \n\nWith gratitude,\n${profile?.name || "Bait Al-Rahma Volunteer"}`;
          break;
        case "requestProof":
          draftText = `Dear ${donorName},\n\nThank you for initiating your bank transfer of ${amount} towards: "${cause}". \n\nTo lock this in and issue your official tax exemption receipt, could you kindly upload a screenshot of your transfer advice or share the transaction ID in this secure chat channel? Our accounts desk will cross-verify it instantly.\n\nWarm regards,\n${profile?.name || "Bait Al-Rahma Coordinator"}`;
          break;
        case "bankDetails":
          draftText = `🏦 OFFICIAL DIRECT NGO REMITTANCE COORDINATES 🏦\n\nAccount Name: Bait Al-Rahma Trust\nBeneficiary Bank: STATE BANK OF INDIA\nAccount Number: ****102439\nIFSC Code: SBIN0004928\nUPI ID: bait.alrahma@sbi\n\n⚠️ IMPORTANT: Please ensure the remitted funds match exactly ${amount} for "${cause}". Avoid any third-party links or unverified portals. Post the screenshot here once complete so we can clear your receipts.\n\nThank you,\n${profile?.name || "Accounts Division"}`;
          break;
        case "verifiedReceipt":
          draftText = `✅ RECIPIENT REMITTANCE CLEARED & AUDITED ✅\n\nDear ${donorName},\n\nOur financial desk has successfully verified the remittance of ${amount} for "${cause}". \n\nYour Sec 80G Tax Exemption Receipt (Doc Ref: BART-REC-${Math.floor(100000 + Math.random() * 900000)}) has been generated and pushed to your personal dashboard window. \n\nThank you for standing in solidarity with those in need. May you be richly rewarded.\n\nWarm respect,\nBait Al-Rahma Trust`;
          break;
        default:
          draftText = "Select an AI responder preset to auto-compose.";
      }
      setGeneratedAiReply(draftText);
      setIsGeneratingAi(false);
    }, 500);
  };

  // Filtering Rooms
  const filteredRooms = rooms.filter(room => {
    const visitorName = room.visitorName || "";
    const isMatchedQuery = visitorName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
                           (room.id && room.id.toLowerCase().includes((searchQuery || "").toLowerCase())) ||
                           (room.donationIntentId && room.donationIntentId.toLowerCase().includes((searchQuery || "").toLowerCase()));
    
    if (statusFilter === "All") return isMatchedQuery;
    return isMatchedQuery && room.status === statusFilter;
  });

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen flex flex-col font-sans">
      
      {/* Upper Navigation Rail */}
      <header className="bg-white border-b border-slate-205 py-3 px-4 md:px-6 shadow-2xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-50 rounded-xl border border-orange-100 text-[#EA580C] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans font-black text-sm tracking-tight text-[#0F172A] block uppercase">
                Volunteer Portal
              </span>
              <p className="text-[10px] text-neutral-400 font-sans tracking-wider uppercase font-bold mt-0.5">
                Bait Al-Rahma Support Console
              </p>
            </div>
          </div>

          {/* SIMPLIFIED ADMINISTRATIVE TAB SELECTOR: TIGHT & COMPACT IN THE HEADER */}
          {(profile?.role === "admin" || profile?.role === "super_admin") && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "chats", label: "Chats", icon: MessageSquare },
                { id: "users", label: "Staff", icon: Users },
                { id: "settings", label: "Settings", icon: Landmark },
                { id: "audit", label: "Audit", icon: ClipboardList }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer ${
                      isSelected 
                        ? "bg-[#EA580C] text-white shadow-xs" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 hidden sm:inline" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-900 block">{profile?.name}</span>
              <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">{profile?.role}</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black uppercase tracking-wide px-3 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 my-0 border-x border-slate-100 bg-white">
        
        {/* Dynamic Inner Panel View Router */}
        <div className="flex-1 overflow-hidden min-h-[calc(100vh-65px)] col-span-12 grid grid-cols-1 lg:grid-cols-12">
          
          <AnimatePresence mode="wait">
            
            {/* View A: CHAT WORKSPACE CONSOLE */}
            {activeTab === "chats" && (
              <>
                {/* 1. Chat list sidebar */}
                <div className="col-span-12 lg:col-span-4 border-r border-slate-200 flex flex-col h-full overflow-y-auto">
                  
                  {/* Sidebar Filters */}
                  <div className="p-4 border-b border-slate-150 space-y-3 bg-[#F8FAFC]">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search donor or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg bg-white font-sans"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {["All", "New", "In Chat", "Proof Received", "Verified", "Closed"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setStatusFilter(tag)}
                          className={`text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-md cursor-pointer transition ${
                            statusFilter === tag ? "bg-slate-800 text-white" : "bg-slate-200 hover:bg-slate-250 text-slate-700"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rooms stream container */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredRooms.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400 font-sans">
                        No active support rooms found matching your filter criteria.
                      </div>
                    ) : (
                      filteredRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setActiveRoomId(room.id)}
                          className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer border-b border-slate-100 ${
                            activeRoomId === room.id ? "bg-orange-50/40 border-l-4 border-l-[#EA580C]" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 border border-slate-200 capitalize">
                            {room.donorUid.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#0F172A] truncate block">Donor Context Match</span>
                              <span className="text-[10px] text-neutral-400 font-sans">{new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 truncate font-sans mt-0.5 mt-1">
                              {room.lastMessage}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                                room.status === "New" ? "bg-blue-100 text-blue-800" :
                                room.status === "Verified" ? "bg-green-100 text-green-800" :
                                room.status === "Proof Received" ? "bg-amber-100 text-[#EA580C]" : "bg-slate-250 text-slate-700"
                              }`}>
                                {room.status}
                              </span>
                              {room.assignedTo ? (
                                <span className="text-[9px] text-neutral-400 font-sans font-medium">Assigned</span>
                              ) : (
                                <span className="text-[9px] text-red-500 font-sans font-bold">Unclaimed</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Middle live thread workspace */}
                <div className="col-span-12 lg:col-span-5 border-r border-slate-200 flex flex-col h-full bg-[#F8FAFC]">
                  {activeRoom ? (
                    <>
                      {/* Active header bar */}
                      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#EA580C] font-black tracking-widest uppercase block">Active Coordination Match</span>
                          <span className="text-xs font-bold text-[#0F172A] mt-0.5 block truncate">ID Reference: {activeRoom.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9.5px] font-bold text-emerald-600 font-mono">STANDBY CONNECTION</span>
                        </div>
                      </div>

                      {/* Messages frame */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => {
                          const isSystem = msg.senderUid === "system";
                          const isMe = msg.senderUid === profile?.uid;

                          if (isSystem) {
                            return (
                              <div key={msg.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed font-sans text-center">
                                <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-400 block mb-1">SYSTEM UPDATE</span>
                                {msg.text}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={msg.id || index}
                              className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                            >
                              <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider block mb-1">
                                {msg.senderName} ({msg.senderRole})
                              </span>
                              
                              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                                isMe 
                                  ? "bg-[#EA580C] text-white rounded-br-none" 
                                  : "bg-white border border-slate-205 text-[#0F172A] rounded-bl-none shadow-3xs"
                              }`}>
                                <p className="whitespace-pre-line">{msg.text}</p>
                                
                                {/* Uploaded proof attachment rendering */}
                                {msg.fileUrl && (
                                  <div className="mt-3 bg-[#F8FAFC]/90 p-2.5 rounded-xl border border-slate-300 flex items-center gap-2.5 text-slate-800">
                                    <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center shrink-0">
                                      <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[10px] font-bold truncate block">{msg.fileName || "deposit_proof.jpg"}</span>
                                      <span className="text-[8.5px] text-neutral-400 font-sans block uppercase mt-0.5">SIZE: {msg.fileSize || "Shared Remittance File"}</span>
                                    </div>
                                    <a
                                      href={msg.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="bg-slate-200 hover:bg-slate-300 shrink-0 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg text-slate-800 cursor-pointer"
                                    >
                                      Open File
                                    </a>
                                  </div>
                                )}
                              </div>
                              <span className="text-[8.5px] text-neutral-400 font-sans mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Bait Al-Rahma AI Co-Pilot / Smart Drafting Assistant */}
                      <div className="bg-slate-50 border-t border-slate-200">
                        <div className="p-3 flex items-center justify-between bg-white px-4">
                          <button
                            type="button"
                            onClick={() => setShowAiDraftPanel(!showAiDraftPanel)}
                            className="flex items-center gap-2 text-xs font-black uppercase text-[#EA580C] hover:text-[#c2410c] tracking-wider transition cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-orange-500 fill-current animate-bounce" />
                            <span>🤖 Compose with AI Smart-Response Co-Pilot</span>
                          </button>
                          
                          <span className="text-[9px] bg-sky-100 border border-sky-200 text-sky-700 px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wider">
                            ACTIVE
                          </span>
                        </div>

                        {showAiDraftPanel && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 px-4 border-t border-slate-100 bg-[#F8FAFC] space-y-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-neutral-500 font-extrabold uppercase font-sans">Reply Intent Strategy:</span>
                              <div className="flex gap-1 flex-wrap">
                                {[
                                  { key: "welcome", label: "Warm Welcome" },
                                  { key: "requestProof", label: "Ask for Proof" },
                                  { key: "bankDetails", label: "Bank Coordinates" },
                                  { key: "verifiedReceipt", label: "Verification Success" }
                                ].map((tone) => (
                                  <button
                                    key={tone.key}
                                    type="button"
                                    onClick={() => setAiDraftTone(tone.key)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase cursor-pointer border ${
                                      aiDraftTone === tone.key 
                                        ? "bg-orange-600 text-white border-orange-600" 
                                        : "bg-white text-slate-600 border-slate-205 hover:bg-slate-100"
                                    }`}
                                  >
                                    {tone.label}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={generateAiSmartDraft}
                                disabled={isGeneratingAi}
                                className="ml-auto bg-slate-900 hover:bg-slate-950 text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm font-sans"
                              >
                                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                                <span>{isGeneratingAi ? "Thinking..." : "Generate AI Draft"}</span>
                              </button>
                            </div>

                            {generatedAiReply && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 shadow-inner"
                              >
                                <p className="text-[11px] font-sans text-slate-700 whitespace-pre-line leading-relaxed italic">{generatedAiReply}</p>
                                <div className="flex gap-2 justify-end pt-1 font-sans">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGeneratedAiReply("");
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                                  >
                                    Dismiss Draft
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInputMessage(generatedAiReply);
                                      setShowAiDraftPanel(false);
                                    }}
                                    className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5 text-orange-200" />
                                    <span>Sync with Editor Input</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* INLINE EDITABLE BANK WIRE CHANNELS PANEL */}
                      <AnimatePresence>
                        {showEditBankPanel && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-orange-200 bg-amber-50/50 p-4 space-y-3 font-sans shrink-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest flex items-center gap-1">
                                <Landmark className="w-4 h-4 text-[#EA580C]" />
                                <span>🏦 edit official wire credentials before dispatch</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowEditBankPanel(false)}
                                className="text-[9px] text-slate-500 hover:text-slate-900 font-extrabold uppercase bg-slate-100 px-2 py-1 rounded"
                              >
                                Minimize
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">Account Name / Holder</label>
                                <input
                                  type="text"
                                  value={bankEditAccountHolder}
                                  onChange={(e) => setBankEditAccountHolder(e.target.value)}
                                  className="w-full border border-slate-250 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">Beneficiary Bank</label>
                                <input
                                  type="text"
                                  value={bankEditBankName}
                                  onChange={(e) => setBankEditBankName(e.target.value)}
                                  className="w-full border border-slate-250 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">Account Number (Masked)</label>
                                <input
                                  type="text"
                                  value={bankEditAccountNumberMasked}
                                  onChange={(e) => setBankEditAccountNumberMasked(e.target.value)}
                                  className="w-full border border-slate-250 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">IFSC Code</label>
                                  <input
                                    type="text"
                                    value={bankEditIfsc}
                                    onChange={(e) => setBankEditIfsc(e.target.value)}
                                    className="w-full border border-slate-250 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-black uppercase text-slate-500 tracking-wider mb-1">UPI ID</label>
                                  <input
                                    type="text"
                                    value={bankEditUpiId}
                                    onChange={(e) => setBankEditUpiId(e.target.value)}
                                    className="w-full border border-slate-250 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-sans"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={dispatchOfficialPaymentDetails}
                                className="bg-slate-105 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer"
                                title="Send the currently saved settings copy"
                              >
                                Send Saved Copy
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveAndSendCoordinates}
                                className="bg-[#EA580C] hover:bg-[#c2410c] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Save & Dispatch Live</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* QUICK REPLY TEMPLATES RAIL */}
                      <div className="p-2 border-t border-slate-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
                        <button
                          onClick={() => dispatchTemplateMessage("Welcome", "Welcome to Bait Al-Rahma Trust. Thank you for supporting our humanitarian relief efforts. Please confirm the cause and amount you wish to support, and our support desk will guide you.")}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9.5px] font-sans font-bold text-slate-700 text-center truncate cursor-pointer"
                          title="Send Welcome Statement"
                        >
                          Welcome
                        </button>
                        <button
                          onClick={() => dispatchTemplateMessage("Confirm", "Thank you under our noble relief campaign. Please verify the amount specified in your intention, so we can record your commitment correctly.")}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9.5px] font-sans font-bold text-slate-700 text-center truncate cursor-pointer"
                          title="Confirm commitment details"
                        >
                          Confirm Cause
                        </button>
                        <button
                          onClick={() => {
                            if (paymentDetails) {
                              setBankEditAccountHolder(paymentDetails.accountHolder);
                              setBankEditBankName(paymentDetails.bankName);
                              setBankEditAccountNumberMasked(paymentDetails.accountNumberMasked);
                              setBankEditIfsc(paymentDetails.ifsc);
                              setBankEditUpiId(paymentDetails.upiId);
                            }
                            setShowEditBankPanel(!showEditBankPanel);
                          }}
                          className={`px-2.5 py-1.5 rounded text-[9.5px] font-sans font-black uppercase text-center truncate cursor-pointer flex items-center justify-center gap-1 border transition ${
                            showEditBankPanel 
                              ? "bg-orange-600 text-white border-orange-600" 
                              : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-[#EA580C]"
                          }`}
                          title="Share / Edit Official Bank Details First"
                        >
                          <Landmark className="w-3.5 h-3.5" />
                          <span>{showEditBankPanel ? "Hide Bank Panel" : "Prep Bank Details"}</span>
                        </button>
                        <button
                          onClick={() => dispatchTemplateMessage("RequestProof", "Thank you. Please upload the transaction screenshot or reference ID so our accounts divisoin can verify the wire transfer and release your Sec 80G tax clearance receipt.")}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9.5px] font-sans font-bold text-slate-700 text-center truncate cursor-pointer"
                          title="Ask for transaction screenshot"
                        >
                          Request Proof
                        </button>
                      </div>

                      {/* Message input footer */}
                      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                        <input
                          type="text"
                          placeholder="Type response back to donor..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-xs font-sans outline-none focus:ring-1 focus:ring-[#EA580C] focus:border-[#EA580C]"
                        />
                        <button
                          type="submit"
                          className="bg-[#EA580C] hover:bg-[#c2410c] text-white p-3 rounded-xl transition cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 font-sans">
                      <MessageSquare className="w-12 h-12 text-neutral-300 mb-2.5 animate-bounce" />
                      <span>Welcome back to the back office. Select a chat from the left column to begin support.</span>
                    </div>
                  )}
                </div>

                {/* 3. Right panel of donor details */}
                <div className="col-span-12 lg:col-span-3 h-full overflow-y-auto p-4 space-y-6">
                  {activeRoom && activeIntent ? (
                    <>
                      {/* DYNAMIC PROGRESS ROADMAP CHECKLIST */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">Audit Milestone Tracker</span>
                        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-[22px] space-y-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-10 w-10 bg-orange-600/10 rounded-full blur-xl pointer-events-none" />
                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">Verification Path</span>
                            <span className="text-[9px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                              {activeIntent.status}
                            </span>
                          </div>

                          <div className="space-y-3.5 font-sans relative">
                            {/* Roadmap steps */}
                            {[
                              { label: "1. REGISTER INTENDED AID", statuses: ["New", "In Chat", "Payment Details Shared", "Proof Received", "Under Verification", "Verified", "Closed"] },
                              { label: "2. MATCH ACTIVE OPERATOR", statuses: ["In Chat", "Payment Details Shared", "Proof Received", "Under Verification", "Verified", "Closed"] },
                              { label: "3. COORDINATES SHARED", statuses: ["Payment Details Shared", "Proof Received", "Under Verification", "Verified", "Closed"] },
                              { label: "4. REMITTANCE PROOF SUBMITTED", statuses: ["Proof Received", "Under Verification", "Verified", "Closed"] },
                              { label: "5. CLEARED & TAX RECEIPT OUT", statuses: ["Verified"] }
                            ].map((step, idx) => {
                              const isCompleted = step.statuses.includes(activeIntent.status);
                              const isCurrent = (activeIntent.status === "New" && idx === 0) ||
                                                (activeIntent.status === "In Chat" && idx === 1) ||
                                                (activeIntent.status === "Payment Details Shared" && idx === 2) ||
                                                (activeIntent.status === "Proof Received" && idx === 3) ||
                                                (activeIntent.status === "Under Verification" && idx === 3) ||
                                                (activeIntent.status === "Verified" && idx === 4);

                              return (
                                <div key={idx} className="flex items-center gap-3 relative" id={`roadmap_step_${idx}`}>
                                  <div className="relative shrink-0 z-10 flex items-center justify-center">
                                    {isCompleted ? (
                                      <div className="w-5 h-5 rounded-full bg-emerald-500 border border-emerald-400 text-slate-900 flex items-center justify-center shadow-emerald-500/20 shadow">
                                        <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                                      </div>
                                    ) : isCurrent ? (
                                      <div className="w-5 h-5 rounded-full bg-amber-500 border border-amber-400 text-slate-900 flex items-center justify-center animate-pulse shadow-amber-500/35 shadow">
                                        <Activity className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-[9px] font-mono">
                                        {idx + 1}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wide block ${
                                      isCompleted ? "text-slate-100" : isCurrent ? "text-amber-400" : "text-slate-500"
                                    }`}>
                                      {step.label}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[8px] text-amber-300 font-bold uppercase block tracking-widest mt-0.5 animate-pulse">
                                        ● CURRENT TARGET STEP
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Section A: Donor Profile details */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">Donor Particulars</span>
                        
                        <div className="bg-slate-50 p-4 border border-slate-205 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Donor Name:</span>
                            <span className="text-xs font-bold text-slate-900">{activeIntent.donorName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Contact Phone:</span>
                            <span className="text-xs font-bold text-slate-900">{activeIntent.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Safe Email:</span>
                            <span className="text-xs font-bold text-slate-900">{activeIntent.email || "Unspecified"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Origin Country:</span>
                            <span className="text-xs font-bold text-slate-900">{activeIntent.country}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Selected Cause:</span>
                            <span className="text-xs font-bold text-slate-900 truncate">{activeIntent.cause}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Sponsor Vol:</span>
                            <span className="text-xs font-bold text-slate-900">₹{activeIntent.amount.toLocaleString()}</span>
                          </div>
                          {activeIntent.message && (
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider block">Donor Note:</span>
                              <p className="text-[10.5px] text-neutral-600 font-sans mt-0.5 whitespace-pre-line leading-relaxed">{activeIntent.message}</p>
                            </div>
                          )}
                        </div>

                        {/* Room Assignment Management */}
                        {!activeRoom.assignedTo ? (
                          <button
                            onClick={claimActiveChat}
                            className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white py-3 border border-transparent text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                          >
                            <UserCheck className="w-4 h-4 text-orange-200" />
                            <span>Claim This Chat</span>
                          </button>
                        ) : (
                          <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center text-xs text-green-700 font-sans font-medium">
                            ✓ Handled by Assigned Staff Representative
                          </div>
                        )}
                      </div>

                      {/* Section B: Status management dropdown */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">Process Timeline Status</span>
                        <div className="bg-slate-50 p-3 border border-slate-200 rounded-2xl flex items-center justify-between">
                          <span className="text-xs font-sans text-neutral-500 font-medium">Global Step:</span>
                          <select
                            value={activeIntent.status}
                            onChange={(e) => changeActiveStatus(e.target.value as any)}
                            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs select-none focus:outline-none"
                          >
                            {["New", "In Chat", "Payment Details Shared", "Proof Received", "Under Verification", "Verified", "Closed"].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Section C: Internal Operations notes */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">Internal Operator Logs</span>
                        <div className="bg-slate-50 p-4 border border-slate-205 rounded-2xl space-y-2">
                          <textarea
                            value={internalNote}
                            onChange={(e) => profile?.role === "admin" || profile?.role === "super_admin" ? setInternalNote(e.target.value) : null}
                            disabled={profile?.role !== "admin" && profile?.role !== "super_admin"}
                            placeholder="Type backoffice internal notes here... (Visible only to authorized operators)"
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-sans placeholder-neutral-400 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                          />
                          {(profile?.role === "admin" || profile?.role === "super_admin") && (
                            <button
                              onClick={saveRoomInternalNote}
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10.5px] font-black uppercase py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5 text-neutral-300" />
                              <span>Store Notes</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Section D: Direct Payment Verification (Finance / Admin / Super_admin only) */}
                      {(profile?.role === "finance" || profile?.role === "admin" || profile?.role === "super_admin") && (
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Remittance Verification Panel</span>
                          </span>

                          <div className="bg-white p-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3 shadow-xs">
                            <div>
                              <label className="block text-[9.5px] font-black uppercase text-[#0F172A] tracking-wider mb-1">Verified Amount (INR)</label>
                              <input
                                type="number"
                                value={verifiedAmount}
                                onChange={(e) => setVerifiedAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-sans bg-slate-50 focus:bg-white"
                                placeholder={activeIntent.amount.toString()}
                              />
                            </div>

                            <div>
                              <label className="block text-[9.5px] font-black uppercase text-[#0F172A] tracking-wider mb-1">Receipt Ref / Transaction ID</label>
                              <input
                                type="text"
                                value={verificationRef}
                                onChange={(e) => setVerificationRef(e.target.value)}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-sans bg-slate-50 focus:bg-white"
                                placeholder="e.g. SBI-9042-TX"
                              />
                            </div>

                            <div>
                              <label className="block text-[9.5px] font-black uppercase text-[#0F172A] tracking-wider mb-1">Verification Note</label>
                              <textarea
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-sans bg-slate-50 focus:bg-white min-h-[50px]"
                                placeholder="e.g. Cleared by SBI matching corridors..."
                              />
                            </div>

                            <div className="flex gap-2 pt-1 font-sans font-bold">
                              <button
                                onClick={() => handleVerifyProof("valid")}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase py-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleVerifyProof("invalid")}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase py-2.5 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 shadow-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 text-neutral-400 text-xs font-sans">
                      Select room to review files and donor details.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* View B: USER & VOLUNTEER DIRECTORY SCHEDULATION (Only Admin / Super Admin) */}
            {activeTab === "users" && (
              <div className="col-span-12 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">authorized staff network directory</h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">Control individual access levels, security clearance flags, and promote guest profiles to administrative support roles.</p>
                </div>

                {selectedUserToEdit && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-orange-50 border border-orange-200 rounded-3xl max-w-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#EA580C]">Edit Credentials: {selectedUserToEdit.name}</span>
                      <button onClick={() => setSelectedUserToEdit(null)} className="text-orange-900 font-bold hover:underline cursor-pointer text-xs">Close</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-sans">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Clearance Title Role</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                        >
                          {["donor", "volunteer", "finance", "admin", "super_admin"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Account Active Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={submitUserModification}
                      className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white py-2.5 rounded-xl text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Persist Modifications</span>
                    </button>
                  </motion.div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9.5px]">
                      <tr>
                        <th className="p-4">Name Particulars</th>
                        <th className="p-4">Secure Email</th>
                        <th className="p-4">Authority Level</th>
                        <th className="p-4">Status Flag</th>
                        <th className="p-4">Last Event Tick</th>
                        <th className="p-4 text-center">Action Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {allUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-900">{u.name}</td>
                          <td className="p-4 text-stone-500 font-mono">{u.email}</td>
                          <td className="p-4">
                            <span className="capitalize bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-800">{u.role}</span>
                          </td>
                          <td className="p-4">
                            <span className={`capitalize px-2 py-0.5 rounded font-black tracking-wide text-[9px] ${
                              u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>{u.status}</span>
                          </td>
                          <td className="p-4 text-neutral-400 text-[11px]">{new Date(u.lastLoginAt).toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedUserToEdit(u);
                                setEditRole(u.role);
                                setEditStatus(u.status);
                              }}
                              className="text-xs font-black uppercase text-[#EA580C] hover:underline cursor-pointer"
                            >
                              Edit Authority
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View C: SUPER ADMIN OFFICIAL BANKING SETUP (Only Super Admin) */}
            {activeTab === "settings" && (
              <div className="col-span-12 p-6 max-w-3xl space-y-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">official financial setting portal</h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">Maintain the central official NGO remittance coordinates. Modifications in this quadrant reflect live templates pushed securely inside donor threads.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white border border-slate-205 rounded-3xl p-6 p-8 space-y-6 shadow-xs font-sans">
                  {profile?.role !== "super_admin" && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed">
                      ⚠️ ACCESS LOCK NOTICE:
                      Only users verified under "super_admin" clearance can persist adjustments in official banking credentials. Your current profile level carries read-only view.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">Trust Account Title Holder</label>
                      <input
                        type="text"
                        value={settingsForm.accountHolder || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountHolder: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">Beneficiary Bank Name</label>
                      <input
                        type="text"
                        value={settingsForm.bankName || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">Masked Account Code (Visible during template share)</label>
                      <input
                        type="text"
                        value={settingsForm.accountNumberMasked || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountNumberMasked: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">Secure Account Number (Hidden / Internal)</label>
                      <input
                        type="text"
                        value={settingsForm.accountNumberEncrypted || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountNumberEncrypted: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">IFSC Code / SWIFT Routing Code</label>
                      <input
                        type="text"
                        value={settingsForm.ifsc || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ifsc: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">UPI ID for instant wire Transfers</label>
                      <input
                        type="text"
                        value={settingsForm.upiId || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                        disabled={profile?.role !== "super_admin"}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-sans bg-slate-50 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={settingsForm.isActive || false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, isActive: e.target.checked })}
                      disabled={profile?.role !== "super_admin"}
                      className="rounded text-[#EA580C]"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold text-slate-800 uppercase tracking-wide cursor-pointer select-none">
                      Enable Active Remittance Inflows for this gateway channel
                    </label>
                  </div>

                  {profile?.role === "super_admin" && (
                    <button
                      type="submit"
                      className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer text-center"
                    >
                      Store Official Settings
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* View D: AUDIT HISTORY TIMELINE LOGS (Only Admins) */}
            {activeTab === "audit" && (
              <div className="col-span-12 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Statutory Auditable Logs Registry</h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">Immutable chronologic ledger recording system logins, clearance updates, settings adjustments, and verification outcomes.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9.5px]">
                      <tr>
                        <th className="p-4">Timestamp Event</th>
                        <th className="p-4">Actor UID</th>
                        <th className="p-4">Clearance Role</th>
                        <th className="p-4">Action Label</th>
                        <th className="p-4">Target Type</th>
                        <th className="p-4 font-mono">Payload Metadata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-4 text-stone-500 font-mono text-[10.5px]">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="p-4 font-semibold text-slate-900">{log.actorUid}</td>
                          <td className="p-4">
                            <span className="capitalize bg-slate-200 px-2 py-0.5 rounded font-bold text-[10px] text-slate-800">{log.actorRole}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-extrabold text-[#EA580C]">{log.action}</span>
                          </td>
                          <td className="p-4 capitalize text-stone-500 font-semibold">{log.targetType}</td>
                          <td className="p-4 text-stone-400 font-mono text-[9.5px] truncate max-w-sm" title={JSON.stringify(log.metadata)}>
                            {JSON.stringify(log.metadata)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
