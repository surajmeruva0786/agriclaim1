import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Wheat, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import FloatingOrbs from '../components/FloatingOrbs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import PageTransition from '../components/PageTransition';

export default function OfficialForgotPassword() {
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
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
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-700">Government Official</Badge>
            <CardTitle>
              {isSubmitted ? 'Request Submitted' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Your password reset request has been sent to the system administrator'
                : 'Enter your credentials to request a password reset'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  For security reasons, password resets for government officials require administrator approval. You will be contacted within 24 hours.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="EMP123456"
                    className="pl-10"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="official@gov.in"
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
                {isLoading ? 'Submitting Request...' : 'Submit Reset Request'}
              </Button>

              <div className="text-center text-sm">
                <Link
                  to="/official-login"
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
                  Your password reset request has been submitted successfully.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-gray-600">
                <p className="font-semibold">What happens next?</p>
                <ul className="list-disc list-inside space-y-2 text-xs">
                  <li>Your request will be verified by the system administrator</li>
                  <li>You will receive an email at <strong>{email}</strong> within 24 hours</li>
                  <li>Follow the instructions in the email to reset your password</li>
                  <li>For urgent access, contact your department administrator</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="font-semibold text-blue-900 mb-1">Request Details:</p>
                <p className="text-blue-700">Employee ID: {employeeId}</p>
                <p className="text-blue-700">Email: {email}</p>
                <p className="text-blue-700">Submitted: {new Date().toLocaleString()}</p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => navigate('/official-login')}
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
