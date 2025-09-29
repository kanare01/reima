import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    getPropertyById, 
    getTenantsForProperty, 
    createUnitCategory,
    updateUnitCategory,
    deleteUnitCategory,
    createUnit,
    createBulkUnits,
    updateUnit,
    deleteUnit,
    assignTenantToUnit,
    unassignTenantFromUnit,
    createPayment,
    assignMultipleTenants,
} from '../services/mockApiService';
import type { Property, UnitCategory, Unit, Tenant, BulkAssignmentPayload } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, UserPlusIcon, ArrowUturnLeftIcon, UsersIcon, BuildingOffice2Icon, CurrencyDollarIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, UserGroupIcon, RectangleStackIcon } from '../components/icons/Icons';

import ConfirmationModal from '../components/ConfirmationModal';
import UnitCategoryFormModal from '../components/UnitCategoryFormModal';
import UnitFormModal from '../components/UnitFormModal';
import TenantFormModal from '../components/TenantFormModal';
import PaymentFormModal from '../components/PaymentFormModal';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import BulkUnitFormModal from '../components/BulkUnitFormModal';
import BulkTenantAssignmentModal from '../components/BulkTenantAssignmentModal';
import { useAuth } from '../contexts/AuthContext';


const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 });

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-surface p-6 rounded-xl border border-border flex items-start">
        <div className="p-3 bg-slate-900/50 rounded-lg mr-4">{icon}</div>
        <div>
            <p className="text-text-secondary font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);


const PropertyDetailPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const { user } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [modal, setModal] = useState<{ type: string, data?: any } | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'unit', id: string, categoryId?: string } | null>(null);
    const [unitToUnassign, setUnitToUnassign] = useState<Unit | null>(null);


    const fetchData = useCallback(async () => {
        if (!propertyId) return;
        setLoading(true);
        try {
            const [propertyData, tenantsData] = await Promise.all([
                getPropertyById(propertyId),
                getTenantsForProperty(propertyId)
            ]);
            if (propertyData) {
                setProperty(propertyData);
                setTenants(tenantsData);
            } else {
                setProperty(null);
            }
        } catch (error) {
            console.error("Failed to fetch property details:", error);
            setError("Failed to load property data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const closeModal = () => setModal(null);

    const handleSaveCategory = async (data: { name: string, rent: number }) => {
        if (!propertyId) return;
        try {
            if (modal?.data?.category) {
                await updateUnitCategory(propertyId, modal.data.category.id, data);
            } else {
                await createUnitCategory(propertyId, data);
            }
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save category.');
        } finally {
            closeModal();
        }
    };

    const handleSaveUnit = async (data: { unitNumber: string }) => {
        if (!propertyId || !modal?.data?.category) return;
        try {
            if (modal?.data?.unit) {
                await updateUnit(propertyId, modal.data.category.id, modal.data.unit.id, data);
            } else {
                await createUnit(propertyId, modal.data.category.id, data);
            }
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save unit.');
        } finally {
            closeModal();
        }
    };
    
    const handleSaveBulkUnits = async (unitNumbers: string[]) => {
        if (!propertyId || !modal?.data?.category) return;
        try {
            await createBulkUnits(propertyId, modal.data.category.id, unitNumbers);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to create bulk units.');
        } finally {
            closeModal();
        }
    };
    
    const handleBulkAssign = async (assignments: BulkAssignmentPayload) => {
        if (!propertyId || !modal?.data?.category) return;
        try {
            await assignMultipleTenants(propertyId, modal.data.category.id, assignments);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to perform bulk assignment.');
        } finally {
            closeModal();
        }
    };

    const handleSaveTenant = async (data: { name: string; phone: string; email: string; moveInDate: string; }) => {
        if (!propertyId || !modal?.data?.unit) return;
        try {
            await assignTenantToUnit(propertyId, modal.data.unit.id, data);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to assign tenant.');
        } finally {
            closeModal();
        }
    };
    
    const handleSavePayment = async (data: { amount: number; paymentDate: string; monthPaidFor: string; tenantId: string }) => {
        try {
            await createPayment(data);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to record payment.');
        } finally {
            closeModal();
        }
    };
    
    const handleConfirmUnassign = async () => {
        if (!propertyId || !unitToUnassign?.tenantId) return;
        try {
            await unassignTenantFromUnit(propertyId, unitToUnassign.id, unitToUnassign.tenantId);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to unassign tenant.');
        } finally {
            closeModal();
            setUnitToUnassign(null);
        }
    };
    
    const handleDelete = async () => {
        if (!propertyId || !itemToDelete) return;
        try {
            if (itemToDelete.type === 'category') {
                await deleteUnitCategory(propertyId, itemToDelete.id);
            } else if (itemToDelete.type === 'unit' && itemToDelete.categoryId) {
                await deleteUnit(propertyId, itemToDelete.categoryId, itemToDelete.id);
            }
            fetchData();
        } catch (err: any) {
            setError(err.message || `Failed to delete ${itemToDelete.type}.`);
        } finally {
            setItemToDelete(null);
            closeModal();
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    if (!property) {
        return <div className="text-center p-8">Property not found.</div>;
    }
    
    const allUnits = property.unitCategories.flatMap(uc => uc.units);
    const occupiedUnits = allUnits.filter(u => u.tenantId).length;
    const totalUnits = allUnits.length;
    const occupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    const expectedIncome = property.unitCategories.reduce((sum, uc) => sum + (uc.units.filter(u => u.tenantId).length * uc.rent), 0);

    return (
        <div className="animate-fade-in">
             {error && (
                <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-danger" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}
            <Link to="/properties" className="flex items-center text-sm text-primary hover:underline mb-6">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Back to all properties
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Occupancy Rate" value={`${occupancy.toFixed(1)}%`} icon={<ArrowTrendingUpIcon className="w-6 h-6 text-secondary"/>} />
                <StatCard title="Occupied / Total Units" value={`${occupiedUnits} / ${totalUnits}`} icon={<BuildingOffice2Icon className="w-6 h-6 text-success"/>} />
                <StatCard title="Total Tenants" value={tenants.length} icon={<UsersIcon className="w-6 h-6 text-warning"/>} />
                <StatCard title="Expected Monthly Rent" value={currencyFormatter.format(expectedIncome)} icon={<CurrencyDollarIcon className="w-6 h-6 text-danger"/>} />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Unit Categories</h2>
                {user?.role === 'admin' && (
                    <button onClick={() => setModal({ type: 'categoryForm' })} className="flex items-center justify-center bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Category
                    </button>
                )}
            </div>
            
            <div className="space-y-8">
                {property.unitCategories.length > 0 ? property.unitCategories.map(category => {
                    const vacantUnits = category.units.filter(u => !u.tenantId);
                    return (
                    <div key={category.id} className="bg-surface p-6 rounded-xl border border-border">
                         <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b border-border/50 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">{category.name}</h3>
                                <p className="text-text-secondary">{currencyFormatter.format(category.rent)} / month</p>
                            </div>
                            {user?.role === 'admin' && (
                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                    <button onClick={() => setModal({ type: 'unitForm', data: { category } })} className="text-sm flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20"><PlusIcon className="w-4 h-4 mr-1"/> Add Unit</button>
                                    <button onClick={() => setModal({ type: 'bulkUnitForm', data: { category } })} className="text-sm flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20"><RectangleStackIcon className="w-4 h-4 mr-1"/> Add Multiple</button>
                                    <button 
                                        onClick={() => setModal({ type: 'bulkAssign', data: { category } })} 
                                        disabled={vacantUnits.length === 0}
                                        className="text-sm flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 disabled:bg-slate-800 disabled:text-text-secondary disabled:cursor-not-allowed"
                                    >
                                        <UserGroupIcon className="w-4 h-4 mr-1"/> Bulk Assign
                                    </button>
                                    <div className="flex items-center">
                                        <button onClick={() => setModal({ type: 'categoryForm', data: { category } })} className="p-2 text-text-secondary hover:text-secondary rounded-full hover:bg-slate-700"><PencilIcon className="w-5 h-5"/></button>
                                        <button 
                                            onClick={() => { setItemToDelete({ type: 'category', id: category.id }); setModal({ type: 'confirmDelete' }); }} 
                                            disabled={category.units.length > 0}
                                            className="p-2 text-text-secondary hover:text-danger rounded-full hover:bg-slate-700 disabled:text-slate-600 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            title={category.units.length > 0 ? "Cannot delete category with units" : "Delete category"}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {category.units.map(unit => {
                                const tenant = tenants.find(t => t.id === unit.tenantId);
                                return (
                                <div key={unit.id} className={`p-4 rounded-lg border flex flex-col group transition-all duration-300 ${tenant ? 'bg-surface border-border hover:border-success/50' : 'bg-slate-800/50 border-border hover:border-primary/50'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-text-primary text-lg">{unit.unitNumber}</p>
                                        {!tenant && user?.role === 'admin' && (
                                            <div className="flex items-center text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setModal({ type: 'unitForm', data: { category, unit } })} className="p-1 hover:text-secondary"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => { setItemToDelete({ type: 'unit', id: unit.id, categoryId: category.id }); setModal({ type: 'confirmDelete' }); }} className="p-1 hover:text-danger"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end">
                                        {tenant ? (
                                            <div>
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-text-primary truncate">{tenant.name}</p>
                                                    <p className="text-xs text-text-secondary">{tenant.phone}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => setModal({ type: 'paymentForm', data: { tenant } })} className="flex-1 text-xs bg-primary hover:bg-primary-focus text-white font-semibold py-2 px-2 rounded-md transition-colors">Record Payment</button>
                                                    <button onClick={() => setModal({ type: 'paymentHistory', data: { tenant } })} className="p-2 bg-slate-700 hover:bg-slate-600 text-text-secondary rounded-md transition-colors" title="View Payment History">
                                                        <ClipboardDocumentListIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => { setUnitToUnassign(unit); setModal({ type: 'confirmUnassign' }); }} className="w-full text-center text-xs text-danger/80 hover:text-danger hover:underline mt-2">Unassign Tenant</button>
                                                )}
                                            </div>
                                        ) : (
                                            user?.role === 'admin' ? (
                                                <button onClick={() => setModal({ type: 'tenantForm', data: { category, unit } })} className="w-full flex items-center justify-center text-sm bg-primary/80 hover:bg-primary text-white py-2 px-3 rounded-md transition mt-4">
                                                    <UserPlusIcon className="w-4 h-4 mr-2"/> Assign Tenant
                                                </button>
                                            ) : (
                                                <div className="mt-4 text-center text-sm text-text-secondary italic">Vacant</div>
                                            )
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                );}) : (
                     <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border">
                        <BuildingOffice2Icon className="mx-auto h-12 w-12 text-text-secondary" />
                        <h3 className="mt-4 text-xl font-semibold text-text-primary">No Unit Categories</h3>
                        <p className="mt-2 text-text-secondary">Create a category like "1 Bedroom" or "Studio" to start adding units.</p>
                    </div>
                )}
            </div>
            
            <UnitCategoryFormModal 
                isOpen={modal?.type === 'categoryForm'}
                onClose={closeModal}
                onSave={handleSaveCategory}
                categoryToEdit={modal?.data?.category}
            />

            <UnitFormModal
                isOpen={modal?.type === 'unitForm'}
                onClose={closeModal}
                onSave={handleSaveUnit}
                unitToEdit={modal?.data?.unit}
            />

            <BulkUnitFormModal
                isOpen={modal?.type === 'bulkUnitForm'}
                onClose={closeModal}
                onSave={handleSaveBulkUnits}
            />

            <BulkTenantAssignmentModal
                isOpen={modal?.type === 'bulkAssign'}
                onClose={closeModal}
                onSave={handleBulkAssign}
                category={modal?.data?.category}
            />

            <TenantFormModal
                isOpen={modal?.type === 'tenantForm'}
                onClose={closeModal}
                onSave={handleSaveTenant}
                unit={modal?.data?.unit}
            />

            <PaymentFormModal
                isOpen={modal?.type === 'paymentForm'}
                onClose={closeModal}
                onSave={handleSavePayment}
                tenant={modal?.data?.tenant}
            />
            
            <PaymentHistoryModal
                isOpen={modal?.type === 'paymentHistory'}
                onClose={closeModal}
                tenant={modal?.data?.tenant}
            />

            <ConfirmationModal
                isOpen={modal?.type === 'confirmDelete' || modal?.type === 'confirmUnassign'}
                onClose={closeModal}
                onConfirm={modal?.type === 'confirmDelete' ? handleDelete : handleConfirmUnassign}
                title={
                    modal?.type === 'confirmDelete' ? `Delete ${itemToDelete?.type}` : 'Unassign Tenant'
                }
                message={
                    modal?.type === 'confirmDelete' 
                    ? `Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.` 
                    : (unitToUnassign && `Are you sure you want to unassign ${tenants.find(t => t.id === unitToUnassign.tenantId)?.name} from unit ${unitToUnassign.unitNumber}? Their payment history will be retained for your records.`) || ''
                }
                confirmText={
                    modal?.type === 'confirmDelete' ? 'Delete' : 'Unassign'
                }
            />
        </div>
    );
};

export default PropertyDetailPage;