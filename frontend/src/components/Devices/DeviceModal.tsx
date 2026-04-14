import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Device } from '../../types';
import './Devices.css';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DeviceFormData) => void;
  device?: Device | null;
  isLoading?: boolean;
}

export interface DeviceFormData {
  name: string;
  type: string;
  description?: string;
  status: 'active' | 'maintenance' | 'inactive';
  location?: string;
  serialNumber?: string;
  quantity: number;
  cost: number;
  purchaseDate?: string;
}

const deviceTypes = [
  'Heavy Machinery',
  'Power Equipment',
  'Workshop Equipment',
  'Vehicle',
  'Tool',
  'Safety Equipment',
  'Other'
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'status-active' },
  { value: 'maintenance', label: 'Maintenance', color: 'status-maintenance' },
  { value: 'inactive', label: 'Inactive', color: 'status-inactive' }
];

export function DeviceModal({ isOpen, onClose, onSave, device, isLoading }: DeviceModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    type: '',
    description: '',
    status: 'active',
    location: '',
    serialNumber: '',
    quantity: 1,
    cost: 0,
    purchaseDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.Name || '',
        type: device.Type || '',
        description: device.Description || '',
        status: (device.Status as 'active' | 'maintenance' | 'inactive') || 'active',
        location: device.Location || '',
        serialNumber: device.SerialNumber || '',
        quantity: device.Quantity || 1,
        cost: device.Cost ?? 0,
        purchaseDate: device.PurchaseDate ? new Date(device.PurchaseDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
        description: '',
        status: 'active',
        location: '',
        serialNumber: '',
        quantity: 1,
        cost: 0,
        purchaseDate: ''
      });
    }
    setErrors({});
  }, [device, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof DeviceFormData, value: string | number): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" data-testid="device-modal-overlay">
      <div className="modal-container" data-testid="device-modal">
        <div className="modal-header">
          <h2>{device ? 'Edit Device' : 'Add New Device'}</h2>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isLoading}
            data-testid="device-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="device-name">Device Name *</label>
              <input
                id="device-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter device name"
                disabled={isLoading}
                data-testid="device-modal-name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="device-type">Type *</label>
              <select
                id="device-type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={isLoading}
                data-testid="device-modal-type"
              >
                <option value="">Select type</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="device-status">Status</label>
              <select
                id="device-status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={isLoading}
                data-testid="device-modal-status"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="device-quantity">Quantity</label>
              <input
                id="device-quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                disabled={isLoading}
                data-testid="device-modal-quantity"
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="device-location">Location</label>
              <input
                id="device-location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Site A - Zone 1"
                disabled={isLoading}
                data-testid="device-modal-location"
              />
            </div>

            <div className="form-group">
              <label htmlFor="device-serial">Serial Number</label>
              <input
                id="device-serial"
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="Enter serial number"
                disabled={isLoading}
                data-testid="device-modal-serial"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="device-cost">Cost ($)</label>
              <input
                id="device-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="Enter cost"
                disabled={isLoading}
                data-testid="device-modal-cost"
              />
              {errors.cost && <span className="error-message">{errors.cost}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="device-purchase-date">Purchase Date</label>
              <input
                id="device-purchase-date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                disabled={isLoading}
                data-testid="device-modal-purchase-date"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="device-description">Description</label>
            <textarea
              id="device-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter device description"
              rows={3}
              disabled={isLoading}
              data-testid="device-modal-description"
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={onClose}
              disabled={isLoading}
              data-testid="device-modal-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={isLoading}
              data-testid="device-modal-save"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {device ? 'Update Device' : 'Add Device'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
