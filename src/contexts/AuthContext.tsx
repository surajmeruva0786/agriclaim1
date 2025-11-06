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
    const [manualSession, setManualSession] = useState<{ user: any; role: AuthState['role'] } | null>(null);
    // expose setter for manual sessions
    useEffect(() => {
        // import inside to avoid cycles
        const bind = (setter: (u: any, r: AuthState['role']) => void) => {
            (setManualSessionExternal as any) = (u: any, r: AuthState['role']) => setManualSession({ user: u, role: r });
        };
        bind((u, r) => setManualSession({ user: u, role: r }));
    }, []);

    useEffect(() => {
        if (manualSession) {
            setUser(manualSession.user);
            setRole(manualSession.role);
            setLoading(false);
            return; // do not bind firebase auth while manual session active
        }
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
    }, [manualSession]);

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

// Manual session helper for government officials (no Firebase Auth)
let setManualSessionExternal: ((u: any, r: AuthState['role']) => void) | null = null;

export function setManualOfficialSession(params: { name: string; role: AuthState['role'] }) {
    if (!setManualSessionExternal) return;
    const manualUser = { uid: 'local-official', displayName: params.name };
    setManualSessionExternal(manualUser, params.role);
}

// Bridge internal setter to external helper
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function __bindManualSessionSetter(setter: (u: any, r: AuthState['role']) => void) {
    setManualSessionExternal = setter;
}


