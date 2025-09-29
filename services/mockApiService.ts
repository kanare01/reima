import type { Property, Tenant, Payment, DashboardStats, Landlord, UnitCategory, Unit, PropertyStats, RentRollReportItem, ArrearsReportItem, VacancyReportItem, BulkAssignmentPayload, PropertySummary, User } from '../types';

// In-memory data store

// Fix: Removed `password` property from user objects to align with the `User` type. The login logic in this mock service does not use passwords.
let users: User[] = [
    { id: 'user1', email: 'admin@nyumbasys.com', role: 'admin' },
    { id: 'user2', email: 'accountant@nyumbasys.com', role: 'accountant' },
];

let landlords: Landlord[] = [
    { id: 'l1', name: 'John Doe Properties' },
];

let properties: Property[] = [
    {
        id: 'p1',
        name: 'KICC Apartments',
        location: 'Nairobi CBD',
        landlordId: 'l1',
        unitCategories: [
            {
                id: 'uc1',
                name: '1 Bedroom',
                rent: 25000,
                units: [
                    { id: 'u1', unitNumber: 'A1', tenantId: 't1' },
                    { id: 'u2', unitNumber: 'A2' },
                    { id: 'u3', unitNumber: 'A3', tenantId: 't2' },
                ]
            },
            {
                id: 'uc2',
                name: '2 Bedroom',
                rent: 40000,
                units: [
                    { id: 'u4', unitNumber: 'B1', tenantId: 't3' },
                    { id: 'u5', unitNumber: 'B2', tenantId: 't4' },
                ]
            },
        ],
    },
    {
        id: 'p2',
        name: 'Westlands Heights',
        location: 'Westlands, Nairobi',
        landlordId: 'l1',
        unitCategories: [
            {
                id: 'uc3',
                name: 'Studio',
                rent: 18000,
                units: [
                    { id: 'u6', unitNumber: 'S1' },
                    { id: 'u7', unitNumber: 'S2', tenantId: 't5' },
                ]
            },
        ],
    },
];

let tenants: Tenant[] = [
    { id: 't1', name: 'Alice Smith', phone: '0712345678', email: 'alice@example.com', moveInDate: '2023-01-15', unitId: 'u1', propertyId: 'p1' },
    { id: 't2', name: 'Bob Johnson', phone: '0723456789', email: 'bob@example.com', moveInDate: '2022-11-20', unitId: 'u3', propertyId: 'p1' },
    { id: 't3', name: 'Charlie Brown', phone: '0734567890', email: 'charlie@example.com', moveInDate: '2023-05-10', unitId: 'u4', propertyId: 'p1' },
    { id: 't4', name: 'Diana Prince', phone: '0745678901', email: 'diana@example.com', moveInDate: '2023-02-01', unitId: 'u5', propertyId: 'p1' },
    { id: 't5', name: 'Ethan Hunt', phone: '0756789012', email: 'ethan@example.com', moveInDate: '2023-08-01', unitId: 'u7', propertyId: 'p2' },
];

let payments: Payment[] = [
    { id: 'pay1', tenantId: 't1', amount: 25000, paymentDate: '2023-10-05', monthPaidFor: '2023-10' },
    { id: 'pay2', tenantId: 't2', amount: 25000, paymentDate: '2023-10-03', monthPaidFor: '2023-10' },
    { id: 'pay3', tenantId: 't3', amount: 40000, paymentDate: '2023-10-01', monthPaidFor: '2023-10' },
    { id: 'pay4', tenantId: 't4', amount: 20000, paymentDate: '2023-10-06', monthPaidFor: '2023-10' }, // Partial payment
    { id: 'pay5', tenantId: 't5', amount: 18000, paymentDate: '2023-09-02', monthPaidFor: '2023-09' },
    { id: 'pay6', tenantId: 't1', amount: 25000, paymentDate: '2023-09-04', monthPaidFor: '2023-09' },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_API_DELAY = 500;

// Helper to generate IDs
const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Auth ---
export const login = async (email: string, password_unused: string): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    // In a real app, you'd check a hashed password. Here we just check for existence.
    return user ? { ...user } : null;
};


// --- Dashboard ---
export const getDashboardStats = async (currentDate: Date): Promise<DashboardStats> => {
    await delay(MOCK_API_DELAY);
    
    let totalUnits = 0;
    let occupiedUnits = 0;
    let expectedIncome = 0;
    
    properties.forEach(p => {
        p.unitCategories.forEach(uc => {
            totalUnits += uc.units.length;
            const occupiedInCategory = uc.units.filter(u => u.tenantId);
            occupiedUnits += occupiedInCategory.length;
            expectedIncome += occupiedInCategory.length * uc.rent;
        });
    });

    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const actualIncome = payments
        .filter(p => p.monthPaidFor === currentMonth)
        .reduce((sum, p) => sum + p.amount, 0);

    const totalArrears = expectedIncome - actualIncome; // Simplified arrears calculation

    return {
        occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        expectedIncome,
        actualIncome,
        totalArrears: totalArrears > 0 ? totalArrears : 0,
    };
};

