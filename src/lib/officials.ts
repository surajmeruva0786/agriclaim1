import { getDb } from './firebaseCompat';

export type OfficialRole = 'Verifier' | 'FieldOfficer' | 'RevenueOfficer' | 'TreasuryOfficer' | 'Admin';
export type RoleId = 'verifier' | 'field-officer' | 'revenue-officer' | 'treasury-officer' | 'admin';

export type OfficialRecord = {
	username: string; // e.g., verifier1
	role: OfficialRole;
	displayName?: string;
	password?: string; // stored in Firestore for demo
	department?: string;
	phone?: string;
	email?: string;
	address?: string;
};

export function roleIdToCollection(roleId: RoleId): string {
	return roleId; // collections named exactly as role ids
}

export function roleIdToRoleTitle(roleId: RoleId): OfficialRole {
	return roleId === 'verifier'
		? 'Verifier'
		: roleId === 'field-officer'
		? 'FieldOfficer'
		: roleId === 'revenue-officer'
		? 'RevenueOfficer'
		: roleId === 'treasury-officer'
		? 'TreasuryOfficer'
		: 'Admin';
}

export async function ensureSeedOfficials() {
	const db = getDb();
	const seed: Array<{ roleId: RoleId; rec: OfficialRecord }> = [
		{ roleId: 'verifier', rec: { username: 'verifier1', role: 'Verifier', displayName: 'Document Verifier', password: 'verify123' } },
		{ roleId: 'field-officer', rec: { username: 'field1', role: 'FieldOfficer', displayName: 'Field Officer', password: 'field123' } },
		{ roleId: 'revenue-officer', rec: { username: 'revenue1', role: 'RevenueOfficer', displayName: 'Revenue Officer', password: 'revenue123' } },
		{ roleId: 'treasury-officer', rec: { username: 'treasury1', role: 'TreasuryOfficer', displayName: 'Treasury Officer', password: 'treasury123' } },
		{ roleId: 'admin', rec: { username: 'admin', role: 'Admin', displayName: 'Administrator', password: 'admin123' } },
	];
	await Promise.all(
		seed.map(async ({ roleId, rec }) => {
			const ref = db.collection(roleIdToCollection(roleId)).doc(rec.username);
			const snap = await ref.get();
			if (!snap.exists) {
				await ref.set({ ...rec, createdAt: new Date() }, { merge: true });
			} else {
				const data = snap.data() || {};
				const update: any = {};
				if (!data.password) update.password = rec.password;
				if (!data.role) update.role = rec.role;
				if (!data.displayName) update.displayName = rec.displayName || rec.username;
				if (Object.keys(update).length) await ref.set(update, { merge: true });
			}
		})
	);
}

export async function getOfficialByRoleAndUsername(roleId: RoleId, username: string): Promise<OfficialRecord | null> {
	const db = getDb();
	const snap = await db.collection(roleIdToCollection(roleId)).doc(username).get();
	if (!snap.exists) return null;
	const data = snap.data() || {};
	return {
		username,
		role: roleIdToRoleTitle(roleId),
		displayName: (data.displayName as string) || username,
		password: (data.password as string) || undefined,
		department: (data.department as string) || undefined,
		phone: (data.phone as string) || undefined,
		email: (data.email as string) || undefined,
		address: (data.address as string) || undefined,
	};
}


