import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDny41-nAzLxg6zGgHM7jc0Q0QxQCkCxO0",
  authDomain: "agriclaim1.firebaseapp.com",
  projectId: "agriclaim1",
  storageBucket: "agriclaim1.firebasestorage.app",
  messagingSenderId: "1042995668917",
  appId: "1:1042995668917:web:eb8c8251ee9ada6244dbfc",
  measurementId: "G-T287PS5V1T",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const authHelpers = {
  signIn: (email, password) =>
    signInWithEmailAndPassword(auth, email, password),
  signUp: (email, password) =>
    createUserWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
  getCurrentUser: () => auth.currentUser,
};

export const dbHelpers = {
  addDocument: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document:", error);
      return { success: false, error: error.message };
    }
  },

  setDocument: async (collectionName, docId, data) => {
    try {
      await setDoc(
        doc(db, collectionName, docId),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return { success: true };
    } catch (error) {
      console.error("Error setting document:", error);
      return { success: false, error: error.message };
    }
  },

  getDocument: async (collectionName, docId) => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Document not found" };
      }
    } catch (error) {
      console.error("Error getting document:", error);
      return { success: false, error: error.message };
    }
  },

  getAllDocuments: async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: documents };
    } catch (error) {
      console.error("Error getting documents:", error);
      return { success: false, error: error.message };
    }
  },

  queryDocuments: async (collectionName, field, operator, value) => {
    try {
      const q = query(
        collection(db, collectionName),
        where(field, operator, value),
      );
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: documents };
    } catch (error) {
      console.error("Error querying documents:", error);
      return { success: false, error: error.message };
    }
  },

  updateDocument: async (collectionName, docId, data) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating document:", error);
      return { success: false, error: error.message };
    }
  },

  deleteDocument: async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, error: error.message };
    }
  },

  listenToCollection: (collectionName, callback) => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const documents = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      },
      (error) => {
        console.error("Error listening to collection:", error);
        callback([], error);
      },
    );
    return unsubscribe;
  },

  listenToDocument: (collectionName, docId, callback) => {
    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null, "Document not found");
        }
      },
      (error) => {
        console.error("Error listening to document:", error);
        callback(null, error);
      },
    );
    return unsubscribe;
  },
};

export const storageHelpers = {
  uploadFile: async (path, file) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, error: error.message };
    }
  },

  getFileURL: async (path) => {
    try {
      const downloadURL = await getDownloadURL(ref(storage, path));
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error getting file URL:", error);
      return { success: false, error: error.message };
    }
  },
};

export default app;
