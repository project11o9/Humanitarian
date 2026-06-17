import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export interface PaymentSettings {
  accountHolder: string;
  bankName: string;
  accountNumberMasked: string;
  accountNumberEncrypted: string;
  ifsc: string;
  upiId: string;
  qrImageUrl: string;
  isActive: boolean;
  updatedBy: string;
  updatedAt: string;
}

const SETTINGS_DOC_ID = "official_payment_details";

// Fetch the payment settings
export const getPaymentSettings = async (): Promise<PaymentSettings | null> => {
  try {
    const docRef = doc(db, "paymentSettings", SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PaymentSettings;
    }
    // Return standard initial fallback settings if none exist
    return {
      accountHolder: "Bait Al-Rahma Trust",
      bankName: "State Bank of India (SBI)",
      accountNumberMasked: "XXXX-XXXX-9024",
      accountNumberEncrypted: "3920194829012",
      ifsc: "SBIN0004928",
      upiId: "bait.alrahma@sbi",
      qrImageUrl: "", // Can store a generated image link
      isActive: true,
      updatedBy: "system",
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `paymentSettings/${SETTINGS_DOC_ID}`);
    return null;
  }
};

// Update official settings
export const updatePaymentSettings = async (
  settings: Partial<PaymentSettings>,
  updatedByUid: string
): Promise<void> => {
  try {
    const docRef = doc(db, "paymentSettings", SETTINGS_DOC_ID);
    const updatedData = {
      ...settings,
      updatedBy: updatedByUid,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, updatedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `paymentSettings/${SETTINGS_DOC_ID}`);
  }
};
