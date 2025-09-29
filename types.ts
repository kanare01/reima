export interface Landlord {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  landlordId: string;
  unitCategories: UnitCategory[];
}

export interface UnitCategory {
  id: string;
  name: string; // e.g., '1 Bedroom', '2 Bedroom Bedsitter'
  rent: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  unitNumber: string; // e.g., 'A1', 'B12'
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
  unitId: string;
  propertyId: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  monthPaidFor: string; // YYYY-MM
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'accountant';
}


export interface DashboardStats {
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  expectedIncome: number;
  actualIncome: number;
  totalArrears: number;
}

export interface PropertyStats {
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
  expectedIncome: number;
  arrears: number;
}

export interface PropertySummary {
  id: string;
  name: string;
  occupancyRate: number;
  totalArrears: number;
}

export interface RentRollReportItem {
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  monthlyRent: number;
  amountPaid: number;
  balance: number;
}

export interface ArrearsReportItem {
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  totalBilled: number;
  totalPaid: number;
  arrears: number;
}

export interface VacancyReportItem {
  propertyName: string;
  unitNumber: string;
  categoryName: string;
  monthlyRent: number;
}

export type BulkAssignmentPayload = {
  unitNumber: string;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
}[];