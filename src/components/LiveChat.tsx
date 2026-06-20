import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  sendChatMessage,
  ChatRoom,
  ChatMessage,
  DonationIntent,
  compressImageAndReadAsDataUrl
} from "../services/chatService";
import { 
  Send, Bot, Headphones, User, CheckCircle2, ShieldCheck, 
  Upload, FileText, Image as ImageIcon, Check, Info, Landmark, AlertCircle, X, MessageSquare, Printer, Award, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LiveChatProps {
  roomId: string; // The URL route parameter roomId
  onClose?: () => void;
}

export default function LiveChat({ roomId, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [intent, setIntent] = useState<DonationIntent | null>(null);

  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Real-time messages sync --
  useEffect(() => {
    if (!roomId) return;

    // Listen to messages
    const messagesRef = collection(db, "chatMessages");
    const q = query(messagesRef, where("roomId", "==", roomId));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const parsedMsgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        parsedMsgs.push(doc.data() as ChatMessage);
      });
      // Sort chronologically
      parsedMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(parsedMsgs);

      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chatMessages");
    });

    // Listen to active room
    const roomRef = doc(db, "chatRooms", roomId);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data() as ChatRoom;
        setRoom(roomData);

        // Fetch matched donation intent
        const intentRef = doc(db, "donationIntents", roomData.donationIntentId);
        getDocSnap(intentRef);
      }
    });

    const getDocSnap = (ref: any) => {
      onSnapshot(ref, (snapSnap) => {
        if (snapSnap.exists()) {
          setIntent(snapSnap.data() as DonationIntent);
        }
      });
    };

    return () => {
      unsubscribeMessages();
      unsubscribeRoom();
    };
  }, [roomId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    setUploadError("");
    try {
      setIsUploading(true);

      const { dataUrl, name, sizeStr } = await compressImageAndReadAsDataUrl(file);

      // Determine file kind
      const isImage = file.type.startsWith("image/");

      // Send the file as an attachment in the chatroom
      await sendChatMessage(
        roomId,
        "donor-guest",
        "donor",
        intent?.donorName || "Civilian Donor",
        `📎 Sent Support Document: ${name}`,
        "proof",
        dataUrl,
        name,
        sizeStr
      );

      // Update room and donation status
      const roomRef = doc(db, "chatRooms", roomId);
      const now = new Date().toISOString();
      await updateDoc(roomRef, { status: "Proof Received", updatedAt: now });

      if (intent) {
        const intentRef = doc(db, "donationIntents", intent.id);
        await updateDoc(intentRef, { status: "Proof Received", updatedAt: now });
      }

      await sendChatMessage(
        roomId,
        "system",
        "system",
        "System",
        `Donor uploaded manual giving document: ${name} (${sizeStr}). A volunteer coordinator will audit it shortly.`,
        "system"
      );

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to process the document.");
      alert(err.message || "Failed to process the document.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = inputText.trim();
    if (!messageToSend || !roomId) return;

    // Check if this is the first message sent by the donor in this session
    const donorMsgs = messages.filter(m => m.senderRole === "donor");
    const isFirstDonorMessage = donorMsgs.length === 0;

    await sendChatMessage(
      roomId,
      "donor-guest", // Donor Guest identification
      "donor",
      intent?.donorName || "Civilian Donor",
      messageToSend,
      "text"
    );
    setInputText("");

    if (isFirstDonorMessage) {
      setTimeout(async () => {
        const automatedText = `Thank you so much, ${intent?.donorName || "Supporter"}! We are deeply grateful for your generous invitation to support "${intent?.cause || "our emergency channels"}". 🙏

Direct civilian solidarity makes a world of difference. Your intended contribution of ₹${(intent?.amount || 150).toLocaleString()} can immediately deliver warm meals, safe drinking water, and essential medical aid on the ground.

A dedicated volunteer coordinator is stepping in now. Please stand by for our official direct NGO bank coordinates to finalize your manual transfer securely.`;
        await sendChatMessage(
          roomId,
          "bari-bot",
          "volunteer",
          "Bait Al-Rahma Assistant",
          automatedText,
          "text"
        );
      }, 1000);
    }
  };


  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-[550px] md:h-[620px] overflow-hidden font-sans">
      
      {/* Header bar - No simulation toggle! Pristine & clean */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-[#EA580C] flex items-center justify-center font-black text-sm">
              <Headphones className="w-5 h-5 text-[#EA580C]" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Active Room Session</span>
              <span className="text-[9.5px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">VERIFIED AID GUIDE</span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium font-sans">Connecting with Bait Al-Rahma Volunteer Coordinators</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Target allocation context strip */}
      <div className="bg-slate-50 border-b border-slate-205 py-2.5 px-4 flex items-center justify-between text-[11px] font-sans font-bold text-neutral-500 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="w-4 h-4 text-[#EA580C] shrink-0" />
          <span>Restricted to Allocation: <strong className="text-slate-900 capitalize">{intent?.cause || "Primary Relief"}</strong></span>
        </div>
        <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 shrink-0 ml-2">
          <span>UID:</span>
          <span className="bg-white border rounded px-1 text-slate-800 font-bold">{intent?.id?.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main chat thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, idx) => {
          const isSystem = m.senderUid === "system";
          const isSelf = m.senderUid === "donor-guest";

          if (isSystem) {
            return (
              <div key={m.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl text-[10.5px] leading-relaxed text-neutral-500 text-center font-sans tracking-wide">
                <span className="font-extrabold uppercase text-[8.5px] text-neutral-400 tracking-wider block mb-0.5">TIMELINE SYNC</span>
                {m.text}
              </div>
            );
          }

          return (
            <div
              key={m.id || idx}
              className={`flex flex-col max-w-[85%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider block mb-1">
                {m.senderName}
              </span>

              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                isSelf 
                  ? "bg-[#EA580C] text-white rounded-br-none" 
                  : "bg-white border border-slate-205 text-[#0F172A] rounded-bl-none shadow-3xs"
              }`}>
                
                {/* Visual Official coordinates mapping inside donor bubble */}
                {m.text.includes("🏦 OFFICIAL DIRECT NGO") ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-orange-100 text-[#EA580C] font-bold text-[11px] uppercase tracking-wide">
                      <Landmark className="w-4 h-4" />
                      <span>Official Remittance Coordinates</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-slate-800 font-sans">{m.text}</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                )}

                {/* File/Photo uploaded element */}
                {m.fileUrl && (
                  <div className="mt-3 space-y-2">
                    {/* Render visual image preview for photos/jpg/png and base64 images */}
                    {(m.fileUrl.startsWith("data:image/") || 
                      /\.(jpg|jpeg|png|webp|gif)$/i.test(m.fileName || "")) ? (
                      <div className="relative group max-w-sm rounded-[14px] overflow-hidden border border-slate-200 bg-slate-900 shadow-3xs">
                        <img 
                          src={m.fileUrl} 
                          alt={m.fileName || "Chat Image Attachment"} 
                          className="max-h-56 w-full object-cover group-hover:scale-102 transition duration-200 cursor-zoom-in"
                          onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.write(`
                                <body style="margin:0; background:#0b0f19; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden;">
                                  <img src="${m.fileUrl}" style="max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 10px 40px rgba(0,0,0,0.5); border-radius:8px;" />
                                </body>
                              `);
                            }
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/70 backdrop-blur-md text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-sans">
                          JPEG Preview
                        </div>
                      </div>
                    ) : null}

                    <div className="bg-slate-50 border border-slate-205 p-2.5 rounded-xl flex items-center justify-between gap-3 text-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          {m.fileUrl.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(m.fileName || "") ? (
                            <ImageIcon className="w-4 h-4 text-[#EA580C]" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#EA580C]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold truncate block text-slate-800">{m.fileName}</span>
                          <span className="text-[8.5px] text-neutral-400 font-sans block">{m.fileSize}</span>
                        </div>
                      </div>
                      <a 
                        href={m.fileUrl} 
                        download={m.fileName}
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-orange-50 hover:bg-orange-100 border border-orange-150 text-[#EA580C] text-[9px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-md shrink-0 transition"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

              </div>
              <span className="text-[8.5px] text-neutral-400 font-sans mt-1">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* FINAL INTERACTIVE RECEIPTS FOR VERIFIED DONATIONS */}
      {intent && intent.status === "Verified" && (
        <div className="bg-emerald-50 border-t border-emerald-200 p-4 shrink-0 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse animate-bounce" />
            <span>Remittance clearance complete and verified</span>
          </div>
          <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
            Your support donation has been successfully logged by our finance desk on our public ledger. Your Sec 80G tax clearance certificate reference is: <strong>{intent.receiptId}</strong>.
          </p>

          <div className="bg-white border-2 border-emerald-200 p-4 rounded-xl relative overflow-hidden font-sans shadow-3xs max-w-sm mx-auto">
            <div className="absolute top-1 right-1 text-[8px] font-black uppercase text-emerald-600">80G CERTIFIED</div>
            <div className="text-center space-y-2">
              <Award className="w-7 h-7 text-emerald-600 mx-auto" />
              <div>
                <span className="text-[10px] tracking-wider text-neutral-500 block uppercase font-bold">Supporter Solidarity Certificate</span>
                <span className="text-sm font-black text-slate-900 block font-serif mt-0.5">{intent.donorName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-left bg-slate-50 p-2 rounded border border-slate-100">
                <div>
                  <span className="text-neutral-400 block text-[8px]">AMOUNT:</span>
                  <strong className="text-emerald-700 block font-mono">₹{intent.verifiedAmount?.toLocaleString() || intent.amount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[8px]">RECEIPT ID:</span>
                  <span className="font-mono text-slate-800 block">{intent.receiptId}</span>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Solidarity Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Hidden native input for seamless file/document uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" 
      />

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0 items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
          title="Attach support document or custom photo receipt"
        >
          {isUploading ? (
            <div className="h-4 w-4 rounded-full border-2 border-slate-350 border-t-[#EA580C] animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-[#EA580C]" />
          )}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isUploading ? "Uploading support dossier..." : "Type message to support volunteer advisor..."}
          disabled={isUploading}
          className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-[#EA580C]"
        />

        <button
          type="submit"
          disabled={isUploading}
          className="bg-[#EA580C] hover:bg-[#c2410c] text-white p-3 rounded-xl transition cursor-pointer disabled:bg-stone-300 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
