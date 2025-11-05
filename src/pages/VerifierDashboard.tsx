import { useState } from 'react';
import { Grid, List, XCircle, Forward, Eye, Filter, Search, FileText, ExternalLink, MapPin, User, Phone, Mail, Home, CreditCard, Sprout } from 'lucide-react';
import Navbar from '../components/Navbar';
import FloatingOrbs from '../components/FloatingOrbs';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import PageTransition from '../components/PageTransition';
import { Notification } from '../components/NotificationDialog';
import { Claim } from '../types/claim';

type ViewMode = 'grid' | 'list';

export default function VerifierDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'forward' | 'details' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-v1',
      type: 'info',
      title: 'New Claims Assigned',
      message: '5 new claims have been assigned to you for document verification.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-v2',
      type: 'warning',
      title: 'Pending Review',
      message: 'Claim CL2024102 requires urgent attention. Deadline approaching in 2 hours.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'notif-v3',
      type: 'success',
      title: 'Documents Verified',
      message: 'Your verification for claim CL2024099 has been accepted by the field officer.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-v4',
      type: 'error',
      title: 'Verification Rejected',
      message: 'Your verification for claim CL2024095 was rejected. Please review feedback.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-v5',
      type: 'info',
      title: 'Training Session',
      message: 'Mandatory training session on new verification guidelines scheduled for Friday, 3:00 PM.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 'CL2024101',
      farmerName: 'Ramesh Sharma',
      farmerContact: '+91 98765 11111',
      farmerEmail: 'ramesh.sharma@email.com',
      farmerAddress: 'Village Rampur, Tehsil Bhopal, District Bhopal, Madhya Pradesh - 462001',
      farmerAadhaar: '1234 5678 9012',
      farmerBankAccount: 'HDFC Bank - 50100123456789',
      cropType: 'Wheat',
      cropVariety: 'HD-2967',
      areaAffected: 5.5,
      cause: 'Drought',
      lossDate: '2024-10-15',
      damagePercent: 65,
      submittedDate: '2024-10-20',
      status: 'pending',
      description: 'Severe drought conditions led to significant crop loss in my wheat field. The prolonged dry spell caused severe moisture stress affecting grain formation.',
      documents: [
        { name: 'Land Records.pdf', url: 'https://drive.google.com/file/land-records', type: 'pdf' },
        { name: 'Field Photo 1.jpg', url: 'https://drive.google.com/file/field-photo-1', type: 'image' },
        { name: 'Field Photo 2.jpg', url: 'https://drive.google.com/file/field-photo-2', type: 'image' },
        { name: 'Aadhaar Card.pdf', url: 'https://drive.google.com/file/aadhaar', type: 'pdf' },
      ],
    },
    {
      id: 'CL2024102',
      farmerName: 'Suresh Patel',
      farmerContact: '+91 98765 22222',
      farmerEmail: 'suresh.patel@email.com',
      farmerAddress: 'Village Khargone, Tehsil Khargone, District Khargone, Madhya Pradesh - 451001',
      farmerAadhaar: '2345 6789 0123',
      farmerBankAccount: 'SBI - 30200987654321',
      cropType: 'Rice',
      cropVariety: 'IR-64',
      areaAffected: 8.0,
      cause: 'Flood',
      lossDate: '2024-09-10',
      damagePercent: 80,
      submittedDate: '2024-09-12',
      status: 'pending',
      description: 'Heavy rainfall caused flooding in the paddy fields, destroying most of the crop. Water logging for 4 days completely damaged the standing crop.',
      documents: [
        { name: 'Land Ownership.pdf', url: 'https://drive.google.com/file/land-own', type: 'pdf' },
        { name: 'Flood Damage Photo.jpg', url: 'https://drive.google.com/file/flood-damage', type: 'image' },
        { name: 'Bank Passbook.pdf', url: 'https://drive.google.com/file/bank', type: 'pdf' },
      ],
    },
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
    },
  ]);

  const stats = [
    { label: 'Pending', value: claims.filter(c => c.status === 'pending').length, color: 'from-orange-500 to-yellow-500' },
    { label: 'Approved', value: claims.filter(c => c.status === 'approved').length, color: 'from-green-500 to-emerald-500' },
    { label: 'Rejected', value: claims.filter(c => c.status === 'rejected').length, color: 'from-red-500 to-pink-500' },
    { label: 'Forwarded', value: claims.filter(c => c.status === 'forwarded').length, color: 'from-blue-500 to-cyan-500' },
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (claim: Claim, action: 'reject' | 'forward' | 'details') => {
    setSelectedClaim(claim);
    setActionType(action);
  };

  const confirmAction = () => {
    if (!selectedClaim || !actionType) return;

    if (actionType === 'reject') {
      setClaims(claims.map(c => c.id === selectedClaim.id ? { ...c, status: 'rejected' } : c));
      toast.success('Claim rejected');
    } else if (actionType === 'forward') {
      setClaims(claims.map(c => c.id === selectedClaim.id ? { ...c, status: 'forwarded' } : c));
      toast.success('Claim forwarded to Field Officer');
    }

    setActionType(null);
    setSelectedClaim(null);
  };

  const getStatusBadge = (status: Claim['status']) => {
    const configs = {
      pending: { label: 'Pending', className: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
      forwarded: { label: 'Forwarded', className: 'bg-blue-100 text-blue-700' },
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
        <FloatingOrbs />
      <Navbar
        user={{
          name: 'Dr. Anjali Verma',
          role: 'Document Verifier',
        }}
        notificationsList={notifications}
        onNotificationsChange={setNotifications}
      />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackButton className="mb-6" />

        <div className="mb-8">
          <h1 className="mb-2">Document Verification Dashboard</h1>
          <p className="text-gray-600">Review and verify submitted agricultural loss claims</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glassmorphic shadow-lg">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xl">{stat.value}</span>
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and View Toggle */}
        <Card className="glassmorphic shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by Claim ID or Farmer Name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="forwarded">Forwarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaims.map((claim) => (
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>
                      <span>{claim.farmerContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Crop Type:</span>
                      <span>{claim.cropType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cause:</span>
                      <span>{claim.cause}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Damage:</span>
                      <span className="font-semibold text-orange-600">{claim.damagePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Loss Date:</span>
                      <span>{claim.lossDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span>{claim.submittedDate}</span>
                    </div>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(claim, 'reject')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        onClick={() => handleAction(claim, 'forward')}
                      >
                        <Forward className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAction(claim, 'details')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glassmorphic shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Damage %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono">{claim.id}</TableCell>
                      <TableCell>{claim.farmerName}</TableCell>
                      <TableCell>{claim.farmerContact}</TableCell>
                      <TableCell>{claim.cropType}</TableCell>
                      <TableCell>{claim.cause}</TableCell>
                      <TableCell className="text-orange-600">{claim.damagePercent}%</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {claim.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleAction(claim, 'reject')}>
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleAction(claim, 'forward')}>
                                <Forward className="w-4 h-4 text-blue-600" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleAction(claim, 'details')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Modals */}
      {actionType === 'reject' && selectedClaim && (
        <Dialog open={true} onOpenChange={() => setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Claim
              </DialogTitle>
              <DialogDescription>Provide reason for rejection</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Claim ID:</span>
                  <span className="font-mono">{selectedClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farmer:</span>
                  <span>{selectedClaim.farmerName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Rejection *</Label>
                <Textarea id="reason" placeholder="Explain why this claim is being rejected..." required />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmAction}>
                Reject Claim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {actionType === 'forward' && selectedClaim && (
        <Dialog open={true} onOpenChange={() => setActionType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Forward className="w-5 h-5 text-blue-600" />
                Forward to Field Officer
              </DialogTitle>
              <DialogDescription>Forward this claim for field inspection</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Claim ID:</span>
                  <span className="font-mono">{selectedClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farmer:</span>
                  <span>{selectedClaim.farmerName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Field Officer</Label>
                <Textarea id="notes" placeholder="Add any special instructions..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white" onClick={confirmAction}>
                Forward Claim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {actionType === 'details' && selectedClaim && (
        <Dialog open={true} onOpenChange={() => setActionType(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Claim Details - {selectedClaim.id}
              </DialogTitle>
              <DialogDescription>Complete information for document verification</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Current Status:</span>
                  {getStatusBadge(selectedClaim.status)}
                </div>

                <Separator />

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
                      <p className="text-xs text-gray-500">Damage Percentage</p>
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

                <Separator />

                {/* Submission Details */}
                <div>
                  <h3 className="mb-3">Submission Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Submitted Date</p>
                      <p className="text-sm">{selectedClaim.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Claim ID</p>
                      <p className="text-sm font-mono">{selectedClaim.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setActionType(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </PageTransition>
  );
}
