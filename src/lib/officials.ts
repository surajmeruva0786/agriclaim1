import { getDb } from './firebaseCompat';

export type OfficialRole = 'Verifier' | 'FieldOfficer' | 'RevenueOfficer' | 'TreasuryOfficer' | 'Admin';

export type OfficialRecord = {
	username: string; // e.g., verifier1
	role: OfficialRole;
	displayName?: string;
	password?: string; // stored in Firestore for demo provisioning
};

export function usernameToEmail(username: string) {
	return `${username}@official.agri`; // synthetic email for Firebase Auth
}

export async function ensureSeedOfficials() {
	const db = getDb();
	const seed: OfficialRecord[] = [
		{ username: 'verifier1', role: 'Verifier', displayName: 'Document Verifier', password: 'verify123' },
		{ username: 'field1', role: 'FieldOfficer', displayName: 'Field Officer', password: 'field123' },
		{ username: 'revenue1', role: 'RevenueOfficer', displayName: 'Revenue Officer', password: 'revenue123' },
		{ username: 'treasury1', role: 'TreasuryOfficer', displayName: 'Treasury Officer', password: 'treasury123' },
		{ username: 'admin', role: 'Admin', displayName: 'Administrator', password: 'admin123' },
	];
	await Promise.all(
		seed.map(async (rec) => {
			const ref = db.collection('officials').doc(rec.username);
			const snap = await ref.get();
			if (!snap.exists) {
				await ref.set({ role: rec.role, displayName: rec.displayName || rec.username, password: rec.password, createdAt: new Date() }, { merge: true });
			}
		})
	);
}

export async function getOfficialByUsername(username: string): Promise<OfficialRecord | null> {
	const db = getDb();
	const snap = await db.collection('officials').doc(username).get();
	if (!snap.exists) return null;
	const data = snap.data() || {};
	return {
		username,
		role: (data.role as OfficialRole) || 'Verifier',
		displayName: (data.displayName as string) || username,
		password: (data.password as string) || undefined,
	};
}


