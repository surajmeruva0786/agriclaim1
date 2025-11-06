import { getDb } from './firebaseCompat';

export type OfficialRole = 'Verifier' | 'FieldOfficer' | 'RevenueOfficer' | 'TreasuryOfficer' | 'Admin';
export type RoleId = 'verifier' | 'field' | 'revenue' | 'treasury';

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
        : roleId === 'field'
        ? 'FieldOfficer'
        : roleId === 'revenue'
        ? 'RevenueOfficer'
        : 'TreasuryOfficer';
}

export async function ensureSeedOfficials() {
	const db = getDb();
    const seed: Array<{ roleId: RoleId; rec: OfficialRecord }> = [
        { roleId: 'verifier', rec: { username: 'verifier1', role: 'Verifier', displayName: 'Dr. Anjali Verma', password: 'verify123', department: 'Verification Dept.', phone: '+91 98765 43210', email: 'anjali.verma@gov.example', address: 'Block B, Secretariat, City' } },
        { roleId: 'field', rec: { username: 'field1', role: 'FieldOfficer', displayName: 'Mr. Vikram Singh', password: 'field123', department: 'Field Operations', phone: '+91 99887 66554', email: 'vikram.singh@gov.example', address: 'District Office, Sector 12' } },
        { roleId: 'revenue', rec: { username: 'revenue1', role: 'RevenueOfficer', displayName: 'Ms. Neha Rao', password: 'revenue123', department: 'Revenue Assessment', phone: '+91 91234 56780', email: 'neha.rao@gov.example', address: 'Revenue Bhavan, Floor 3' } },
        { roleId: 'treasury', rec: { username: 'treasury1', role: 'TreasuryOfficer', displayName: 'Mr. Arjun Mehta', password: 'treasury123', department: 'Treasury & Payments', phone: '+91 90123 45678', email: 'arjun.mehta@gov.example', address: 'Treasury Dept., Central Office' } },
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


