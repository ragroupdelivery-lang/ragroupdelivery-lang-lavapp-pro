import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService } from '../../services/api';
import { Service, ServiceCategory } from '../../types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const initialServiceState: Omit<Service, 'id'> = { name: '', description: '', price: 0, category: ServiceCategory.Base, availability: 'avulso' };

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | Omit<Service, 'id'>>(initialServiceState);
    const [isEditing, setIsEditing] = useState(false);

    const fetchServicesData = async () => {
        setLoading(true);
        try {
            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicesData();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setEditingService(initialServiceState);
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setIsEditing(true);
        setEditingService(service);
        setIsModalOpen(true);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditingService(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            await updateService(editingService as Service);
        } else {
            await createService(editingService as Omit<Service, 'id'>);
        }
        await fetchServicesData();
        setIsModalOpen(false);
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this service?')) {
            await deleteService(id);
            await fetchServicesData();
        }
    }

    const servicesByCategory = services.reduce((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
    }, {} as Record<ServiceCategory, Service[]>);

    if (loading) return <div className="text-center p-8">Loading services...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-gray-800">Manage Services</h1>
                <button onClick={openAddModal} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded-lg">Add New Service</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(servicesByCategory).map(category => (
                    <Card key={category} title={category}>
                        <div className="space-y-3">
                            {servicesByCategory[category as ServiceCategory].map(service => (
                                <div key={service.id} className="bg-brand-gray-50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-gray-800">{service.name}</p>
                                        <p className="text-sm text-brand-gray-500">R$ {service.price.toFixed(2)}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => openEditModal(service)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                        <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Service' : 'Add New Service'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={editingService.name} onChange={handleFormChange} placeholder="Service Name" className="w-full p-2 border rounded" required />
                    <textarea name="description" value={editingService.description} onChange={handleFormChange} placeholder="Description" className="w-full p-2 border rounded" required />
                    <input name="price" type="number" step="0.01" value={editingService.price} onChange={handleFormChange} placeholder="Price" className="w-full p-2 border rounded" required />
                    <select name="category" value={editingService.category} onChange={handleFormChange} className="w-full p-2 border rounded">
                        {Object.values(ServiceCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <select name="availability" value={editingService.availability} onChange={handleFormChange} className="w-full p-2 border rounded">
                        <option value="plan">Plan Only</option>
                        <option value="avulso">One-off Only</option>
                        <option value="both">Both</option>
                    </select>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'Save Changes' : 'Create Service'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Services;
