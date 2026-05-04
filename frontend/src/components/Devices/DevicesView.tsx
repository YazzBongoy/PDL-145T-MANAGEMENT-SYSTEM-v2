import React, { useState } from 'react';
import { Wrench, Plus, Search, Loader2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice } from '../../hooks/useDevices';
import type { UpdateDeviceData, CreateDeviceData } from '../../api/devices';
import { DeviceModal, type DeviceFormData } from './DeviceModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { Device } from '../../types';
import './Devices.css';

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'status-active';
    case 'maintenance': return 'status-maintenance';
    case 'inactive': return 'status-inactive';
    default: return 'status-default';
  }
}

export function DevicesView(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  
  const { data: allDevices, isLoading, error } = useDevices({
    search: searchQuery,
    status: statusFilter,
  });
  
  // Filter to only show equipment-type resources (EQUIPEMENT), not human resources
  const devices = allDevices?.filter(device => device.Type === 'EQUIPEMENT' || device.Type === 'MATERIEL') || [];

  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice();
  const deleteDeviceMutation = useDeleteDevice();

  const handleAddClick = (): void => {
    setSelectedDevice(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (device: Device): void => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (device: Device): void => {
    setDeviceToDelete(device);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setDeviceToDelete(null);
  };

  const handleSaveDevice = async (formData: DeviceFormData): Promise<void> => {
    try {
      if (selectedDevice) {
        await updateDeviceMutation.mutateAsync({
          id: selectedDevice.ResourceID,
          data: formData as UpdateDeviceData
        });
      } else {
        await createDeviceMutation.mutateAsync(formData as CreateDeviceData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save device:', err);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deviceToDelete) return;
    
    try {
      await deleteDeviceMutation.mutateAsync(deviceToDelete.ResourceID);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  return (
    <div className="devices-view" data-testid="devices-view">
      <div className="section-header">
        <div className="section-title">
          <Wrench className="section-icon" size={24} />
          <h2 data-testid="devices-title">Devices & Equipment</h2>
        </div>
        <div className="section-actions">
          <div className="search-box" data-testid="devices-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="devices-search-input"
            />
          </div>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="devices-status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <button 
            className="btn btn--primary" 
            onClick={handleAddClick}
            data-testid="devices-add-button"
          >
            <Plus size={16} />
            Add Device
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state" data-testid="devices-loading">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading devices...</p>
        </div>
      )}

      {error && (
        <div className="error-state" data-testid="devices-error">
          <AlertCircle size={24} />
          <p>Error loading devices: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && devices?.length === 0 && (
        <div className="empty-state" data-testid="devices-empty">
          <p>No devices found. Add your first device!</p>
        </div>
      )}

      <div className="devices-grid" data-testid="devices-grid">
        {devices?.map((device: Device) => (
          <div key={device.ResourceID} className="device-card" data-testid={`device-card-${device.ResourceID}`}>
            <div className="device-header">
              <div className="device-info">
                <h3 className="device-name" data-testid="device-name">{device.Name}</h3>
                <span className="device-type" data-testid="device-type">{device.Type}</span>
              </div>
              <span className={`device-status ${getStatusColor(device.Status)}`} data-testid="device-status">
                {device.Status}
              </span>
            </div>
            
            <div className="device-details">
              {device.Location && (
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{device.Location}</span>
                </div>
              )}
              {device.LastMaintenance && (
                <div className="detail-row">
                  <span className="detail-label">Last Maintenance:</span>
                  <span className="detail-value">{new Date(device.LastMaintenance).toLocaleDateString()}</span>
                </div>
              )}
              {device.SerialNumber && (
                <div className="detail-row">
                  <span className="detail-label">Serial Number:</span>
                  <span className="detail-value">{device.SerialNumber}</span>
                </div>
              )}
            </div>

            <div className="device-actions">
              <button 
                className="btn btn--secondary btn--sm"
                onClick={() => handleEditClick(device)}
                data-testid="device-edit-button"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button 
                className="btn btn--danger btn--sm"
                onClick={() => handleDeleteClick(device)}
                data-testid="device-delete-button"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeviceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDevice}
        device={selectedDevice}
        isLoading={createDeviceMutation.isPending || updateDeviceMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        device={deviceToDelete}
        isLoading={deleteDeviceMutation.isPending}
      />
    </div>
  );
}
