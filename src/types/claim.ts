// Comprehensive claim type with all hierarchy information

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'forwarded';

export type ClaimDocument = {
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'other';
};

export type VerifierRemarks = {
  status: 'approved' | 'rejected' | 'forwarded';
  remarks: string;
  verifiedBy: string;
  verifiedDate: string;
  documentsVerified: boolean;
};

export type FieldOfficerRemarks = {
  status: 'approved' | 'rejected' | 'forwarded';
  remarks: string;
  inspectedBy: string;
  inspectionDate: string;
  fieldVisitCompleted: boolean;
  actualDamagePercent: number;
  gpsCoordinates?: string;
  fieldPhotos?: string[];
};

export type RevenueOfficerRemarks = {
  status: 'approved' | 'rejected' | 'forwarded';
  remarks: string;
  assessedBy: string;
  assessmentDate: string;
  compensationAmount: number;
  calculationBasis: string;
};

export type TreasuryOfficerRemarks = {
  status: 'approved' | 'rejected';
  remarks: string;
  processedBy: string;
  processedDate: string;
  paymentReferenceNumber?: string;
  disbursementDate?: string;
};

export type Claim = {
  // Basic Information
  id: string;
  farmerName: string;
  farmerContact: string;
  farmerEmail: string;
  farmerAddress: string;
  farmerAadhaar: string;
  farmerBankAccount: string;
  farmerId?: string;
  
  // Crop & Loss Details
  cropType: string;
  cropVariety: string;
  areaAffected: number; // in acres
  cause: string;
  lossDate: string;
  damagePercent: number;
  description: string;
  
  // Submission Details
  submittedDate: string;
  status: DocumentStatus;
  
  // Supporting Documents
  documents: ClaimDocument[];
  
  // Government Officials Hierarchy Reports
  verifierRemarks?: VerifierRemarks;
  fieldOfficerRemarks?: FieldOfficerRemarks;
  revenueOfficerRemarks?: RevenueOfficerRemarks;
  treasuryOfficerRemarks?: TreasuryOfficerRemarks;
};
