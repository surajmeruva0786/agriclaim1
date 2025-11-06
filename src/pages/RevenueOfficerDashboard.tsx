import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle2, XCircle, TrendingUp, FileText, AlertTriangle, Eye, User, Phone, Mail, Home, CreditCard, Sprout, MapPin, ExternalLink, FileCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { Claim } from '../types/claim';

export default function RevenueOfficerDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [officerName, setOfficerName] = useState<string>('Revenue Officer');
  const [officerDept, setOfficerDept] = useState<string>('Revenue Assessment');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [compensationAmount, setCompensationAmount] = useState([100000]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-r1',
      type: 'warning',
      title: 'High Value Claim',
      message: 'Claim CL2024101 exceeds ₹1,50,000. Additional approval may be required.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-r2',
      type: 'info',
      title: 'New Inspection Reports',
      message: '4 new field inspection reports are awaiting your review and approval.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-r3',
      type: 'success',
      title: 'Claims Processed',
      message: 'Your approved claims for this week have been forwarded to the Treasury Officer.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-r4',
      type: 'error',
      title: 'Budget Alert',
      message: 'Monthly claim budget is at 85% utilization. Please review pending approvals.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 'CL2024103',
      farmerName: 'Mahesh Kumar',
      farmerContact: '+91 98765 33333',
      farmerEmail: 'mahesh.kumar@email.com',
      farmerAddress: 'Village Dewas, Tehsil Dewas, District Dewas, Madhya Pradesh - 455001',
      farmerAadhaar: '3456 7890 1234',
      farmerBankAccount: 'ICICI Bank - 60300234567890',
      cropType: 'Cotton',
      cropVariety: 'Bt Cotton Hybrid',
      areaAffected: 6.5,
      cause: 'Pest Attack',
      lossDate: '2024-08-05',
      damagePercent: 45,
      submittedDate: '2024-08-07',
      status: 'forwarded',
      description: 'Bollworm infestation damaged a significant portion of the cotton crop. Despite pesticide application, the pest attack was severe during flowering stage.',
      documents: [
        { name: 'Land Records.pdf', url: 'https://drive.google.com/file/land-mahesh', type: 'pdf' },
        { name: 'Pest Damage Photos.jpg', url: 'https://drive.google.com/file/pest-damage', type: 'image' },
        { name: 'Pesticide Bills.pdf', url: 'https://drive.google.com/file/pesticide-bills', type: 'pdf' },
      ],
      verifierRemarks: {
        status: 'forwarded',
        remarks: 'All documents verified. Land records and farmer identity confirmed. Forwarding to field officer for physical inspection.',
        verifiedBy: 'Dr. Anjali Verma',
        verifiedDate: '2024-08-08',
        documentsVerified: true,
      },
      fieldOfficerRemarks: {
        status: 'forwarded',
        remarks: 'Field inspection completed. Pest damage confirmed on site. Bollworm infestation visible on 40% of the crop. Farmer has taken preventive measures. Forwarding to Revenue Officer for compensation assessment.',
        inspectedBy: 'Mr. Vikram Singh',
        inspectionDate: '2024-08-10',
        fieldVisitCompleted: true,
        actualDamagePercent: 40,
        gpsCoordinates: '23.8103° N, 75.8472° E',
        fieldPhotos: ['field_inspection_1.jpg', 'field_inspection_2.jpg'],
      },
    },
  ]);

  const stats = [
    {
      label: 'Pending Review',
      value: claims.filter(c => c.status === 'pending-review').length,
      icon: FileText,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      label: 'Approved Today',
      value: claims.filter(c => c.status === 'approved').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Rejected',
      value: claims.filter(c => c.status === 'rejected').length,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
    },
    {
      label: 'Total Forwarded Amount',
      value: `₹${(claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.estimatedAmount || 0), 0) / 100000).toFixed(1)}L`,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const handleProcess = (claim: Claim) => {
    setSelectedClaim(claim);
    setCompensationAmount([claim.estimatedAmount || 100000]);
    setShowProcessModal(true);
  };

  const handleReject = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const approveAndForward = () => {
    if (!selectedClaim) return;

    setClaims(claims.map(c =>
      c.id === selectedClaim.id
        ? { ...c, status: 'approved', estimatedAmount: compensationAmount[0] }
        : c
    ));

    toast.success(`Claim approved with ₹${compensationAmount[0].toLocaleString()} compensation`);
    setShowProcessModal(false);
    setSelectedClaim(null);
  };

  const confirmReject = () => {
    if (!selectedClaim) return;

    setClaims(claims.map(c =>
      c.id === selectedClaim.id ? { ...c, status: 'rejected' } : c
    ));

    toast.success('Claim rejected');
    setShowRejectModal(false);
    setSelectedClaim(null);
  };

  const getStatusBadge = (status: Claim['status']) => {
    const configs = {
      'pending-review': { label: 'Pending Review', className: 'bg-orange-100 text-orange-700' },
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('officialProfile');
      if (!raw) return;
      const prof = JSON.parse(raw || '{}');
      if (prof.displayName) setOfficerName(prof.displayName);
      if (prof.department) setOfficerDept(prof.department);
    } catch (_) {}
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
        <FloatingOrbs />
        <Navbar
          user={{
            name: officerName,
            role: officerDept,
          }}
          notificationsList={notifications}
          onNotificationsChange={setNotifications}
        />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="mb-2">Revenue Officer Dashboard</h1>
          <p className="text-gray-600">Review field inspections and calculate compensation amounts</p>
        </div>

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

        {/* Claims for Processing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <Card key={claim.id} className="glassmorphic shadow-lg card-hover">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono">{claim.id}</span>
                  {getStatusBadge(claim.status)}
                </div>
                <CardTitle className="text-lg">{claim.farmerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crop Type:</span>
                    <span>{claim.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Land Area:</span>
                    <span>{claim.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Claimed Damage:</span>
                    <span className="text-orange-600">{claim.claimedDamage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified Damage:</span>
                    <span className="text-green-600">{claim.verifiedDamage}%</span>
                  </div>
                  {claim.estimatedAmount && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-500">Estimated Compensation:</span>
                      <span className="text-xl gradient-text">₹{claim.estimatedAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Field Officer Notes:</p>
                  <p className="text-sm">{claim.fieldOfficerNotes}</p>
                </div>

                {/* Timeline */}
                <div className="relative pl-8 pb-2">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
                  {['Submitted', 'Verified', 'Inspected', 'Under Review'].map((step, idx) => (
                    <div key={idx} className="relative mb-3 last:mb-0">
                      <div className="absolute -left-[17px] w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
                      <p className="text-xs text-gray-600">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t">
                  {claim.status === 'pending-review' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(claim)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        onClick={() => handleProcess(claim)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Process
                      </Button>
                    </div>
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

      {/* Processing Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Calculate & Approve Compensation
            </DialogTitle>
            <DialogDescription>Determine the final compensation amount</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="py-4 space-y-6">
              {/* Claim Summary */}
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
                  <p className="text-gray-500">Land Area</p>
                  <p>{selectedClaim.area}</p>
                </div>
                <div>
                  <p className="text-gray-500">Verified Damage</p>
                  <p className="text-green-600">{selectedClaim.verifiedDamage}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Field Inspection</p>
                  <Badge className="bg-green-100 text-green-700">Complete</Badge>
                </div>
              </div>

              {/* Compensation Calculator */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount">Compensation Amount</Label>
                    <div className="text-2xl gradient-text">₹{compensationAmount[0].toLocaleString()}</div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
                    <Input
                      id="amount"
                      type="number"
                      value={compensationAmount[0]}
                      onChange={(e) => setCompensationAmount([parseInt(e.target.value) || 0])}
                      className="pl-8 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>₹0</span>
                    <span>₹{Math.round((selectedClaim.estimatedAmount || 100000) / 2).toLocaleString()}</span>
                    <span>₹{(selectedClaim.estimatedAmount || 100000).toLocaleString()}</span>
                  </div>
                  <Slider
                    value={compensationAmount}
                    onValueChange={setCompensationAmount}
                    max={selectedClaim.estimatedAmount || 100000}
                    step={1000}
                    className="py-4"
                  />
                  <p className="text-xs text-gray-500">
                    Adjust the slider or enter amount manually. Recommended: ₹{(selectedClaim.estimatedAmount || 100000).toLocaleString()}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Calculation based on crop type, area, verified damage, and current market rates
                  </p>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any remarks about the compensation calculation..."
                  className="min-h-24"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowProcessModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              onClick={approveAndForward}
            >
              Approve & Forward to Treasury
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reject Claim
            </DialogTitle>
            <DialogDescription>This action will reject the claim permanently</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="py-4 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p>You are about to reject claim {selectedClaim.id} for {selectedClaim.farmerName}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reject-reason">Reason for Rejection *</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Provide detailed reason for rejecting this claim..."
                  className="min-h-32"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirm Rejection
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
            <DialogDescription>Complete claim information with verification and inspection reports</DialogDescription>
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

                {/* Field Officer Inspection Report */}
                {selectedClaim.fieldOfficerRemarks && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-green-600" />
                        Field Inspection Report
                      </h3>
                      <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Inspected By</p>
                            <p>{selectedClaim.fieldOfficerRemarks.inspectedBy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Inspection Date</p>
                            <p>{selectedClaim.fieldOfficerRemarks.inspectionDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Field Visit Status</p>
                            <Badge className={selectedClaim.fieldOfficerRemarks.fieldVisitCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {selectedClaim.fieldOfficerRemarks.fieldVisitCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Actual Damage %</p>
                            <p className="text-orange-600">{selectedClaim.fieldOfficerRemarks.actualDamagePercent}%</p>
                          </div>
                          {selectedClaim.fieldOfficerRemarks.gpsCoordinates && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> GPS Coordinates
                              </p>
                              <p className="text-sm font-mono">{selectedClaim.fieldOfficerRemarks.gpsCoordinates}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Action Taken</p>
                            <Badge className="bg-green-100 text-green-700">
                              {selectedClaim.fieldOfficerRemarks.status === 'forwarded' ? 'Forwarded to Revenue Officer' : selectedClaim.fieldOfficerRemarks.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Field Officer's Remarks</p>
                          <p className="text-sm bg-white rounded p-2">{selectedClaim.fieldOfficerRemarks.remarks}</p>
                        </div>
                        {selectedClaim.fieldOfficerRemarks.fieldPhotos && selectedClaim.fieldOfficerRemarks.fieldPhotos.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Field Photos ({selectedClaim.fieldOfficerRemarks.fieldPhotos.length})</p>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedClaim.fieldOfficerRemarks.fieldPhotos.map((photo, idx) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-green-600" />
                                  {photo}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
