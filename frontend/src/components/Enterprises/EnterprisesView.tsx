import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, Edit2, Trash2, Loader2, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Enterprise } from '../../types';
import './Enterprises.css';

const fetchEnterprises = async (): Promise<Enterprise[]> => {
  const response = await fetch(getApiUrl('/api/enterprises'), {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch enterprises');
  return response.json();
};

const createEnterprise = async (data: Omit<Enterprise, 'EnterpriseID' | 'CreatedAt' | 'UpdatedAt'>): Promise<Enterprise> => {
  const response = await fetch(getApiUrl('/api/enterprises'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create enterprise');
  return response.json();
};

const updateEnterprise = async ({ id, data }: { id: number; data: Partial<Enterprise> }): Promise<Enterprise> => {
  const response = await fetch(getApiUrl(`/api/enterprises/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update enterprise');
  return response.json();
};

const deleteEnterprise = async (id: number): Promise<void> => {
  const response = await fetch(getApiUrl(`/api/enterprises/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete enterprise');
};

const typeColors: Record<string, string> = {
  'ASCAT_SARL': 'type-ascat',
  'SPPE_SARL': 'type-sppe',
  'CFEF': 'type-cfef',
  'OTHER': 'type-other'
};

const roleColors: Record<string, string> = {
  'CHEF_FILE': 'role-chef',
  'MEMBRE_GROUPEMENT': 'role-membre',
  'CFEF_CONTRACTANT': 'role-cfef',
  'SOUS_TRAITANT': 'role-sous'
};

export function EnterprisesView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);

  const { data: enterprises, isLoading, error } = useQuery({
    queryKey: ['enterprises'],
    queryFn: fetchEnterprises
  });

  const createMutation = useMutation({
    mutationFn: createEnterprise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateEnterprise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
      setIsModalOpen(false);
      setEditingEnterprise(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEnterprise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprises'] });
    }
  });

  const filteredEnterprises = enterprises?.filter(e =>
    e.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.ContactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      Name: formData.get('name') as string,
      Type: formData.get('type') as Enterprise['Type'],
      Role: formData.get('role') as Enterprise['Role'],
      ContactEmail: formData.get('contactEmail') as string || undefined,
      ContactPhone: formData.get('contactPhone') as string || undefined,
      Address: formData.get('address') as string || undefined,
      TaxID: formData.get('taxId') as string || undefined
    };

    if (editingEnterprise) {
      updateMutation.mutate({ id: editingEnterprise.EnterpriseID, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (enterprise: Enterprise) => {
    setEditingEnterprise(enterprise);
    setIsModalOpen(true);
  };

  const handleDelete = (enterprise: Enterprise) => {
    if (confirm(`${t('common.delete')} ${enterprise.Name}?`)) {
      deleteMutation.mutate(enterprise.EnterpriseID);
    }
  };

  return (
    <div className="enterprises-view">
      <div className="section-header">
        <div className="section-title">
          <Building2 className="section-icon" size={24} />
          <h2>{t('enterprises.title')}</h2>
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
            onClick={() => { setEditingEnterprise(null); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            {t('enterprises.addEnterprise')}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={24} />
          <p>{t('common.loading')}</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{t('errors.generic')}: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && filteredEnterprises?.length === 0 && (
        <div className="empty-state">
          <p>{t('enterprises.title')}</p>
        </div>
      )}

      <div className="enterprises-list">
        {filteredEnterprises?.map(enterprise => (
          <div key={enterprise.EnterpriseID} className="enterprise-card">
            <div className="enterprise-header">
              <div className="enterprise-info">
                <h3 className="enterprise-name">{enterprise.Name}</h3>
                <div className="enterprise-badges">
                  <span className={`badge ${typeColors[enterprise.Type]}`}>
                    {t(`enterprises.types.${enterprise.Type}`)}
                  </span>
                  <span className={`badge ${roleColors[enterprise.Role]}`}>
                    {t(`enterprises.roles.${enterprise.Role}`)}
                  </span>
                </div>
              </div>
              <div className="enterprise-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => handleEdit(enterprise)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(enterprise)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="enterprise-contacts">
              {enterprise.ContactEmail && (
                <div className="contact-item">
                  <Mail size={14} />
                  <span>{enterprise.ContactEmail}</span>
                </div>
              )}
              {enterprise.ContactPhone && (
                <div className="contact-item">
                  <Phone size={14} />
                  <span>{enterprise.ContactPhone}</span>
                </div>
              )}
              {enterprise.Address && (
                <div className="contact-item">
                  <MapPin size={14} />
                  <span>{enterprise.Address}</span>
                </div>
              )}
            </div>

            {enterprise.TaxID && (
              <div className="enterprise-tax">
                Tax ID: {enterprise.TaxID}
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEnterprise ? t('enterprises.editEnterprise') : t('enterprises.addEnterprise')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('enterprises.name')} *</label>
                <input name="name" defaultValue={editingEnterprise?.Name} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('enterprises.type')}</label>
                  <select name="type" defaultValue={editingEnterprise?.Type || 'OTHER'}>
                    <option value="ASCAT_SARL">{t('enterprises.types.ASCAT_SARL')}</option>
                    <option value="SPPE_SARL">{t('enterprises.types.SPPE_SARL')}</option>
                    <option value="CFEF">{t('enterprises.types.CFEF')}</option>
                    <option value="OTHER">{t('enterprises.types.OTHER')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('enterprises.role')}</label>
                  <select name="role" defaultValue={editingEnterprise?.Role || 'MEMBRE_GROUPEMENT'}>
                    <option value="CHEF_FILE">{t('enterprises.roles.CHEF_FILE')}</option>
                    <option value="MEMBRE_GROUPEMENT">{t('enterprises.roles.MEMBRE_GROUPEMENT')}</option>
                    <option value="CFEF_CONTRACTANT">{t('enterprises.roles.CFEF_CONTRACTANT')}</option>
                    <option value="SOUS_TRAITANT">{t('enterprises.roles.SOUS_TRAITANT')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('enterprises.contact')} Email</label>
                <input name="contactEmail" type="email" defaultValue={editingEnterprise?.ContactEmail || ''} />
              </div>
              <div className="form-group">
                <label>{t('enterprises.contact')} Phone</label>
                <input name="contactPhone" defaultValue={editingEnterprise?.ContactPhone || ''} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" defaultValue={editingEnterprise?.Address || ''} />
              </div>
              <div className="form-group">
                <label>Tax ID</label>
                <input name="taxId" defaultValue={editingEnterprise?.TaxID || ''} />
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
