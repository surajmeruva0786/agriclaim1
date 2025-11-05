import { useEffect, useState } from 'react';
import { Plus, FileText, CheckCircle2, Clock, XCircle, Eye, Calendar, Wheat as WheatIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { getDb, serverTimestamp } from '../lib/firebaseCompat';
import { useAuth } from '../contexts/AuthContext';

type Claim = {
  id: string;
  cropType: string;
  cause: string;
  date: string;
  damagePercent: number;
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
  submittedDate: string;
  description: string;
  imageLinks: string;
  documentLinks?: string;
  estimatedLoss?: string;
  remarks?: string;
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [damagePercent, setDamagePercent] = useState([50]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      title: 'Claim Approved',
      message: 'Your claim CL2024001 for Wheat crop has been approved. Payment will be processed within 3-5 business days.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionLabel: 'View Claim Details',
      actionUrl: '#',
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Field Inspection Scheduled',
      message: 'A field officer has been assigned to inspect your claim CL2024002. Expected visit date: Tomorrow, 10:00 AM.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-3',
      type: 'warning',
      title: 'Document Verification Required',
      message: 'Additional documents needed for claim CL2024002. Please upload land ownership certificate.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-4',
      type: 'error',
      title: 'Claim Rejected',
      message: 'Claim CL2024003 has been rejected due to insufficient evidence. You can resubmit with additional documentation.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-5',
      type: 'info',
      title: 'System Maintenance',
      message: 'The AgriClaim system will undergo maintenance on Sunday, 2:00 AM - 4:00 AM. Services may be temporarily unavailable.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const farmerInfo = {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    aadhar: '1234 5678 9012',
    address: 'Village Rampur, District Bareilly, Uttar Pradesh - 243001',
    landArea: '5.5 acres',
    landType: 'Irrigated',
    registrationDate: '15 Jan 2024',
  };

  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!user) return;
    const db = getDb();
    console.log('✅ Listening for farmer claims');
    const unsub = db
      .collection('claims')
      .where('farmerId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap: any) => {
        const list: Claim[] = [];
        snap.forEach((d: any) => {
          const data = d.data();
          list.push({
            id: d.id,
            cropType: data.cropType,
            cause: data.cause,
            date: data.lossDate,
            damagePercent: data.damagePercent,
            status: (data.status || 'submitted').toLowerCase(),
            submittedDate: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : '',
            description: data.description,
            imageLinks: data.imageLinks,
            documentLinks: data.documentLinks,
            estimatedLoss: data.estimatedLoss,
            remarks: data.latestRemark || '',
          });
        });
        setClaims(list);
      });
    return () => unsub && unsub();
  }, [user]);

  const stats = [
    {
      label: 'Total Claims',
      value: claims.length,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Pending',
      value: claims.filter(c => c.status === 'under-review' || c.status === 'submitted').length,
      icon: Clock,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      label: 'Approved',
      value: claims.filter(c => c.status === 'approved').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const getStatusBadge = (status: Claim['status']) => {
    const configs = {
      submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
      'under-review': { label: 'Under Review', className: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setShowNewClaimModal(false);
    setIsUploading(true);
    try {
      const cropType = (document.getElementById('cropType') as HTMLInputElement).value.trim();
      const lossDate = (document.getElementById('lossDate') as HTMLInputElement).value;
      const causeEl = document.querySelector('[data-radix-select-trigger]') as HTMLElement | null;
      const cause = (document.getElementById('cause') as HTMLInputElement)?.value || 'other';
      const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
      const imageLinks = (document.getElementById('imageLinks') as HTMLTextAreaElement).value.trim();
      const documentLinks = (document.getElementById('documentLinks') as HTMLTextAreaElement | null)?.value?.trim() || '';
      const db = getDb();
      const payload = {
        farmerId: user.uid,
        cropType,
        cause: cause || 'other',
        lossDate,
        damagePercent: damagePercent[0],
        description,
        imageLinks,
        documentLinks: documentLinks || null,
        status: 'Submitted',
        stage: 'verifier',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        history: [
          {
            at: serverTimestamp(),
            by: user.uid,
            action: 'Submitted',
            role: 'Farmer',
          },
        ],
      };
      await db.collection('claims').add(payload);
      console.log('✅ Claim Submitted');
      // Simulate progress completion UI
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setShowSuccessModal(true);
            setUploadProgress(0);
          }, 300);
        }
      }, 120);
    } catch (err) {
      console.error('❌ Claim submission failed', err);
      setIsUploading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
        <FloatingOrbs />
        <Navbar
          user={{
            name: farmerInfo.name,
            role: 'Farmer',
          }}
          notificationsList={notifications}
          onNotificationsChange={setNotifications}
        />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackButton className="mb-6" />

        {/* Welcome Header */}
        <div className="mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-0">
            <WheatIcon className="w-3 h-3 mr-1" />
            Welcome Back
          </Badge>
          <h1 className="mb-2">Hello, {farmerInfo.name}! 👋</h1>
          <Button variant="outline" onClick={() => setShowUserInfo(!showUserInfo)}>
            {showUserInfo ? 'Hide' : 'View'} My Information
          </Button>
        </div>

        {/* User Info Card */}
        {showUserInfo && (
          <Card className="mb-8 glassmorphic shadow-lg">
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{farmerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{farmerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aadhar</p>
                  <p>{farmerInfo.aadhar}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Land Area</p>
                  <p>{farmerInfo.landArea}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{farmerInfo.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Land Type</p>
                  <p>{farmerInfo.landType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p>{farmerInfo.registrationDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glassmorphic shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl gradient-text">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Claims Table */}
        <Card className="glassmorphic shadow-lg">
          <CardHeader>
            <CardTitle>My Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Crop Type</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Loss Date</TableHead>
                    <TableHead>Damage %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono">{claim.id}</TableCell>
                      <TableCell>{claim.cropType}</TableCell>
                      <TableCell>{claim.cause}</TableCell>
                      <TableCell>{claim.date}</TableCell>
                      <TableCell>{claim.damagePercent}%</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell>{claim.submittedDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewClaim(claim)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowNewClaimModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform group"
        >
          <Plus className="w-8 h-8" />
          <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            New Claim
          </span>
        </button>
      </div>

      {/* New Claim Modal */}
      <Dialog open={showNewClaimModal} onOpenChange={setShowNewClaimModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit New Claim</DialogTitle>
            <DialogDescription>Fill in the details of your agricultural loss claim</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitClaim}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Input id="cropType" placeholder="e.g., Wheat, Rice" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lossDate">Loss Date *</Label>
                  <Input id="lossDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cause">Cause of Loss *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drought">Drought</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="pest">Pest Attack</SelectItem>
                    <SelectItem value="disease">Disease</SelectItem>
                    <SelectItem value="hail">Hailstorm</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Damage Percentage: {damagePercent[0]}%</Label>
                <Slider
                  value={damagePercent}
                  onValueChange={setDamagePercent}
                  max={100}
                  step={5}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the loss in detail..."
                  className="min-h-24"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageLinks">Google Drive Link - Images *</Label>
                <Textarea
                  id="imageLinks"
                  placeholder="Paste Google Drive share link for images of damaged crops"
                  className="min-h-20"
                  required
                />
                <p className="text-xs text-gray-500">Share a Google Drive folder link containing images of the damaged crops</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentLinks">Google Drive Link - Documents</Label>
                <Textarea
                  id="documentLinks"
                  placeholder="Paste Google Drive share link for supporting documents (optional)"
                  className="min-h-20"
                />
                <p className="text-xs text-gray-500">Share a Google Drive folder link containing any supporting documents</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewClaimModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-bg">
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Modal */}
      <Dialog open={isUploading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle className="sr-only">Uploading Claim</DialogTitle>
            <DialogDescription className="sr-only">Please wait while we process your submission</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2">Uploading your claim...</h3>
            <p className="text-sm text-gray-600 mb-4">Please wait while we process your submission</p>
            <Progress value={uploadProgress} className="mb-2" />
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">Claim Submitted Successfully</DialogTitle>
            <DialogDescription className="sr-only">Your claim has been submitted and is now under review</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2">Claim Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">Your claim has been submitted and is now under review.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Claim ID</p>
                  <p className="font-mono">CL2024004</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Submitted On</p>
                  <p>November 4, 2025</p>
                </div>
              </div>
            </div>
            <Button className="w-full gradient-bg" onClick={() => setShowSuccessModal(false)}>
              View My Claims
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Details Modal */}
      <Dialog open={showClaimDetails} onOpenChange={setShowClaimDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>Complete information about your submitted claim</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6 py-4">
              {/* Claim Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Claim ID</p>
                    <p className="font-mono">{selectedClaim.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted On</p>
                    <p>{selectedClaim.submittedDate}</p>
                  </div>
                </div>
              </div>

              {/* Crop and Loss Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Crop Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Crop Type</p>
                      <p>{selectedClaim.cropType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cause of Loss</p>
                      <p>{selectedClaim.cause}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Loss Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p>{selectedClaim.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Damage Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Damage Percentage</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedClaim.damagePercent} className="flex-1" />
                        <span>{selectedClaim.damagePercent}%</span>
                      </div>
                    </div>
                    {selectedClaim.estimatedLoss && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Loss</p>
                        <p className="text-lg gradient-text">{selectedClaim.estimatedLoss}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{selectedClaim.description}</p>
                </CardContent>
              </Card>

              {/* Documents and Images */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Images - Damaged Crop Photos</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <a 
                        href={selectedClaim.imageLinks} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {selectedClaim.imageLinks}
                      </a>
                    </div>
                  </div>
                  {selectedClaim.documentLinks && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Supporting Documents</p>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <a 
                          href={selectedClaim.documentLinks} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm break-all"
                        >
                          {selectedClaim.documentLinks}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Remarks/Status Updates */}
              {selectedClaim.remarks && (
                <Card className={`border-2 ${
                  selectedClaim.status === 'approved' 
                    ? 'border-green-200 bg-green-50' 
                    : selectedClaim.status === 'rejected'
                    ? 'border-red-200 bg-red-50'
                    : selectedClaim.status === 'under-review'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-blue-200 bg-blue-50'
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {selectedClaim.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {selectedClaim.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                      {selectedClaim.status === 'under-review' && <Clock className="w-4 h-4 text-orange-600" />}
                      {selectedClaim.status === 'submitted' && <FileText className="w-4 h-4 text-blue-600" />}
                      Official Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${
                      selectedClaim.status === 'approved' 
                        ? 'text-green-800' 
                        : selectedClaim.status === 'rejected'
                        ? 'text-red-800'
                        : selectedClaim.status === 'under-review'
                        ? 'text-orange-800'
                        : 'text-blue-800'
                    }`}>
                      {selectedClaim.remarks}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowClaimDetails(false)} className="gradient-bg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageTransition>
  );
}
