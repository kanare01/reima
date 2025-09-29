
import React, { useEffect, useState } from 'react';
import { getTenants, getProperties } from '../services/mockApiService';
import type { Tenant, Property } from '../types';

const TenantsPage: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tenantsData, propertiesData] = await Promise.all([
                    getTenants(),
                    getProperties()
                ]);
                setTenants(tenantsData);
                setProperties(propertiesData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getUnitInfo = (unitId: string, propertyId: string) => {
        const prop = properties.find(p => p.id === propertyId);
        if (!prop) return { unitNumber: 'N/A', propertyName: 'N/A' };
        
        for (const category of prop.unitCategories) {
            const unit = category.units.find(u => u.id === unitId);
            if (unit) {
                return { unitNumber: unit.unitNumber, propertyName: prop.name };
            }
        }
        return { unitNumber: 'N/A', propertyName: prop.name };
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading tenants...</div>;
    }

    return (
        <div className="bg-surface p-6 rounded-xl border border-border">
            <h1 className="text-2xl font-bold mb-4 text-text-primary">All Tenants</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50 text-sm uppercase text-text-secondary">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Property</th>
                            <th className="p-4">Unit #</th>
                            <th className="p-4">Move-in Date</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map(tenant => {
                            const { unitNumber, propertyName } = getUnitInfo(tenant.unitId, tenant.propertyId);
                            return (
                                <tr key={tenant.id} className="border-b border-border hover:bg-gray-800">
                                    <td className="p-4 font-medium">{tenant.name}</td>
                                    <td className="p-4">
                                        <div>{tenant.phone}</div>
                                        <div className="text-xs text-text-secondary">{tenant.email}</div>
                                    </td>
                                    <td className="p-4">{propertyName}</td>
                                    <td className="p-4">{unitNumber}</td>
                                    <td className="p-4">{new Date(tenant.moveInDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button className="text-secondary hover:underline text-sm">View Details</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantsPage;
