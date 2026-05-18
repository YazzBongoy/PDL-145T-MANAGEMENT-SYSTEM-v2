import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Edit2, Trash2, Loader2, AlertCircle, Calendar, DollarSign, Building2 } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Contract, Enterprise } from '../../types';
import './Contracts.css';

const fetchContracts = async (): Promise<Contract[]> => {
  const response = await fetch(getApiUrl('/api/contracts'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

const fetchEnterprises = async (): Promise<Enterprise[]> => {
  const response = await fetch(getApiUrl('/api/enterprises'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch enterprises');
  return response.json();
};

const createContract = async (data: Omit<Contract, 'ContractID' | 'CreatedAt' | 'UpdatedAt'>): Promise<Contract> => {
  const response = await fetch(getApiUrl('/api/contracts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create contract');
  return response.json();
};

const updateContract = async ({ id, data }: { id: number; data: Partial<Contract> }): Promise<Contract> => {
  const response = await fetch(getApiUrl(`/api/contracts/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update contract');
  return response.json();
};

const deleteContract = async (id: number): Promise<void> => {
  const response = await fetch(getApiUrl(`/api/contracts/${id}`), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to delete contract');
};

const statusColors: Record<string, string> = {
  'DRAFT': 'status-draft',
  'PENDING_APPROVAL': 'status-pending',
  'ACTIVE': 'status-active',
  'SUSPENDED': 'status-suspended',
  'COMPLETED': 'status-completed',
  'TERMINATED': 'status-terminated'
};

export function ContractsView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const { data: contracts, isLoading: contractsLoading, error: contractsError } = useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts
  });

  const { data: enterprises } = useQuery({
    queryKey: ['enterprises'],
    queryFn: fetchEnterprises
  });

  const createMutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsModalOpen(false);
      setEditingContract(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] })
  });

  const filteredContracts = contracts?.filter(c =>
    c.ContractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ContractNumber: formData.get('contractNumber') as string,
      ProjectID: parseInt(formData.get('projectId') as string) || 1,
      EnterpriseID: parseInt(formData.get('enterpriseId') as string),
      Title: formData.get('title') as string,
      TotalAmount: parseFloat(formData.get('totalAmount') as string),
      StartDate: formData.get('startDate') as string,
      EndDate: formData.get('endDate') as string || undefined,
      Status: formData.get('status') as Contract['Status'],
      AdvancePayment: parseFloat(formData.get('advancePayment') as string) || 0,
      RetentionRate: parseFloat(formData.get('retentionRate') as string) || 5,
      PenaltyRate: parseFloat(formData.get('penaltyRate') as string) || 0.1,
      Description: formData.get('description') as string || undefined
    };

    if (editingContract) {
      updateMutation.mutate({ id: editingContract.ContractID, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    if (confirm(`${t('common.delete')} ${contract.ContractNumber}?`)) {
      deleteMutation.mutate(contract.ContractID);
    }
  };

  const getEnterpriseName = (id: number) => {
    return enterprises?.find(e => e.EnterpriseID === id)?.Name || `Enterprise ${id}`;
  };

  if (contractsLoading) {
    return (
      <div className="contracts-view">
        <div className="loading-state">
          <Loader2 className="animate-spin" size={24} />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (contractsError) {
    return (
      <div className="contracts-view">
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{t('errors.generic')}: {contractsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contracts-view">
      <div className="section-header">
        <div className="section-title">
          <FileText className="section-icon" size={24} />
          <h2>{t('contracts.title')}</h2>
        </div>
        <div className="section-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder={t('common.search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn btn--primary" 
            onClick={() => { setEditingContract(null); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            {t('contracts.addContract')}
          </button>
        </div>
      </div>

      {!filteredContracts?.length && (
        <div className="empty-state">
          <p>{t('contracts.title')}</p>
        </div>
      )}

      <div className="contracts-list">
        {filteredContracts?.map(contract => (
          <div key={contract.ContractID} className="contract-card">
            <div className="contract-header">
              <div className="contract-info">
                <div className="contract-number">{contract.ContractNumber}</div>
                <h3 className="contract-title">{contract.Title}</h3>
                <span className={`contract-status ${statusColors[contract.Status]}`}>
                  {t(`contracts.statusValues.${contract.Status}`)}
                </span>
              </div>
              <div className="contract-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => handleEdit(contract)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(contract)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="contract-details">
              <div className="detail-item">
                <Building2 size={14} />
                <span>{getEnterpriseName(contract.EnterpriseID)}</span>
              </div>
              <div className="detail-item">
                <DollarSign size={14} />
                <span>{contract.TotalAmount.toLocaleString()} $</span>
              </div>
              <div className="detail-item">
                <Calendar size={14} />
                <span>{new Date(contract.StartDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="contract-rules">
              <div className="rule-item">
                <span className="rule-label">{t('contracts.advancePayment')}:</span>
                <span className="rule-value">{contract.AdvancePayment || 30}%</span>
              </div>
              <div className="rule-item">
                <span className="rule-label">{t('contracts.retention')}:</span>
                <span className="rule-value">{contract.RetentionRate || 5}%</span>
              </div>
              <div className="rule-item">
                <span className="rule-label">{t('contracts.penalty')}:</span>
                <span className="rule-value">{contract.PenaltyRate || 0.1}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editingContract ? t('contracts.editContract') : t('contracts.addContract')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('contracts.contractNumber')} *</label>
                  <input name="contractNumber" defaultValue={editingContract?.ContractNumber} required />
                </div>
                <div className="form-group">
                  <label>{t('contracts.status')}</label>
                  <select name="status" defaultValue={editingContract?.Status || 'DRAFT'}>
                    <option value="DRAFT">{t('contracts.statusValues.DRAFT')}</option>
                    <option value="PENDING_APPROVAL">{t('contracts.statusValues.PENDING_APPROVAL')}</option>
                    <option value="ACTIVE">{t('contracts.statusValues.ACTIVE')}</option>
                    <option value="SUSPENDED">{t('contracts.statusValues.SUSPENDED')}</option>
                    <option value="COMPLETED">{t('contracts.statusValues.COMPLETED')}</option>
                    <option value="TERMINATED">{t('contracts.statusValues.TERMINATED')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('contracts.title')} *</label>
                <input name="title" defaultValue={editingContract?.Title} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('enterprises.title')} *</label>
                  <select name="enterpriseId" defaultValue={editingContract?.EnterpriseID} required>
                    <option value="">{t('common.select')}</option>
                    {enterprises?.map(e => (
                      <option key={e.EnterpriseID} value={e.EnterpriseID}>{e.Name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('contracts.totalAmount')} *</label>
                  <input name="totalAmount" type="number" step="0.01" defaultValue={editingContract?.TotalAmount} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('contracts.startDate')} *</label>
                  <input name="startDate" type="date" defaultValue={editingContract?.StartDate?.split('T')[0]} required />
                </div>
                <div className="form-group">
                  <label>{t('contracts.endDate')}</label>
                  <input name="endDate" type="date" defaultValue={editingContract?.EndDate?.split('T')[0]} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('contracts.advancePayment')} (%)</label>
                  <input name="advancePayment" type="number" min="0" max="100" defaultValue={editingContract?.AdvancePayment || 30} />
                </div>
                <div className="form-group">
                  <label>{t('contracts.retention')} (%)</label>
                  <input name="retentionRate" type="number" min="0" max="100" defaultValue={editingContract?.RetentionRate || 5} />
                </div>
                <div className="form-group">
                  <label>{t('contracts.penalty')} (%)</label>
                  <input name="penaltyRate" type="number" step="0.1" defaultValue={editingContract?.PenaltyRate || 0.1} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('tasks.description')}</label>
                <textarea name="description" defaultValue={editingContract?.Description || ''} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
