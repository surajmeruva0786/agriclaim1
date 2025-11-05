import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Wheat, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import FloatingOrbs from '../components/FloatingOrbs';
import LoadingAnimation from '../components/LoadingAnimation';
import PageTransition from '../components/PageTransition';
import { getAuth, getDb } from '../lib/firebaseCompat';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

export default function FarmerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const auth = getAuth();
      const db = getDb();
      const cred = await auth.signInWithEmailAndPassword(email.trim(), password);
      const user = cred.user;
      const doc = await db.collection('users').doc(user.uid).get();
      const data = doc.exists ? doc.data() : null;
      if (!data || String(data.role) !== 'Farmer') {
        await auth.signOut();
        setIsLoading(false);
        setErrorMessage('Invalid credentials or role. Please use a valid Farmer account.');
        setShowError(true);
        return;
      }
      console.log('✅ Farmer logged in');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setIsLoading(false);
      setErrorMessage('Incorrect email or password. Please try again.');
      setShowError(true);
    }
  };

  if (isLoading) {
    return <LoadingAnimation message="Logging you in..." />;
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

        <Card className="w-full max-w-md glassmorphic shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Farmer Login</CardTitle>
            <CardDescription>Welcome back! Login to manage your claims</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/farmer-forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full gradient-bg">
                Login
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/farmer-register" className="text-primary hover:underline">
                  Register now
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
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
