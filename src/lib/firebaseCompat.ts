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

export function serverTimestamp() {
	const fb: any = (window as any).firebase;
	if (!fb || !fb.firestore || !fb.firestore.FieldValue) {
		throw new Error('Firebase FieldValue not available');
	}
	return fb.firestore.FieldValue.serverTimestamp();
}

export function arrayUnion(...values: any[]) {
	const fb: any = (window as any).firebase;
	if (!fb || !fb.firestore || !fb.firestore.FieldValue) {
		throw new Error('Firebase FieldValue not available');
	}
	return fb.firestore.FieldValue.arrayUnion(...values);
}

export type FarmerNotificationPayload = {
	farmerId?: string | null;
	claimId: string;
	title: string;
	message: string;
	type?: 'success' | 'warning' | 'info' | 'error';
	statusLabel?: string;
	linkUrl?: string;
	linkLabel?: string;
};

export async function sendClaimStatusNotificationToFarmer(payload: FarmerNotificationPayload) {
	const { farmerId, claimId, title, message, type = 'info', statusLabel = '', linkUrl, linkLabel } = payload;
	if (!farmerId) {
		console.warn('⚠️ Missing farmerId for notification', { claimId, title });
		return;
	}

	try {
		const db = getDb();
		const timestamp = new Date().toISOString();
		const base = {
			claimId,
			title,
			message,
			type,
			statusLabel,
			linkUrl: linkUrl || null,
			linkLabel: linkLabel || null,
			read: false,
			timestamp,
			createdAt: (() => {
				try {
					return serverTimestamp();
				} catch (_) {
					return timestamp;
				}
			})(),
		};

		const farmerRef = db.collection('users').doc(farmerId).collection('notifications');
		const docRef = farmerRef.doc();
		await docRef.set({ ...base, id: docRef.id });

		try {
			await db.collection('notifications').doc(docRef.id).set({ ...base, farmerId });
		} catch (_) {
			// Optional collection – ignore failures
		}
	} catch (err) {
		console.error('❌ Failed to send notification to farmer', err);
	}
}


