import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth, getUserRole, onAuthStateChanged } from '../lib/firebaseCompat';

type AuthState = {
	user: any | null;
	role: 'Farmer' | 'Verifier' | 'FieldOfficer' | 'RevenueOfficer' | 'TreasuryOfficer' | null;
	loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<any | null>(null);
	const [role, setRole] = useState<AuthState['role']>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(async (u) => {
			setUser(u);
			if (u) {
				try {
					const r = await getUserRole(u.uid);
					setRole(
						(r as any) === 'Farmer'
							? 'Farmer'
							: (r as any) === 'Verifier'
							? 'Verifier'
							: (r as any) === 'FieldOfficer'
							? 'FieldOfficer'
							: (r as any) === 'RevenueOfficer'
							? 'RevenueOfficer'
							: (r as any) === 'TreasuryOfficer'
							? 'TreasuryOfficer'
							: null
					);
				} catch (_) {
					setRole(null);
				}
			} else {
				setRole(null);
			}
			setLoading(false);
		});
		return () => unsub && unsub();
	}, []);

	const value = useMemo(() => ({ user, role, loading }), [user, role, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}

export async function signOut() {
	const auth = getAuth();
	await auth.signOut();
}