export const getMonthlyIncomeTrend = async (): Promise<any[]> => {
    await delay(MOCK_API_DELAY);
    const trend: any[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.toLocaleString('default', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const expected = properties.flatMap(p => p.unitCategories).reduce((sum, uc) => {
            return sum + (uc.units.filter(u => u.tenantId).length * uc.rent);
        }, 0);

        const actual = payments
            .filter(p => p.monthPaidFor === monthKey)
            .reduce((sum, p) => sum + p.amount, 0);
        
        trend.push({ month, expected: Math.floor(expected * (0.9 + Math.random() * 0.1)), actual });
    }
    return trend;
}

export const getPropertySummaries = async (): Promise<PropertySummary[]> => {
    await delay(MOCK_API_DELAY);
    const summaries: PropertySummary[] = [];

    for (const prop of properties) {
        let totalUnits = 0;
        let occupiedUnits = 0;
        let totalArrears = 0;

        for (const cat of prop.unitCategories) {
            totalUnits += cat.units.length;
            for (const unit of cat.units) {
                if (unit.tenantId) {
                    occupiedUnits++;
                    const tenant = tenants.find(t => t.id === unit.tenantId);
                    if (tenant) {
                        let moveIn = new Date(tenant.moveInDate);
                        let asOf = new Date(); // As of today
                        if (asOf >= moveIn) {
                            let monthsBilled = (asOf.getFullYear() - moveIn.getFullYear()) * 12 + (asOf.getMonth() - moveIn.getMonth()) + 1;
                            const totalBilled = monthsBilled * cat.rent;
                            const totalPaid = payments
                                .filter(p => p.tenantId === tenant.id)
                                .reduce((sum, p) => sum + p.amount, 0);
                            const arrears = totalBilled - totalPaid;
                            if (arrears > 0) {
                                totalArrears += arrears;
                            }
                        }
                    }
                }
            }
        }
        
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        summaries.push({
            id: prop.id,
            name: prop.name,
            occupancyRate,
            totalArrears
        });
    }
    return summaries;
};


// --- Properties ---
export const getProperties = async (): Promise<Property[]> => {
    await delay(MOCK_API_DELAY);
    return JSON.parse(JSON.stringify(properties));
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === id);
    if (!property) return undefined;
    return JSON.parse(JSON.stringify(property));
};

export const createProperty = async (data: { name: string, location: string }): Promise<Property> => {
    await delay(MOCK_API_DELAY);
    const newProperty: Property = {
        id: generateId(),
        landlordId: 'l1',
        unitCategories: [],
        ...data,
    };
    properties.push(newProperty);
    return newProperty;
};

export const updateProperty = async (id: string, data: { name: string, location: string }): Promise<Property | null> => {
    await delay(MOCK_API_DELAY);
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) return null;
    properties[index] = { ...properties[index], ...data };
    return properties[index];
};

export const deleteProperty = async (id: string): Promise<boolean> => {
    await delay(MOCK_API_DELAY);
    const initialLength = properties.length;
    properties = properties.filter(p => p.id !== id);
    // Also delete associated tenants and payments
    const tenantsToDelete = tenants.filter(t => t.propertyId === id).map(t => t.id);
    tenants = tenants.filter(t => t.propertyId !== id);
    payments = payments.filter(p => !tenantsToDelete.includes(p.tenantId));
    return properties.length < initialLength;
};

// --- Tenants ---
export const getTenants = async (): Promise<Tenant[]> => {
    await delay(MOCK_API_DELAY);
    return JSON.parse(JSON.stringify(tenants));
};

export const getTenantsForProperty = async (propertyId: string): Promise<Tenant[]> => {
    await delay(MOCK_API_DELAY);
    return JSON.parse(JSON.stringify(tenants.filter(t => t.propertyId === propertyId)));
};

export const assignTenantToUnit = async (propertyId: string, unitId: string, tenantData: { name: string; phone: string; email: string; moveInDate: string; }): Promise<Tenant | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    let unitFound: Unit | undefined;
    for (const uc of property.unitCategories) {
        unitFound = uc.units.find(u => u.id === unitId);
        if (unitFound) break;
    }

    if (!unitFound || unitFound.tenantId) return null;

    const newTenant: Tenant = {
        id: generateId(),
        propertyId,
        unitId,
        ...tenantData,
    };

    tenants.push(newTenant);
    unitFound.tenantId = newTenant.id;

    return newTenant;
};

