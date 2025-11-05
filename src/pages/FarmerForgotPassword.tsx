import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Wheat, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import FloatingOrbs from '../components/FloatingOrbs';
import { Alert, AlertDescription } from '../components/ui/alert';
import PageTransition from '../components/PageTransition';

export default function FarmerForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

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
            {isSubmitted ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle>
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? 'We\'ve sent password reset instructions to your email'
              : 'Enter your email address and we\'ll send you instructions to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>

              <div className="text-center text-sm">
                <Link
                  to="/farmer-login"
                  className="text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  If an account exists with <strong>{email}</strong>, you will receive password reset instructions shortly.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-gray-600">
                <p>Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  Try Another Email
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={() => navigate('/farmer-login')}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
