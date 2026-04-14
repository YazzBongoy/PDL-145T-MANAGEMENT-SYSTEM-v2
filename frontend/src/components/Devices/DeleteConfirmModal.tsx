import React from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import type { Device } from '../../types';
import './Devices.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  device: Device | null;
  isLoading?: boolean;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  device, 
  isLoading 
}: DeleteConfirmModalProps): React.ReactElement | null {
  if (!isOpen || !device) return null;

  return (
    <div className="modal-overlay" data-testid="delete-confirm-modal-overlay">
      <div className="modal-container modal-container--small" data-testid="delete-confirm-modal">
        <div className="modal-header modal-header--warning">
          <div className="modal-title-with-icon">
            <AlertTriangle size={24} className="warning-icon" />
            <h2>Delete Device</h2>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            disabled={isLoading}
            data-testid="delete-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <p className="delete-warning-text">
            Are you sure you want to delete <strong>{device.Name}</strong>?
          </p>
          <p className="delete-subtext">
            This action cannot be undone. The device will be permanently removed from the system.
          </p>
          
          {device.SerialNumber && (
            <div className="device-info-box">
              <span className="label">Serial Number:</span>
              <span className="value">{device.SerialNumber}</span>
            </div>
          )}
          
          <div className="device-info-box">
            <span className="label">Type:</span>
            <span className="value">{device.Type}</span>
          </div>
        </div>

        <div className="modal-actions modal-actions--danger">
          <button 
            type="button" 
            className="btn btn--secondary" 
            onClick={onClose}
            disabled={isLoading}
            data-testid="delete-modal-cancel"
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="delete-modal-confirm"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Device
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
