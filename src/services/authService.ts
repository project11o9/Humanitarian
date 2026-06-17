import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile } from "../context/AuthContext";

// Fetch user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

// Create or update a donor profile after signup or first use
export const createOrUpdateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    const now = new Date().toISOString();

    let finalProfile: UserProfile;

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      finalProfile = {
        ...existing,
        ...data,
        lastLoginAt: now
      };
      await updateDoc(docRef, {
        ...data,
        lastLoginAt: now
      });
    } else {
      finalProfile = {
        uid,
        name: data.name || "Anonymous Supporter",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "donor",
        status: data.status || "active",
        createdAt: now,
        lastLoginAt: now
      };
      await setDoc(docRef, finalProfile);
    }
    return finalProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    throw error;
  }
};

// Retrieve all users (Admins / Volunteers / Donors)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "users");
    return [];
  }
};

// Modify user role (Super Admin action)
export const updateUserRoleInDb = async (
  uid: string,
  newRole: UserProfile["role"]
): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

// Toggle user status (active/disabled)
export const updateUserStatusInDb = async (
  uid: string,
  newStatus: UserProfile["status"]
): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};