export const assignMultipleTenants = async (propertyId: string, categoryId: string, assignments: BulkAssignmentPayload): Promise<{ success: number; failed: number }> => {
    await delay(MOCK_API_DELAY * 2); // Longer delay for bulk operation
    const property = properties.find(p => p.id === propertyId);
    if (!property) return { success: 0, failed: assignments.length };
    
    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return { success: 0, failed: assignments.length };

    let successCount = 0;
    
    for (const assignment of assignments) {
        const unit = category.units.find(u => u.unitNumber === assignment.unitNumber && !u.tenantId);
        if (unit) {
            const newTenant: Tenant = {
                id: generateId(),
                propertyId,
                unitId: unit.id,
                name: assignment.name,
                phone: assignment.phone,
                email: assignment.email,
                moveInDate: assignment.moveInDate,
            };
            tenants.push(newTenant);
            unit.tenantId = newTenant.id;
            successCount++;
        }
    }

    return { success: successCount, failed: assignments.length - successCount };
};


export const unassignTenantFromUnit = async (propertyId: string, unitId: string, tenantId: string): Promise<boolean> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return false;
    
    let unitFound: Unit | undefined;
    for (const uc of property.unitCategories) {
        const unit = uc.units.find(u => u.id === unitId && u.tenantId === tenantId);
        if (unit) {
            unitFound = unit;
            break;
        }
    }

    if (!unitFound) return false;

    unitFound.tenantId = undefined;
    // We don't delete the tenant, just mark the unit as vacant.
    // In a real system, you might archive the tenant record.

    return true;
};


// --- Payments ---
export const getPaymentsForTenant = async (tenantId: string): Promise<Payment[]> => {
    await delay(MOCK_API_DELAY);
    return JSON.parse(JSON.stringify(payments.filter(p => p.tenantId === tenantId)));
}

export const createPayment = async (paymentData: { amount: number; paymentDate: string; monthPaidFor: string; tenantId: string }): Promise<Payment> => {
    await delay(MOCK_API_DELAY);
    const newPayment: Payment = {
        id: generateId(),
        ...paymentData,
    };
    payments.push(newPayment);
    return newPayment;
}

// --- Unit Categories ---
export const createUnitCategory = async (propertyId: string, categoryData: { name: string; rent: number }): Promise<UnitCategory | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const newCategory: UnitCategory = {
        id: generateId(),
        units: [],
        ...categoryData,
    };
    property.unitCategories.push(newCategory);
    return newCategory;
}

export const updateUnitCategory = async (propertyId: string, categoryId: string, categoryData: { name: string; rent: number }): Promise<UnitCategory | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;
    
    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return null;

    category.name = categoryData.name;
    category.rent = categoryData.rent;
    return category;
}

export const deleteUnitCategory = async (propertyId: string, categoryId: string): Promise<boolean> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return false;

    
    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if(category && category.units.length > 0) {
        console.error("Cannot delete a category that contains units.");
        throw new Error("Cannot delete a category that contains units. Please remove all units from the category first.");
    }
    
    const initialLength = property.unitCategories.length;
    property.unitCategories = property.unitCategories.filter(uc => uc.id !== categoryId);
    return property.unitCategories.length < initialLength;
}

// --- Units ---
export const createUnit = async (propertyId: string, categoryId: string, unitData: { unitNumber: string }): Promise<Unit | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return null;

    const newUnit: Unit = {
        id: generateId(),
        ...unitData,
    };
    category.units.push(newUnit);
    return newUnit;
}
export const createBulkUnits = async (propertyId: string, categoryId: string, unitNumbers: string[]): Promise<Unit[] | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return null;

    const newUnits: Unit[] = unitNumbers.map(unitNumber => ({
        id: generateId(),
        unitNumber,
    }));
    
    category.units.push(...newUnits);
    return newUnits;
}

export const updateUnit = async (propertyId: string, categoryId: string, unitId: string, unitData: { unitNumber: string }): Promise<Unit | null> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return null;

    const unit = category.units.find(u => u.id === unitId);
    if (!unit || unit.tenantId) {
        console.error("Cannot edit an occupied unit.");
        return null;
    }

    unit.unitNumber = unitData.unitNumber;
    return unit;
}

export const deleteUnit = async (propertyId: string, categoryId: string, unitId: string): Promise<boolean> => {
    await delay(MOCK_API_DELAY);
    const property = properties.find(p => p.id === propertyId);
    if (!property) return false;

    const category = property.unitCategories.find(uc => uc.id === categoryId);
    if (!category) return false;

    const unit = category.units.find(u => u.id === unitId);
    if (unit?.tenantId) {
        console.error("Cannot delete an occupied unit.");
        return false;
    }

    const initialLength = category.units.length;
    category.units = category.units.filter(u => u.id !== unitId);
    return category.units.length < initialLength;
}

