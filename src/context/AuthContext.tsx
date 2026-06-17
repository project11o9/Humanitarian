import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: "donor" | "volunteer" | "finance" | "admin" | "super_admin";
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileRole: (role: UserProfile["role"]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(true);

        const profileRef = doc(db, "users", firebaseUser.uid);
        
        // Listen to profile in real-time
        unsubscribeProfile = onSnapshot(profileRef, async (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
            setLoading(false);
          } else {
            // Grace period to prevent race conditions during sign up
            setTimeout(async () => {
              try {
                const currentSnap = await getDoc(profileRef);
                if (!currentSnap.exists() && auth.currentUser?.uid === firebaseUser.uid) {
                  let assignedRole: "donor" | "volunteer" | "finance" | "admin" = "donor";
                  const lowerEmail = (firebaseUser.email || "").toLowerCase();
                  if (lowerEmail.endsWith("@bait-alrahma.org")) {
                    if (lowerEmail.includes("finance")) {
                      assignedRole = "finance";
                    } else if (lowerEmail.includes("admin")) {
                      assignedRole = "admin";
                    } else {
                      assignedRole = "volunteer";
                    }
                  } else if (
                    lowerEmail.includes("volunteer") || 
                    lowerEmail.includes("volenter") || 
                    lowerEmail.includes("voul") ||
                    lowerEmail.includes("coord")
                  ) {
                    assignedRole = "volunteer";
                  } else if (lowerEmail.includes("finance") || lowerEmail.includes("money")) {
                    assignedRole = "finance";
                  }

                  const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0].toUpperCase() || "Anonymous Donee",
                    email: firebaseUser.email || "",
                    role: assignedRole,
                    status: "active",
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                  };
                  await setDoc(profileRef, newProfile);
                  setProfile(newProfile);
                }
              } catch (err) {
                console.error("Error creating default user profile", err);
              }
              setLoading(false);
            }, 1000);
          }
        }, (error) => {
          console.error("Profile snapshot listener error:", error);
          setLoading(false);
        });

      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfileRole = async (newRole: UserProfile["role"]) => {
    if (!user) return;
    const profileRef = doc(db, "users", user.uid);
    const updatedData = { ...profile, role: newRole, updatedAt: new Date().toISOString() };
    await setDoc(profileRef, updatedData, { merge: true });
    setProfile(prev => prev ? { ...prev, role: newRole } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, updateProfileRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
