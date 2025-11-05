import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Wheat, Lock, Eye, EyeOff, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import FloatingOrbs from '../components/FloatingOrbs';
import { Progress } from '../components/ui/progress';
import LoadingAnimation from '../components/LoadingAnimation';
import PageTransition from '../components/PageTransition';
import { getAuth, getDb, serverTimestamp } from '../lib/firebaseCompat';

export default function FarmerRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength += 25;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength += 25;
    if (/\d/.test(value)) strength += 25;
    if (/[^a-zA-Z\d]/.test(value)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const form = e.target as HTMLFormElement;
      const firstName = (document.getElementById('firstName') as HTMLInputElement).value.trim();
      const lastName = (document.getElementById('lastName') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('phone') as HTMLInputElement).value.trim();
      const email = (document.getElementById('email') as HTMLInputElement).value.trim();
      const pass = (document.getElementById('password') as HTMLInputElement).value;
      const address = (document.getElementById('address') as HTMLTextAreaElement).value.trim();
      const aadhar = (document.getElementById('aadhar') as HTMLInputElement).value.trim();
      const landArea = (document.getElementById('landArea') as HTMLInputElement).value.trim();
      const landType = (document.getElementById('landType') as HTMLInputElement).value.trim();
      const auth = getAuth();
      const db = getDb();
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      const user = cred.user;
      await db.collection('users').doc(user.uid).set({
        name: `${firstName} ${lastName}`.trim(),
        phone,
        address,
        aadhar,
        landArea,
        landType,
        role: 'Farmer',
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Farmer registered');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingAnimation message="Creating your account..." />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden flex items-center justify-center p-4 py-8">
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

      <Card className="w-full max-w-2xl glassmorphic shadow-2xl relative z-10 my-8">
        <CardHeader className="text-center">
          <CardTitle>Farmer Registration</CardTitle>
          <CardDescription>Create your account to start submitting claims</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="mb-4 pb-2 border-b">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="firstName" placeholder="First name" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="lastName" placeholder="Last name" className="pl-10" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="mb-4 pb-2 border-b">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="email@example.com" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" className="pl-10" required />
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="aadhar">Aadhar Number *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="aadhar" placeholder="1234 5678 9012" className="pl-10" required />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  id="address"
                  placeholder="Enter your complete address including village, district, and state"
                  className="pl-10 min-h-24"
                  required
                />
              </div>
            </div>

            {/* Land Details */}
            <div>
              <h3 className="mb-4 pb-2 border-b">Land Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area (in acres) *</Label>
                  <Input id="landArea" type="number" step="0.01" placeholder="5.5" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landType">Land Type</Label>
                  <Input id="landType" placeholder="e.g., Irrigated, Rain-fed" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="mb-4 pb-2 border-b">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
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
                  {password && (
                    <div className="space-y-1">
                      <Progress value={passwordStrength} className="h-1" />
                      <p className="text-xs text-gray-500">
                        Password strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-bg">
              Register Now
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/farmer-login" className="text-primary hover:underline">
                Login here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
