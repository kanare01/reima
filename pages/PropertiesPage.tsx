import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../services/mockApiService';
import type { Property } from '../types';
import PropertyFormModal from '../components/PropertyFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon, MapPinIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, BuildingOffice2Icon } from '../components/icons/Icons';
import { useAuth } from '../contexts/AuthContext';

const currencyFormatter = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const PropertyCard: React.FC<{ 
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (propertyId: string) => void;
}> = ({ property, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const totalUnits = property.unitCategories.reduce((sum, uc) => sum + uc.units.length, 0);
    const occupiedUnits = property.unitCategories.reduce((sum, uc) => sum + uc.units.filter(u => u.tenantId).length, 0);
    const occupancy = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100) : 0;
    
    const expectedMonthlyRent = property.unitCategories.reduce((totalRent, category) => {
        const occupiedUnitsInCategory = category.units.filter(u => u.tenantId).length;
        return totalRent + (occupiedUnitsInCategory * category.rent);
    }, 0);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        onEdit(property);
        setMenuOpen(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        onDelete(property.id);
        setMenuOpen(false);
    };

    return (
        <div className="relative bg-surface rounded-xl border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 group flex flex-col">
            <Link to={`/properties/${property.id}`} className="flex-1 p-6 flex flex-col" aria-label={`View details for ${property.name}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-8">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{property.name}</h3>
                        <p className="text-text-secondary text-sm flex items-center mt-1">
                            <MapPinIcon className="w-4 h-4 mr-2"/> {property.location}
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-text-secondary">Occupancy</span>
                        <span className="font-semibold text-text-primary">{occupancy.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${occupancy}%` }}></div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-text-secondary">Occupied</p>
                        <p className="text-lg font-bold text-text-primary">{occupiedUnits}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Total Units</p>
                        <p className="text-lg font-bold text-text-primary">{totalUnits}</p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Rent/Mo</p>
                        <p className="text-lg font-bold text-text-primary">{currencyFormatter.format(expectedMonthlyRent).replace('KES', '').trim()}</p>
                    </div>
                </div>
            </Link>

            {user?.role === 'admin' && (
                <div className="absolute top-4 right-4 z-10" ref={menuRef}>
                    <button 
                        onClick={() => setMenuOpen(prev => !prev)} 
                        className="p-2 rounded-full text-text-secondary hover:bg-slate-700 hover:text-text-primary transition-colors" 
                        aria-label={`Actions for ${property.name}`}
                    >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-border rounded-lg shadow-lg z-20 animate-fade-in origin-top-right">
                            <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-text-primary hover:bg-surface">
                                <PencilIcon className="w-4 h-4 mr-3 text-secondary"/> Edit
                            </button>
                            <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-danger hover:bg-surface">
                                <TrashIcon className="w-4 h-4 mr-3"/> Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const PropertiesPage: React.FC = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const data = await getProperties();
            setProperties(data);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingProperty(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (property: Property) => {
        setEditingProperty(property);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingProperty(null);
    };
    
    const handleOpenDeleteModal = (propertyId: string) => {
        setPropertyToDelete(propertyId);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setPropertyToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSaveProperty = async (data: { name: string; location: string }) => {
        try {
            if (editingProperty) {
                await updateProperty(editingProperty.id, data);
            } else {
                await createProperty(data);
            }
            handleCloseFormModal();
            fetchProperties();
        } catch (error) {
            console.error("Failed to save property:", error);
        }
    };
    
    const handleDeleteProperty = async () => {
        if (!propertyToDelete) return;
        try {
            await deleteProperty(propertyToDelete);
            fetchProperties();
        } catch (error) {
            console.error("Failed to delete property:", error);
        } finally {
            handleCloseConfirmModal();
        }
    };

    const filteredProperties = properties.filter(property =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                 <h1 className="text-3xl font-bold text-text-primary">Properties</h1>
                 <div className="flex items-center gap-4">
                    <div className="relative flex-grow">
                         <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                         <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-surface border border-border rounded-lg pl-11 pr-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <button onClick={handleOpenCreateModal} className="flex-shrink-0 flex items-center justify-center bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Property
                        </button>
                    )}
                 </div>
            </div>

            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(prop => (
                        <PropertyCard 
                            key={prop.id} 
                            property={prop}
                            onEdit={handleOpenEditModal}
                            onDelete={handleOpenDeleteModal}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border">
                    <BuildingOffice2Icon className="mx-auto h-12 w-12 text-text-secondary" />
                    <h3 className="mt-4 text-xl font-semibold text-text-primary">No Properties Found</h3>
                    <p className="mt-2 text-text-secondary max-w-sm mx-auto">
                        {searchQuery ? `Your search for "${searchQuery}" did not match any properties.` : 'Get started by adding your first property.'}
                    </p>
                     {!searchQuery && properties.length < 1 && user?.role === 'admin' && (
                        <button onClick={handleOpenCreateModal} className="mt-6 flex items-center justify-center bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20 mx-auto">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add First Property
                        </button>
                    )}
                </div>
            )}
            
            <PropertyFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSave={handleSaveProperty}
                propertyToEdit={editingProperty}
            />
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleDeleteProperty}
                title="Delete Property"
                message="Are you sure you want to delete this property? All associated units, tenants, and payment records will be permanently removed. This action cannot be undone."
            />
        </div>
    );
};

export default PropertiesPage;