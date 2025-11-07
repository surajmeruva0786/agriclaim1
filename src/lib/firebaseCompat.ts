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

function normalizeStatusForCounters(raw?: string): 'pending' | 'approved' | 'rejected' {
	const s = (raw || '').toLowerCase();
	if (s === 'rejected') return 'rejected';
	if (s === 'approved' || s === 'revenue approved' || s === 'paid') return 'approved';
	return 'pending';
}

export async function recomputeAndStoreFarmerCounters(farmerId?: string | null) {
	if (!farmerId) return;
	const db = getDb();
	const snap = await db.collection('claims').where('farmerId', '==', farmerId).get();
	let total = 0;
	let pending = 0;
	let approved = 0;
	let rejected = 0;
	snap.forEach((doc: any) => {
		total += 1;
		const n = normalizeStatusForCounters(doc.data()?.status);
		if (n === 'pending') pending += 1;
		if (n === 'approved') approved += 1;
		if (n === 'rejected') rejected += 1;
	});
	await db.collection('users').doc(farmerId).set({
		counters: { total, pending, approved, rejected, updatedAt: new Date().toISOString() },
	}, { merge: true });
}

type RoleId = 'verifier' | 'field' | 'revenue' | 'treasury';

export async function recomputeAndStoreRoleCounters(roleId: RoleId) {
	const db = getDb();
	const snap = await db.collection('claims').where('stage', '==', roleId).get();
	let total = 0;
	let pending = 0;
	let approved = 0;
	let rejected = 0;
	let forwarded = 0;
	snap.forEach((doc: any) => {
		total += 1;
		const raw = (doc.data()?.status || '').toLowerCase();
		if (raw === 'rejected') rejected += 1;
		else if (raw === 'approved' || raw === 'paid' || raw === 'revenue approved') approved += 1;
		else if (raw.includes('forward')) forwarded += 1;
		else pending += 1;
	});
	await db.collection('meta').doc('officialCounters').set({
		[roleId]: { total, pending, approved, rejected, forwarded, updatedAt: new Date().toISOString() },
	}, { merge: true });
}