// --- Reports ---
export const getRentRollReport = async (propertyId: string, startDate: string, endDate: string): Promise<RentRollReportItem[]> => {
    await delay(MOCK_API_DELAY);
    const reportData: RentRollReportItem[] = [];
    const targetProperties = propertyId === 'all' ? properties : properties.filter(p => p.id === propertyId);
    const startMonth = startDate.substring(0, 7);
    const endMonth = endDate.substring(0, 7);

    for (const prop of targetProperties) {
        for (const cat of prop.unitCategories) {
            for (const unit of cat.units) {
                if (unit.tenantId) {
                    const tenant = tenants.find(t => t.id === unit.tenantId);
                    if (!tenant) continue;
                    
                    const paymentsInPeriod = payments.filter(p => 
                        p.tenantId === tenant.id && 
                        p.monthPaidFor >= startMonth && 
                        p.monthPaidFor <= endMonth
                    );
                    
                    const amountPaid = paymentsInPeriod.reduce((sum, p) => sum + p.amount, 0);
                    const expectedRent = cat.rent; // Simplified: assumes rent is for one month in range
                    const balance = expectedRent - amountPaid;

                    reportData.push({
                        tenantName: tenant.name,
                        propertyName: prop.name,
                        unitNumber: unit.unitNumber,
                        monthlyRent: cat.rent,
                        amountPaid: amountPaid,
                        balance: balance,
                    });
                }
            }
        }
    }
    return reportData;
};

export const getArrearsReport = async (propertyId: string, startDate: string, endDate: string): Promise<ArrearsReportItem[]> => {
    await delay(MOCK_API_DELAY);
    const reportData: ArrearsReportItem[] = [];
    const targetProperties = propertyId === 'all' ? properties : properties.filter(p => p.id === propertyId);

    const startPeriod = new Date(startDate);
    const endPeriod = new Date(endDate);
    endPeriod.setMonth(endPeriod.getMonth() + 1, 0); // End of the selected month

    for (const prop of targetProperties) {
        for (const cat of prop.unitCategories) {
            for (const unit of cat.units) {
                if (unit.tenantId) {
                    const tenant = tenants.find(t => t.id === unit.tenantId);
                    if (!tenant) continue;

                    const moveInDate = new Date(tenant.moveInDate);
                    if (moveInDate > endPeriod) continue;

                    const monthsToBill: string[] = [];
                    let cursorDate = new Date(startPeriod);

                    while (cursorDate <= endPeriod) {
                        const moveInBeforeOrDuringMonth = 
                            moveInDate.getFullYear() < cursorDate.getFullYear() ||
                            (moveInDate.getFullYear() === cursorDate.getFullYear() && moveInDate.getMonth() <= cursorDate.getMonth());

                        if (moveInBeforeOrDuringMonth) {
                            monthsToBill.push(`${cursorDate.getFullYear()}-${String(cursorDate.getMonth() + 1).padStart(2, '0')}`);
                        }
                        
                        cursorDate.setMonth(cursorDate.getMonth() + 1);
                        cursorDate.setDate(1);
                    }

                    const totalBilledInPeriod = monthsToBill.length * cat.rent;
                    if (totalBilledInPeriod === 0) continue;

                    const totalPaidForPeriod = payments
                        .filter(p => p.tenantId === tenant.id && monthsToBill.includes(p.monthPaidFor))
                        .reduce((sum, p) => sum + p.amount, 0);

                    const arrearsInPeriod = totalBilledInPeriod - totalPaidForPeriod;

                    if (arrearsInPeriod > 0) {
                        reportData.push({
                            tenantName: tenant.name,
                            propertyName: prop.name,
                            unitNumber: unit.unitNumber,
                            totalBilled: totalBilledInPeriod,
                            totalPaid: totalPaidForPeriod,
                            arrears: arrearsInPeriod,
                        });
                    }
                }
            }
        }
    }
    return reportData;
};

export const getVacancyReport = async (propertyId: string): Promise<VacancyReportItem[]> => {
    await delay(MOCK_API_DELAY);
    const reportData: VacancyReportItem[] = [];
    const targetProperties = propertyId === 'all' ? properties : properties.filter(p => p.id === propertyId);

    for (const prop of targetProperties) {
        for (const cat of prop.unitCategories) {
            for (const unit of cat.units) {
                if (!unit.tenantId) {
                    reportData.push({
                        propertyName: prop.name,
                        unitNumber: unit.unitNumber,
                        categoryName: cat.name,
                        monthlyRent: cat.rent,
                    });
                }
            }
        }
    }
    return reportData;
};