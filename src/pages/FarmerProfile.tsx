import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, FileText, Lock, Edit2, Save, X, Landmark, Calendar, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { useAuth } from '../contexts/AuthContext';
import { getDb, serverTimestamp } from '../lib/firebaseCompat';

export default function FarmerProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      title: 'Claim Approved',
      message: 'Your claim CL2024001 for Wheat crop has been approved. Payment will be processed within 3-5 business days.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Field Inspection Scheduled',
      message: 'A field officer has been assigned to inspect your claim CL2024002. Expected visit date: Tomorrow, 10:00 AM.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ]);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    landArea: '',
    landType: '',
    landSurveyNumber: '',
    registrationDate: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const db = getDb();
      await db.collection('users').doc(user.uid).set(
        {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          aadhar: profileData.aadhar,
          address: profileData.address,
          village: profileData.village,
          district: profileData.district,
          state: profileData.state,
          pincode: profileData.pincode,
          landArea: profileData.landArea,
          landType: profileData.landType,
          landSurveyNumber: profileData.landSurveyNumber,
          bankName: profileData.bankName,
          accountNumber: profileData.accountNumber,
          ifscCode: profileData.ifscCode,
          accountHolderName: profileData.accountHolderName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Profile updated successfully!', { description: 'Your changes have been saved.' });
    } catch (e) {
      setIsSaving(false);
      toast.error('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data (in real app, you'd fetch from state/API)
    toast.info('Changes discarded', {
      description: 'Your profile was not updated.',
    });
  };

  useEffect(() => {
    if (!user) return;
    const db = getDb();
    db
      .collection('users')
      .doc(user.uid)
      .get()
      .then((doc: any) => {
        const data = doc.exists ? doc.data() : {} as any;
        setProfileData(prev => ({
          ...prev,
          name: (data.name || '').toString(),
          email: (data.email || '').toString(),
          phone: (data.phone || '').toString(),
          aadhar: (data.aadhar || '').toString(),
          address: (data.address || '').toString(),
          village: (data.village || '').toString(),
          district: (data.district || '').toString(),
          state: (data.state || '').toString(),
          pincode: (data.pincode || '').toString(),
          landArea: (data.landArea || '').toString(),
          landType: (data.landType || '').toString(),
          landSurveyNumber: (data.landSurveyNumber || '').toString(),
          registrationDate: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toDateString() : '',
          bankName: (data.bankName || '').toString(),
          accountNumber: (data.accountNumber || '').toString(),
          ifscCode: (data.ifscCode || '').toString(),
          accountHolderName: (data.accountHolderName || '').toString(),
        }));
      })
      .catch(() => {});
  }, [user]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
        <FloatingOrbs />
        <Navbar
          user={{
            name: profileData.name,
            role: 'Farmer',
          }}
          notificationsList={notifications}
          onNotificationsChange={setNotifications}
        />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Back Navigation */}
          <BackButton className="mb-6" />

          {/* Profile Header */}
          <Card className="mb-8 glassmorphic shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="mb-1">{profileData.name}</h1>
                    <p className="text-gray-600 mb-2">{profileData.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-0">
                        <User className="w-3 h-3 mr-1" />
                        Farmer
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Member since {profileData.registrationDate}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gradient-bg">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="gradient-bg" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 glassmorphic">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="land">Land Details</TabsTrigger>
              <TabsTrigger value="bank">Bank Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-6">
              <Card className="glassmorphic shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic contact and identification details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aadhar">Aadhar Number *</Label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          id="aadhar"
                          value={profileData.aadhar}
                          onChange={(e) => handleInputChange('aadhar', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="min-h-20 pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="village">Village *</Label>
                      <Input
                        id="village"
                        value={profileData.village}
                        onChange={(e) => handleInputChange('village', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={profileData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input
                        id="pincode"
                        value={profileData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Land Details */}
            <TabsContent value="land" className="space-y-6">
              <Card className="glassmorphic shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Land Details
                  </CardTitle>
                  <CardDescription>
                    Information about your agricultural land
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landArea">Total Land Area (in acres) *</Label>
                      <Input
                        id="landArea"
                        type="number"
                        step="0.1"
                        value={profileData.landArea}
                        onChange={(e) => handleInputChange('landArea', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landType">Land Type *</Label>
                      <Select
                        value={profileData.landType}
                        onValueChange={(value) => handleInputChange('landType', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Irrigated">Irrigated</SelectItem>
                          <SelectItem value="Rainfed">Rainfed</SelectItem>
                          <SelectItem value="Semi-Irrigated">Semi-Irrigated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="surveyNumber">Land Survey Number *</Label>
                      <Input
                        id="surveyNumber"
                        value={profileData.landSurveyNumber}
                        onChange={(e) => handleInputChange('landSurveyNumber', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="mb-1 text-blue-900">Land Ownership Documents</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Upload your land ownership certificate and related documents for verification.
                        </p>
                        <Button variant="outline" size="sm" className="bg-white">
                          <FileText className="w-4 h-4 mr-2" />
                          View/Upload Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank Account */}
            <TabsContent value="bank" className="space-y-6">
              <Card className="glassmorphic shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="w-5 h-5" />
                    Bank Account Details
                  </CardTitle>
                  <CardDescription>
                    For receiving claim payments directly to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                      <Input
                        id="accountHolderName"
                        value={profileData.accountHolderName}
                        onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={profileData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        type="text"
                        value={profileData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        value={profileData.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="mb-1 text-green-900">Verified Bank Account</h4>
                        <p className="text-sm text-green-700">
                          Your bank account has been verified and is ready to receive payments.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card className="glassmorphic shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="gradient-bg">
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>

                  <div className="border-t pt-4 mt-6">
                    <h4 className="mb-2">Security Tips</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Use a strong password with at least 8 characters</li>
                      <li>Include uppercase, lowercase, numbers, and special characters</li>
                      <li>Don't share your password with anyone</li>
                      <li>Change your password regularly</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
