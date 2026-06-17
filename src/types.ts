export interface DonationTier {
  id: string;
  amount: number;
  impactLabel: string;
  description: string;
  fullImpactText: string;
  icon: string;
}

export interface Story {
  id: string;
  name: string;
  age: number;
  location: string;
  quote: string;
  narrative: string;
  urgencyLevel: "Critical" | "High" | "Moderate";
  needs: string[];
  imagePath: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  raised: number;
  target: number;
  status: "Active" | "Fully Funded" | "Critical Need";
  description: string;
}

export interface Partner {
  name: string;
  role: string;
  logoUrl?: string;
}

export interface SecurityBadge {
  title: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: "visitor" | "support";
  senderName: string;
  text: string;
  timestamp: string;
  uploadedFile?: {
    name: string;
    url: string;
    size: string;
    isMockReceipt?: boolean;
    verificationStatus?: "Pending" | "Verified" | "Rejected";
    verifiedAmount?: number;
    receiptDownloadUrl?: string;
  };
  isTemplateCard?: boolean;
}

export interface ChatRoom {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  lastMessage: string;
  time: string;
  avatarColor: string;
  unread: boolean;
  messages: ChatMessage[];
  intendedAllocation?: string;
  status: "Waiting" | "Awaiting Proof" | "Verified" | "Rejected";
  assignedAgent?: string;
  tags?: string[];
  staffNotes?: string;
  createdAt: string;
  lastActive: string;
  country?: string;
}

export interface AdminUser {
  email: string;
  role: "Super Admin" | "Donation Manager" | "Support Agent";
  name: string;
  token2fa?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: "Security" | "Donation" | "System" | "Chat";
  operator: string;
  role: string;
  ip: string;
  details: string;
}

export interface VerifiedDonation {
  id: string;
  roomName: string;
  email: string;
  amount: number;
  allocation: string;
  timestamp: string;
  referenceId: string;
  country: string;
}

