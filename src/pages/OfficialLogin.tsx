import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCheck, MapPin, DollarSign, Building2, Lock, User as UserIcon, Wheat, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import FloatingOrbs from '../components/FloatingOrbs';
import LoadingAnimation from '../components/LoadingAnimation';
import PageTransition from '../components/PageTransition';
import { getAuth, getDb } from '../lib/firebaseCompat';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ensureSeedOfficials, getOfficialByUsername, usernameToEmail } from '../lib/officials';

type Role = 'verifier' | 'field-officer' | 'revenue-officer' | 'treasury-officer';

export default function OfficialLogin() {
  const [selectedRole, setSelectedRole] = useState<Role>('verifier');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'verifier' as Role,
      name: 'Document Verifier',
      icon: FileCheck,
      description: 'Verify and approve submitted claim documents',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'field-officer' as Role,
      name: 'Field Officer',
      icon: MapPin,
      description: 'Conduct on-site inspections and damage assessment',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'revenue-officer' as Role,
      name: 'Revenue Officer',
      icon: DollarSign,
      description: 'Calculate and approve compensation amounts',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'treasury-officer' as Role,
      name: 'Treasury Officer',
      icon: Building2,
      description: 'Process final payments and disbursements',
      color: 'from-orange-500 to-red-500',
    },
  ];

  // Seed officials mapping on first load of this screen
  // Safe to run multiple times; writes only if missing
  import.meta.env && ensureSeedOfficials().catch(() => {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const username = (document.getElementById('employeeId') as HTMLInputElement).value.trim();
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const auth = getAuth();
      const db = getDb();
      const official = await getOfficialByUsername(username);
      if (!official) {
        setIsLoading(false);
        setErrorMessage('No such official user. Please check your username.');
        setShowError(true);
        return;
      }
      const email = usernameToEmail(username);
      if (!official.password || official.password !== password) {
        setIsLoading(false);
        setErrorMessage('Incorrect username or password.');
        setShowError(true);
        return;
      }
      // Try sign-in; if user not found, provision account
      let user;
      try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        user = cred.user;
      } catch (err: any) {
        if (err && err.code === 'auth/user-not-found') {
          const cred = await auth.createUserWithEmailAndPassword(email, password);
          user = cred.user;
          // Create users profile with role from officials mapping
          await db.collection('users').doc(user.uid).set({
            name: official.displayName || username,
            email,
            role: official.role,
            createdAt: new Date(),
            updatedAt: new Date(),
          }, { merge: true });
        } else {
          throw err;
        }
      }
      // Ensure role matches selected portal (Admin can access all)
      const userDoc = await db.collection('users').doc(user.uid).get();
      const data = userDoc.exists ? userDoc.data() : null;
      const role = (data?.role as string) || '';
      const selected = selectedRole === 'verifier' ? 'Verifier' : selectedRole === 'field-officer' ? 'FieldOfficer' : selectedRole === 'revenue-officer' ? 'RevenueOfficer' : selectedRole === 'treasury-officer' ? 'TreasuryOfficer' : '';
      const allowed = role === 'Admin' || role === selected;
      if (!allowed) {
        await auth.signOut();
        setIsLoading(false);
        setErrorMessage('Invalid credentials or role mismatch for selected portal.');
        setShowError(true);
        return;
      }
      console.log('✅ Official logged in as', role);
      navigate(`/${selectedRole}`);
    } catch (err) {
      console.error('Official login error', err);
      setIsLoading(false);
      setErrorMessage('Incorrect username or password. Please try again.');
      setShowError(true);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  if (isLoading) {
    return <LoadingAnimation message={`Logging in as ${selectedRoleData?.name}...`} />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden flex items-center justify-center p-4">
      <FloatingOrbs />

      {/* Back Navigation */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text">AgriClaim</span>
        </Link>
      </div>

      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 z-10 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Selection */}
          <div>
            <h2 className="mb-6 text-center lg:text-left">Select Your Role</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'ring-2 ring-primary shadow-lg scale-105'
                      : 'hover:shadow-md'
                  } glassmorphic`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate">{role.name}</h4>
                          {selectedRole === role.id && (
                            <Badge className="bg-primary text-white text-xs">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <Card className="glassmorphic shadow-2xl">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${selectedRoleData?.color} rounded-full flex items-center justify-center`}>
                {selectedRoleData && <selectedRoleData.icon className="w-8 h-8 text-white" />}
              </div>
              <CardTitle>{selectedRoleData?.name} Login</CardTitle>
              <CardDescription>{selectedRoleData?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID / Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      placeholder="Enter your employee ID"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <Link to="/official-forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className={`w-full bg-gradient-to-r ${selectedRoleData?.color} text-white hover:opacity-90`}>
                  Login as {selectedRoleData?.name}
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      Secure Portal
                    </Badge>
                    <span>Government Officials Only</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <Dialog open={showError} onOpenChange={setShowError}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Failed</DialogTitle>
          <DialogDescription>{errorMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setShowError(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </PageTransition>
  );
}
