import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export interface DonationIntent {
  id: string;
  donorUid: string;
  donorName: string;
  phone: string;
  email: string;
  country: string;
  cause: string;
  amount: number;
  currency: string;
  anonymous: boolean;
  message: string;
  status: "New" | "In Chat" | "Payment Details Shared" | "Proof Received" | "Under Verification" | "Verified" | "Receipt Sent" | "Closed";
  assignedTo: string; // assigned volunteer UID
  receiptId?: string;
  transactionReference?: string;
  verifiedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  donationIntentId: string;
  donorUid: string;
  assignedTo: string;
  status: "New" | "In Chat" | "Payment Details Shared" | "Proof Received" | "Under Verification" | "Verified" | "Closed";
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderUid: string;
  senderRole: string;
  senderName: string;
  messageType: "text" | "template" | "proof" | "system";
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
}

// 1. Create a donation intent and a matching chat room
export const createDonationIntentAndRoom = async (payload: {
  donorUid: string;
  donorName: string;
  phone: string;
  email: string;
  country: string;
  cause: string;
  amount: number;
  anonymous: boolean;
  message: string;
}): Promise<string> => {
  try {
    const intentCollection = collection(db, "donationIntents");
    const roomCollection = collection(db, "chatRooms");
    
    const intentRef = doc(intentCollection);
    const roomRef = doc(roomCollection); // Room ID matches or can be separate. Let's make roomId the same for simple querying or separate. We can keep it separate or the same. Making them the same is clean, but let's use roomRef.id as the roomId!

    const now = new Date().toISOString();

    const newIntent: DonationIntent = {
      id: intentRef.id,
      donorUid: payload.donorUid,
      donorName: payload.anonymous ? "Anonymous Supporter" : payload.donorName,
      phone: payload.phone,
      email: payload.email || "",
      country: payload.country,
      cause: payload.cause,
      amount: payload.amount,
      currency: "INR",
      anonymous: payload.anonymous,
      message: payload.message || "",
      status: "New",
      assignedTo: "",
      createdAt: now,
      updatedAt: now
    };

    const newRoom: ChatRoom = {
      id: roomRef.id,
      donationIntentId: intentRef.id,
      donorUid: payload.donorUid,
      assignedTo: "",
      status: "New",
      lastMessage: "Connecting to support coordinator...",
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(intentRef, newIntent);
    await setDoc(roomRef, newRoom);

    // Create standard welcome message in messages collection
    const msgRef = doc(collection(db, "chatMessages"));
    const welcomeMsg: ChatMessage = {
      id: msgRef.id,
      roomId: roomRef.id,
      senderUid: "system",
      senderRole: "volunteer",
      senderName: "Bait Al-Rahma Trust",
      messageType: "system",
      text: "Welcome to Bait Al-Rahma Trust. Thank you for supporting our humanitarian relief efforts. Once a support volunteer connects, they will share our official payment details and walk you through the manual donation support process.",
      createdAt: now
    };
    await setDoc(msgRef, welcomeMsg);

    return roomRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "donationIntents");
    throw error;
  }
};

// 2. Send message in a chat room
export const sendChatMessage = async (
  roomId: string,
  senderUid: string,
  senderRole: string,
  senderName: string,
  text: string,
  messageType: ChatMessage["messageType"] = "text",
  fileUrl?: string,
  fileName?: string,
  fileSize?: string
): Promise<void> => {
  try {
    const msgRef = doc(collection(db, "chatMessages"));
    const now = new Date().toISOString();
    
    const message: ChatMessage = {
      id: msgRef.id,
      roomId,
      senderUid,
      senderRole,
      senderName,
      messageType,
      text,
      createdAt: now,
      ...(fileUrl && { fileUrl, fileName, fileSize })
    };

    await setDoc(msgRef, message);

    // Update parent ChatRoom's lastMessage fields
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      lastMessage: text,
      lastMessageAt: now,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `chatMessages/${roomId}`);
  }
};

// 3. Update active room status
export const updateRoomStatusInDb = async (
  roomId: string,
  intentId: string,
  status: DonationIntent["status"]
): Promise<void> => {
  try {
    const roomRef = doc(db, "chatRooms", roomId);
    const intentRef = doc(db, "donationIntents", intentId);
    const now = new Date().toISOString();

    await updateDoc(roomRef, { status, updatedAt: now });
    await updateDoc(intentRef, { status, updatedAt: now });

    // Send a system message to indicate status change
    await sendChatMessage(
      roomId,
      "system",
      "system",
      "System",
      `The donation status has been updated to: ${status}`,
      "system"
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `chatRooms/${roomId}`);
  }
};

// 4. Assign volunteer to chat room
export const assignVolunteerToRoom = async (
  roomId: string,
  intentId: string,
  volunteerUid: string,
  volunteerName: string
): Promise<void> => {
  try {
    const roomRef = doc(db, "chatRooms", roomId);
    const intentRef = doc(db, "donationIntents", intentId);
    const now = new Date().toISOString();

    await updateDoc(roomRef, {
      assignedTo: volunteerUid,
      status: "In Chat",
      updatedAt: now
    });

    await updateDoc(intentRef, {
      assignedTo: volunteerUid,
      status: "In Chat",
      updatedAt: now
    });

    // Send assignment notification inside chat thread
    await sendChatMessage(
      roomId,
      "system",
      "system",
      "System",
      `Volunteer ${volunteerName} has joined the chat and is ready to assist you.`,
      "system"
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `chatRooms/${roomId}`);
  }
};

// 5. Add internal note
export const addInternalNoteToRoom = async (
  roomId: string,
  notes: string
): Promise<void> => {
  try {
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      internalNotes: notes,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `chatRooms/${roomId}`);
  }
};
