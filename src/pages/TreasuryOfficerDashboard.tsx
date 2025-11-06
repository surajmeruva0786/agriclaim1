import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, XCircle, DollarSign, Clock, FileCheck, Calendar, Eye, User, Phone, Mail, Home, CreditCard, Sprout, MapPin, FileText, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { Claim } from '../types/claim';

export default function TreasuryOfficerDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [officerName, setOfficerName] = useState<string>('Treasury Officer');
  const [officerDept, setOfficerDept] = useState<string>('Treasury & Payments');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verificationChecklist, setVerificationChecklist] = useState({
    bankDetails: false,
    compensationAmount: false,
    documentation: false,
    authorization: false,
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-t1',
      type: 'warning',
      title: 'Payment Approval Required',
      message: '2 high-value claims (>₹2,00,000) require immediate payment approval.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-t2',
      type: 'info',
      title: 'Payment Queue',
      message: '5 approved claims are in the payment queue awaiting final authorization.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-t3',
      type: 'success',
      title: 'Payment Processed',
      message: 'Payment of ₹1,65,000 for claim CL2024099 has been successfully credited.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-t4',
      type: 'info',
      title: 'Monthly Report',
      message: 'Monthly disbursement report is ready for review. Total: ₹45,67,890.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
      revenueOfficerRemarks: {
        status: 'forwarded',
        remarks: 'Compensation assessment completed. Based on 40% damage to 6.5 acres of Bt Cotton, calculated compensation at ₹18,500 per acre with damage adjustment. Total approved amount: ₹120,000. Forwarding to Treasury for final payment approval.',
        assessedBy: 'Mr. Rajesh Gupta',
        assessmentDate: '2024-08-12',
        compensationAmount: 120000,
        calculationBasis: 'Base rate: ₹18,500/acre × 6.5 acres × 40% damage = ₹48,100 (rounded to ₹120,000 including support provisions)',
      },
    },
  ]);

  const stats = [
    {
      label: 'Pending Approval',
      value: claims.filter(c => c.status === 'pending-payment').length,
      icon: Clock,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      label: 'Approved Today',
      value: claims.filter(c => c.status === 'approved' && c.approvedDate === '2024-11-04').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Disbursed',
      value: `₹${(claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.compensationAmount, 0) / 100000).toFixed(1)}L`,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Rejected',
      value: claims.filter(c => c.status === 'rejected').length,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
    },
  ];

  const handleApprove = (claim: Claim) => {
    setSelectedClaim(claim);
    setVerificationChecklist({
      bankDetails: false,
      compensationAmount: false,
      documentation: false,
      authorization: false,
    });
    setShowApprovalModal(true);
  };

  const handleViewHistory = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowHistoryModal(true);
  };

  const confirmApproval = () => {
    if (!selectedClaim) return;

    const allChecked = Object.values(verificationChecklist).every(v => v);
    if (!allChecked) {
      toast.error('Please complete all verification checks');
      return;
    }

    setClaims(claims.map(c =>
      c.id === selectedClaim.id
        ? { ...c, status: 'approved', approvedDate: '2024-11-04' }
        : c
    ));

    toast.success(`Payment of ₹${selectedClaim.compensationAmount.toLocaleString()} approved`);
    setShowApprovalModal(false);
    setSelectedClaim(null);
  };

  const getStatusBadge = (status: Claim['status']) => {
    const configs = {
      'pending-payment': { label: 'Pending Payment', className: 'bg-orange-100 text-orange-700' },
      'approved': { label: 'Payment Approved', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  const claimHistory = [
    {
      stage: 'Claim Submitted',
      officer: 'Ramesh Sharma (Farmer)',
      timestamp: '2024-10-20 10:30 AM',
      status: 'completed',
      notes: 'Initial claim submission with all required documents',
    },
    {
      stage: 'Document Verification',
      officer: 'Dr. Anjali Verma (Verifier)',
      timestamp: '2024-10-21 02:15 PM',
      status: 'completed',
      notes: 'All documents verified and approved',
    },
    {
      stage: 'Field Inspection',
      officer: 'Mr. Vikram Singh (Field Officer)',
      timestamp: '2024-10-23 11:00 AM',
      status: 'completed',
      notes: 'On-site inspection completed. Damage verified at 60%',
    },
    {
      stage: 'Revenue Assessment',
      officer: 'Mrs. Priya Desai (Revenue Officer)',
      timestamp: '2024-10-25 03:45 PM',
      status: 'completed',
      notes: 'Compensation calculated and approved: ₹1,65,000',
    },
    {
      stage: 'Payment Processing',
      officer: 'Mr. Arun Mehta (Treasury Officer)',
      timestamp: 'Pending',
      status: 'current',
      notes: 'Awaiting final approval for disbursement',
    },
  ];

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
          <h1 className="mb-2">Treasury Officer Dashboard</h1>
          <p className="text-gray-600">Review and approve final payments for agricultural loss claims</p>
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

        {/* Payment Queue */}
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
                {/* Compensation Amount - Prominent */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 text-center border-2 border-primary/20">
                  <p className="text-sm text-gray-600 mb-1">Compensation Amount</p>
                  <p className="text-3xl gradient-text">₹{claim.compensationAmount.toLocaleString()}</p>
                </div>

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crop Type:</span>
                    <span>{claim.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified Damage:</span>
                    <span className="text-green-600">{claim.verifiedDamage}%</span>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Details
                  </p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-mono">{claim.bankAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IFSC:</span>
                    <span className="font-mono">{claim.ifsc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank:</span>
                    <span>{claim.bankName}</span>
                  </div>
                </div>

                {/* Revenue Assessment */}
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Revenue Officer Assessment
                  </p>
                  <p className="text-blue-900">{claim.revenueOfficerNotes}</p>
                </div>

                {/* Timeline */}
                <div className="relative pl-8 pb-2">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
                  {['Submitted', 'Verified', 'Inspected', 'Assessed', 'Treasury Review'].map((step, idx) => (
                    <div key={idx} className="relative mb-3 last:mb-0">
                      <div className={`absolute -left-[17px] w-4 h-4 rounded-full ${idx < 4 ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-primary to-secondary'}`}></div>
                      <p className="text-xs text-gray-600">{step}</p>
                    </div>
                  ))}
                </div>

                {claim.status === 'pending-payment' && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleViewHistory(claim)}
                    >
                      View History
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      onClick={() => handleApprove(claim)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Payment
                    </Button>
                  </div>
                )}

                {claim.status === 'approved' && claim.approvedDate && (
                  <div className="pt-3 border-t text-center">
                    <Badge className="bg-green-100 text-green-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      Approved on {claim.approvedDate}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Approve Payment
            </DialogTitle>
            <DialogDescription>Verify all details before approving payment</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="py-4 space-y-6">
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-2">Payment Amount</p>
                <p className="text-4xl gradient-text">₹{selectedClaim.compensationAmount.toLocaleString()}</p>
              </div>

              {/* Farmer & Bank Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Beneficiary Name</p>
                  <p className="font-semibold">{selectedClaim.farmerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Claim ID</p>
                  <p className="font-mono">{selectedClaim.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bank Account</p>
                  <p className="font-mono">{selectedClaim.bankAccount}</p>
                </div>
                <div>
                  <p className="text-gray-500">IFSC Code</p>
                  <p className="font-mono">{selectedClaim.ifsc}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Bank Name</p>
                  <p>{selectedClaim.bankName}</p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <Label>Verification Checklist</Label>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="bank-details"
                      checked={verificationChecklist.bankDetails}
                      onCheckedChange={(checked) =>
                        setVerificationChecklist({ ...verificationChecklist, bankDetails: checked as boolean })
                      }
                    />
                    <label htmlFor="bank-details" className="text-sm cursor-pointer">
                      Bank account details verified and correct
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="compensation"
                      checked={verificationChecklist.compensationAmount}
                      onCheckedChange={(checked) =>
                        setVerificationChecklist({ ...verificationChecklist, compensationAmount: checked as boolean })
                      }
                    />
                    <label htmlFor="compensation" className="text-sm cursor-pointer">
                      Compensation amount approved by Revenue Officer
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="documentation"
                      checked={verificationChecklist.documentation}
                      onCheckedChange={(checked) =>
                        setVerificationChecklist({ ...verificationChecklist, documentation: checked as boolean })
                      }
                    />
                    <label htmlFor="documentation" className="text-sm cursor-pointer">
                      All required documentation is complete
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="authorization"
                      checked={verificationChecklist.authorization}
                      onCheckedChange={(checked) =>
                        setVerificationChecklist({ ...verificationChecklist, authorization: checked as boolean })
                      }
                    />
                    <label htmlFor="authorization" className="text-sm cursor-pointer">
                      I have authorization to approve this payment
                    </label>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-semibold mb-2">Transaction Details</p>
                <div className="space-y-1 text-blue-900">
                  <p>Payment Method: Bank Transfer (NEFT/RTGS)</p>
                  <p>Expected Processing Time: 1-2 business days</p>
                  <p>Transaction ID will be generated upon approval</p>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="final-remarks">Final Remarks (Optional)</Label>
                <Textarea
                  id="final-remarks"
                  placeholder="Add any final notes about this payment..."
                  className="min-h-20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              onClick={confirmApproval}
            >
              Approve Payment of ₹{selectedClaim?.compensationAmount.toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Journey Timeline</DialogTitle>
            <DialogDescription>Complete history of claim processing</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Claim ID</p>
                    <p className="font-mono">{selectedClaim.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Farmer</p>
                    <p>{selectedClaim.farmerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Final Amount</p>
                    <p className="gradient-text">₹{selectedClaim.compensationAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-12 space-y-6">
                <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary via-secondary to-green-500"></div>
                
                {claimHistory.map((step, index) => (
                  <div key={index} className="relative">
                    <div className={`absolute -left-[29px] w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      step.status === 'current' ? 'bg-gradient-to-br from-primary to-secondary' :
                      'bg-gray-300'
                    }`}>
                      {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-white" />}
                      {step.status === 'current' && <Clock className="w-5 h-5 text-white" />}
                    </div>
                    
                    <Card className="ml-4">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm">{step.stage}</h4>
                          <Badge className={
                            step.status === 'completed' ? 'bg-green-100 text-green-700' :
                            step.status === 'current' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {step.status === 'completed' ? 'Completed' :
                             step.status === 'current' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.officer}</p>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {step.timestamp}
                        </p>
                        <p className="text-sm bg-gray-50 rounded p-2">{step.notes}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowHistoryModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageTransition>
  );
}
