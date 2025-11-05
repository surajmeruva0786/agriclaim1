declare global {
	interface Window {
		firebaseAuth: any;
		firebaseDb: any;
		firebaseStorage: any;
		currentUser?: any;
	}
}

export function getAuth() {
	if (!window.firebaseAuth) throw new Error('Firebase Auth not initialized');
	return window.firebaseAuth;
}

export function getDb() {
	if (!window.firebaseDb) throw new Error('Firebase Firestore not initialized');
	return window.firebaseDb;
}

export function getStorage() {
	if (!window.firebaseStorage) throw new Error('Firebase Storage not initialized');
	return window.firebaseStorage;
}

export async function getUserRole(userId: string): Promise<string | null> {
	const db = getDb();
	const doc = await db.collection('users').doc(userId).get();
	if (!doc.exists) return null;
	return (doc.data() && doc.data().role) || null;
}

export function onAuthStateChanged(cb: (user: any | null) => void) {
	const auth = getAuth();
	return auth.onAuthStateChanged(cb);
}

export type ClaimRecord = {
	id?: string;
	farmerId: string;
	cropType: string;
	cause: string;
	lossDate: string;
	damagePercent: number;
	description: string;
	imageLinks: string;
	documentLinks?: string;
	status: string; // Submitted → Verified → Field Verified → Revenue Approved → Paid, Rejected
	stage: 'verifier' | 'field' | 'revenue' | 'treasury' | 'done' | 'rejected';
	history?: Array<{ at: any; by: string; action: string; note?: string; role: string }>;
	createdAt?: any;
	updatedAt?: any;
};

export function claimsCollection() {
	return getDb().collection('claims');
}


