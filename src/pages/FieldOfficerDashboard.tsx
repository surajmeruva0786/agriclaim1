import { useEffect, useState } from 'react';
import { MapPin, Camera, Upload, CheckCircle2, XCircle, FileText, ExternalLink, User, Phone, Mail, Home, CreditCard, Sprout, Eye, FileCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { Claim } from '../types/claim';
import { getDb, serverTimestamp, arrayUnion, sendClaimStatusNotificationToFarmer, recomputeAndStoreFarmerCounters, recomputeAndStoreRoleCounters } from '../lib/firebaseCompat';
import { useAuth } from '../contexts/AuthContext';

type FieldClaimStatus = 'pending-inspection' | 'inspected' | 'rejected' | 'forwarded';

type FieldClaim = Claim & {
  status: FieldClaimStatus;
  location?: string;
  area?: string;
  claimedDamage: number;
  verifiedDamage?: number;
  farmerId?: string;
};

const normalizeFieldStatus = (rawStatus?: string): FieldClaimStatus => {
  const status = (rawStatus || '').trim().toLowerCase();
  if (!status) return 'pending-inspection';

  if (['rejected', 'declined'].includes(status)) {
    return 'rejected';
  }

  if (
    [
      'field verified',
      'field-verified',
      'inspected',
      'inspection complete',
      'forwarded to revenue',
      'forwarded-revenue',
    ].includes(status)
  ) {
    return 'inspected';
  }

  if (['forwarded', 'revenue', 'revenue stage', 'awaiting revenue'].includes(status)) {
    return 'forwarded';
  }

  return 'pending-inspection';
};

export default function FieldOfficerDashboard() {
  const { user } = useAuth();
  const [selectedClaim, setSelectedClaim] = useState<FieldClaim | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verifiedDamage, setVerifiedDamage] = useState([50]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-f1',
      type: 'warning',
      title: 'Urgent Inspection Required',
      message: 'Claim CL2024101 requires immediate field inspection. Farmer reported severe crop damage.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-f2',
      type: 'info',
      title: 'Inspection Scheduled',
      message: '3 field inspections scheduled for tomorrow. Check your schedule for details.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-f3',
      type: 'success',
      title: 'Inspection Report Approved',
      message: 'Your inspection report for claim CL2024099 has been approved by the revenue officer.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const [officerInfo, setOfficerInfo] = useState({
    name: 'Field Officer',
    role: 'Field Officer',
    department: 'Field Operations',
    accessLevel: 'Field Inspection',
    loginTime: new Date().toLocaleString(),
    phone: '',
    email: '',
    address: '',
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem('officialProfile');
      if (!raw) return;
      const prof = JSON.parse(raw || '{}');
      setOfficerInfo((prev) => ({
        ...prev,
        name: prof.displayName || prev.name,
        role: 'Field Officer',
        department: prof.department || prev.department,
        phone: prof.phone || '',
        email: prof.email || '',
        address: prof.address || '',
      }));
    } catch (_) {}
  }, []);
  const [claims, setClaims] = useState<FieldClaim[]>([]);

  useEffect(() => {
    const db = getDb();
    const unsub = db
      .collection('claims')
      .where('stage', '==', 'field')
      .onSnapshot(async (snap: any) => {
        const listPromises: Promise<FieldClaim>[] = [];
        snap.forEach((d: any) => {
          const data = d.data();
          const farmerId = data.farmerId;
          const build = async (): Promise<FieldClaim> => {
            let farmerProfile: any = {};
            try {
              if (farmerId) {
                const udoc = await db.collection('users').doc(farmerId).get();
                if (udoc.exists) farmerProfile = udoc.data() || {};
              }
            } catch (_) {}

            const docs: any[] = [];
            if (data.imageLinks) {
              docs.push({ name: 'Crop Damage Images', url: data.imageLinks, type: 'image' });
            }
            if (data.documentLinks) {
              docs.push({ name: 'Supporting Documents', url: data.documentLinks, type: 'pdf' });
            }
            if (Array.isArray(data.documents)) {
              data.documents.forEach((x: any) => {
                docs.push({ name: x.name || 'Document', url: x.url || '', type: x.type || 'link' });
              });
            }

            return {
              id: d.id,
              farmerId,
              farmerName: farmerProfile.name || data.farmerName || 'Farmer',
              farmerContact: farmerProfile.phone || data.farmerContact || '',
              farmerEmail: farmerProfile.email || data.farmerEmail || '',
              farmerAddress: farmerProfile.address || data.farmerAddress || '',
              farmerAadhaar: farmerProfile.aadhar || data.aadhar || '',
              farmerBankAccount: farmerProfile.bank || data.bank || '',
              cropType: data.cropType,
              cropVariety: data.cropVariety || '',
              areaAffected: data.areaAffected || 0,
              cause: data.cause,
              lossDate: data.lossDate,
              damagePercent: data.damagePercent || 0,
              submittedDate: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : '',
              status: normalizeFieldStatus(data.status),
              description: data.description || '',
              documents: docs,
              verifierRemarks: data.verifierRemarks,
              location: data.location || '',
              area: data.area || '',
              claimedDamage: data.damagePercent || 0,
              verifiedDamage: data.verifiedDamagePercent || data.damagePercent || 0,
            } as FieldClaim;
          };
          listPromises.push(build());
        });
        const list = await Promise.all(listPromises);
        setClaims(list);
      });
    return () => unsub && unsub();
  }, []);

  const stats = [
    { label: 'Pending Inspection', value: claims.filter(c => c.status === 'pending-inspection').length, icon: MapPin, color: 'from-orange-500 to-yellow-500' },
    { label: 'Inspected Today', value: claims.filter(c => c.status === 'inspected').length, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { label: 'Forwarded', value: claims.filter(c => c.status === 'forwarded').length, icon: Upload, color: 'from-blue-500 to-cyan-500' },
    { label: 'Rejected', value: claims.filter(c => c.status === 'rejected').length, icon: XCircle, color: 'from-red-500 to-pink-500' },
  ];

  const handleInspection = (claim: Claim) => {
    setSelectedClaim(claim);
    setVerifiedDamage([claim.claimedDamage]);
    setShowInspectionModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate photo upload
      const newPhotos = Array.from(files).map(() => 
        `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop`
      );
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    }
  };

  const submitInspection = async () => {
    if (!selectedClaim) return;
    const db = getDb();
    const claimRef = db.collection('claims').doc(selectedClaim.id);
    const findingsEl = document.getElementById('findings') as HTMLTextAreaElement | null;
    const findings = findingsEl?.value?.trim() || 'Field inspection completed';
    await claimRef.update({
      status: 'Field Verified',
      stage: 'revenue',
      updatedAt: serverTimestamp(),
      latestRemark: findings,
      verifiedDamagePercent: verifiedDamage[0],
      fieldOfficerRemarks: {
        status: 'forwarded',
        remarks: findings,
        inspectedBy: officerInfo.name || 'Field Officer',
        inspectionDate: new Date().toISOString(),
        fieldVisitCompleted: true,
        actualDamagePercent: verifiedDamage[0],
        fieldPhotos: uploadedPhotos,
      },
      history: arrayUnion({
        at: new Date().toISOString(),
        by: user?.uid || 'system',
        action: 'Field Verified and Forwarded',
        role: 'FieldOfficer',
      }),
    });
    await sendClaimStatusNotificationToFarmer({
      farmerId: selectedClaim.farmerId,
      claimId: selectedClaim.id,
      title: 'Field Inspection Completed',
      message: `Your claim ${selectedClaim.id} has been inspected. Verified damage: ${verifiedDamage[0]}%. It is now with the Revenue Officer for assessment.`,
      type: 'success',
      statusLabel: 'Field Inspection Complete',
    });
    await recomputeAndStoreFarmerCounters(selectedClaim.farmerId);
    await recomputeAndStoreRoleCounters('field');
    await recomputeAndStoreRoleCounters('revenue');
    toast.success('Inspection report submitted and forwarded to Revenue Officer');
    setShowInspectionModal(false);
    setSelectedClaim(null);
    setUploadedPhotos([]);
  };

  const rejectClaim = async () => {
    if (!selectedClaim) return;
    const db = getDb();
    const claimRef = db.collection('claims').doc(selectedClaim.id);
    await claimRef.update({
      status: 'Rejected',
      stage: 'rejected',
      updatedAt: serverTimestamp(),
      latestRemark: 'Rejected by Field Officer',
      history: arrayUnion({
        at: new Date().toISOString(),
        by: user?.uid || 'system',
        action: 'Rejected',
        role: 'FieldOfficer',
      }),
    });
    await sendClaimStatusNotificationToFarmer({
      farmerId: selectedClaim.farmerId,
      claimId: selectedClaim.id,
      title: 'Claim Rejected After Field Inspection',
      message: `Your claim ${selectedClaim.id} was rejected by the Field Officer during inspection. Please review the remarks and contact support for assistance.`,
      type: 'error',
      statusLabel: 'Rejected at Field Inspection',
    });
    await recomputeAndStoreFarmerCounters(selectedClaim.farmerId);
    await recomputeAndStoreRoleCounters('field');
    toast.success('Claim rejected');
    setShowInspectionModal(false);
    setSelectedClaim(null);
  };

  const getStatusBadge = (status: FieldClaimStatus) => {
    const configs = {
      'pending-inspection': { label: 'Pending Inspection', className: 'bg-orange-100 text-orange-700' },
      'inspected': { label: 'Inspection Complete', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
      'forwarded': { label: 'Forwarded', className: 'bg-blue-100 text-blue-700' },
    } as Record<FieldClaimStatus, { label: string; className: string }>;
    const cfg = configs[status] || configs['pending-inspection'];
    return <Badge className={cfg.className}>{cfg.label}</Badge>;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
        <FloatingOrbs />
        <Navbar
          user={{
            name: officerInfo.name,
            role: officerInfo.role,
          }}
          notificationsList={notifications}
          onNotificationsChange={setNotifications}
        />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="mb-2">Field Officer Portal</h1>
          <p className="text-gray-600">Conduct on-site inspections and verify agricultural losses</p>
        </div>

        {/* Officer Info Card */}
        <Card className="glassmorphic shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <Badge className="mb-1 bg-green-100 text-green-700">Field Officer Portal</Badge>
                <h3>{officerInfo.name}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Role</p>
                <p>{officerInfo.role}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p>{officerInfo.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Access Level</p>
                <p>{officerInfo.accessLevel}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Last Login</p>
                <p>{officerInfo.loginTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glassmorphic shadow-lg">
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

        {/* Claims for Inspection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <Card key={claim.id} className="glassmorphic shadow-lg card-hover">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono">{claim.id}</span>
                  {getStatusBadge(claim.status)}
                </div>
                <CardTitle className="text-lg">{claim.farmerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{claim.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact:</span>
                    <span>{claim.farmerContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crop Type:</span>
                    <span>{claim.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loss Cause:</span>
                    <span>{claim.cause}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Area:</span>
                    <span>{claim.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Claimed Damage:</span>
                    <span className="font-semibold text-orange-600">{claim.claimedDamage}%</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  {claim.status === 'pending-inspection' && (
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      onClick={() => handleInspection(claim)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Field Visit
                    </Button>
                  )}
                  {claim.status === 'inspected' && (
                    <Badge className="w-full justify-center bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Inspection Modal */}
      <Dialog open={showInspectionModal} onOpenChange={setShowInspectionModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Field Inspection Report</DialogTitle>
            <DialogDescription>Document your on-site inspection findings</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="py-4 space-y-6">
              {/* Claim Info */}
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Claim ID</p>
                  <p className="font-mono">{selectedClaim.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Farmer</p>
                  <p>{selectedClaim.farmerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Crop Type</p>
                  <p>{selectedClaim.cropType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Area</p>
                  <p>{selectedClaim.area}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Location</p>
                  <p>{selectedClaim.location}</p>
                </div>
              </div>

              {/* Inspection Findings */}
              <div className="space-y-2">
                <Label htmlFor="findings">Inspection Findings *</Label>
                <Textarea
                  id="findings"
                  placeholder="Describe your observations from the field visit..."
                  className="min-h-32"
                  required
                />
              </div>

              {/* Damage Verification */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Verified Damage Percentage</Label>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Claimed: {selectedClaim.claimedDamage}%</div>
                    <div className="text-lg gradient-text">Verified: {verifiedDamage[0]}%</div>
                  </div>
                </div>
                <Slider
                  value={verifiedDamage}
                  onValueChange={setVerifiedDamage}
                  max={100}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label>Field Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload field photos</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img src={photo} alt={`Field photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <Label htmlFor="recommendation">Recommendation *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve-full">Approve Full Claim</SelectItem>
                    <SelectItem value="approve-partial">Approve Partial Claim</SelectItem>
                    <SelectItem value="reject">Reject Claim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInspectionModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectClaim}>
              Reject Claim
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={submitInspection}>
              Submit Report & Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Claim Details - {selectedClaim?.id}
            </DialogTitle>
            <DialogDescription>Complete claim information including document verification</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            {selectedClaim && (
              <div className="space-y-6">
                {/* Farmer Personal Information */}
                <div>
                  <h3 className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4" />
                    Farmer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm">{selectedClaim.farmerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Contact Number
                      </p>
                      <p className="text-sm">{selectedClaim.farmerContact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email Address
                      </p>
                      <p className="text-sm">{selectedClaim.farmerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Aadhaar Number</p>
                      <p className="text-sm font-mono">{selectedClaim.farmerAadhaar}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Home className="w-3 h-3" /> Address
                      </p>
                      <p className="text-sm">{selectedClaim.farmerAddress}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Bank Account
                      </p>
                      <p className="text-sm">{selectedClaim.farmerBankAccount}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Crop & Loss Details */}
                <div>
                  <h3 className="flex items-center gap-2 mb-3">
                    <Sprout className="w-4 h-4" />
                    Crop & Damage Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Crop Type</p>
                      <p className="text-sm">{selectedClaim.cropType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Crop Variety</p>
                      <p className="text-sm">{selectedClaim.cropVariety}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area Affected</p>
                      <p className="text-sm">{selectedClaim.areaAffected} acres</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Claimed Damage %</p>
                      <p className="text-sm text-orange-600">{selectedClaim.damagePercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Loss Cause</p>
                      <p className="text-sm">{selectedClaim.cause}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Loss Date</p>
                      <p className="text-sm">{selectedClaim.lossDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm bg-white rounded p-2">{selectedClaim.description}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Supporting Documents */}
                <div>
                  <h3 className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" />
                    Supporting Documents ({selectedClaim.documents.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">{doc.type.toUpperCase()}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Verifier Remarks */}
                {selectedClaim.verifierRemarks && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="flex items-center gap-2 mb-3">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        Document Verification Report
                      </h3>
                      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Verified By</p>
                            <p>{selectedClaim.verifierRemarks.verifiedBy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Verification Date</p>
                            <p>{selectedClaim.verifierRemarks.verifiedDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Documents Status</p>
                            <Badge className={selectedClaim.verifierRemarks.documentsVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {selectedClaim.verifierRemarks.documentsVerified ? 'Verified' : 'Not Verified'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Action Taken</p>
                            <Badge className="bg-blue-100 text-blue-700">
                              {selectedClaim.verifierRemarks.status === 'forwarded' ? 'Forwarded to Field Officer' : selectedClaim.verifierRemarks.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Verifier's Remarks</p>
                          <p className="text-sm bg-white rounded p-2">{selectedClaim.verifierRemarks.remarks}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageTransition>
  );
}
