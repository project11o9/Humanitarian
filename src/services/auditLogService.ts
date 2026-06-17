import { collection, doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  createdAt: string;
}

export const createAuditLog = async (
  actorUid: string,
  actorRole: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: any = {}
) => {
  const logRef = doc(collection(db, "auditLogs"));
  const logData: AuditLog = {
    id: logRef.id,
    actorUid,
    actorRole,
    action,
    targetType,
    targetId,
    metadata,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(logRef, logData);
    return logRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "auditLogs");
  }
};
