import { useEffect, useState } from 'react';
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
import { getDb, serverTimestamp, arrayUnion } from '../lib/firebaseCompat';
import { useAuth } from '../contexts/AuthContext';
import { getDb as getDbCompat } from '../lib/firebaseCompat';

type ViewMode = 'grid' | 'list';

export default function VerifierDashboard() {
  const { user } = useAuth();
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

  const [claims, setClaims] = useState<Claim[]>([]);
  const [officerName, setOfficerName] = useState<string>('Document Verifier');
  const [officerDept, setOfficerDept] = useState<string>('Verification Dept.');

  useEffect(() => {
    const db = getDb();
    console.log('✅ Listening for verifier claims');
    const unsub = db
      .collection('claims')
      .where('stage', '==', 'verifier')
      .onSnapshot(async (snap: any) => {
        const listPromises: Promise<Claim>[] = [];
        snap.forEach((d: any) => {
          const data = d.data();
          const rawStatus = (data.status || 'Submitted').toLowerCase();
          let normalizedStatus: 'pending' | 'approved' | 'rejected' | 'forwarded';
          if (
            rawStatus === 'submitted' ||
            rawStatus === 'under-review' ||
            rawStatus === 'verified' ||
            rawStatus === 'field verified'
          ) {
            normalizedStatus = 'pending';
          } else if (rawStatus === 'rejected') {
            normalizedStatus = 'rejected';
          } else if (
            rawStatus === 'verified and forwarded' ||
            rawStatus === 'forwarded' ||
            rawStatus === 'field'
          ) {
            normalizedStatus = 'forwarded';
          } else if (
            rawStatus === 'approved' ||
            rawStatus === 'revenue approved' ||
            rawStatus === 'paid'
          ) {
            normalizedStatus = 'approved';
          } else {
            normalizedStatus = 'pending';
          }
          // Fetch farmer profile if farmerId exists
          const farmerId = data.farmerId;
          const fetchFarmer = async () => {
            let farmerProfile: any = {};
            try {
              if (farmerId) {
                const udoc = await db.collection('users').doc(farmerId).get();
                if (udoc.exists) farmerProfile = udoc.data() || {};
              }
            } catch (_) {}
            return {
              id: d.id,
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
              status: normalizedStatus,
              description: data.description || '',
              documents: (() => {
                const docs: any[] = [];
                if (data.imageLinks) {
                  docs.push({ name: 'Crop Damage Images', url: data.imageLinks, type: 'image' });
                }
                if (data.documentLinks) {
                  docs.push({ name: 'Supporting Documents', url: data.documentLinks, type: 'pdf' });
                }
                if (data.documents && Array.isArray(data.documents)) {
                  data.documents.forEach((x: any) => {
                    docs.push({ name: x.name || 'Document', url: x.url || '', type: x.type || 'link' });
                  });
                }
                return docs;
              })(),
            } as any;
          };
          listPromises.push(fetchFarmer());
        });
        const list = await Promise.all(listPromises);
        setClaims(list);
      });
    return () => unsub && unsub();
  }, []);

  // Load current official profile for Navbar and info
  useEffect(() => {
    try {
      const raw = localStorage.getItem('officialProfile');
      if (!raw) return;
      const prof = JSON.parse(raw || '{}');
      if (prof.displayName) setOfficerName(prof.displayName);
      if (prof.department) setOfficerDept(prof.department);
    } catch (_) {}
  }, []);

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

  const confirmAction = async () => {
    if (!selectedClaim || !actionType) return;

    try {
      const db = getDb();
      const claimRef = db.collection('claims').doc(selectedClaim.id);
      if (actionType === 'reject') {
        const reasonEl = document.getElementById('reason') as HTMLTextAreaElement;
        const reason = reasonEl?.value?.trim() || 'Rejected by Verifier';
        await claimRef.update({
          status: 'Rejected',
          stage: 'rejected',
          updatedAt: serverTimestamp(),
          latestRemark: reason,
          history: arrayUnion({
            at: serverTimestamp(),
            by: user?.uid || 'system',
            action: 'Rejected',
            role: 'Verifier',
            note: reason,
          }),
        });
        toast.success('✅ Status updated: Rejected');
      } else if (actionType === 'forward') {
        const notesEl = document.getElementById('notes') as HTMLTextAreaElement;
        const notes = notesEl?.value?.trim() || 'Forwarded to Field Officer';
        await claimRef.update({
          status: 'Verified',
          stage: 'field',
          updatedAt: serverTimestamp(),
          latestRemark: notes,
          history: arrayUnion({
            at: serverTimestamp(),
            by: user?.uid || 'system',
            action: 'Verified and Forwarded',
            role: 'Verifier',
            note: notes,
          }),
        });
        toast.success('✅ Forwarded to Field Officer');
      }
      setActionType(null);
      setSelectedClaim(null);
    } catch (err: any) {
      toast.error('Failed to update claim: ' + (err?.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status: Claim['status']) => {
    const configs = {
      pending: { label: 'Pending', className: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
      forwarded: { label: 'Forwarded', className: 'bg-blue-100 text-blue-700' },
    };
    const cfg = (configs as any)[status] || configs.pending;
    return <Badge className={cfg.className}>{cfg.label}</Badge>;
  };

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
