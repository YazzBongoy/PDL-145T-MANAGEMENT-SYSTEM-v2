import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Edit2, Trash2, Loader2, AlertCircle, Download, File, FileImage, FileSpreadsheet } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Document } from '../../types';
import './Documents.css';

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch(getApiUrl('/api/documents'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
};

const createDocument = async (data: Omit<Document, 'DocumentID' | 'UploadedAt' | 'UpdatedAt' | 'Version'>): Promise<Document> => {
  const response = await fetch(getApiUrl('/api/documents'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ ...data, Version: 1 })
  });
  if (!response.ok) throw new Error('Failed to create document');
  return response.json();
};

const updateDocument = async ({ id, data }: { id: number; data: Partial<Document> }): Promise<Document> => {
  const response = await fetch(getApiUrl(`/api/documents/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update document');
  return response.json();
};

const deleteDocument = async (id: number): Promise<void> => {
  const response = await fetch(getApiUrl(`/api/documents/${id}`), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to delete document');
};

const typeIcons: Record<string, React.ReactNode> = {
  'PLAN': <FileImage size={20} />,
  'CONTRAT': <FileText size={20} />,
  'PV_RECEPTION': <FileText size={20} />,
  'RAPPORT_AVANCEMENT': <FileSpreadsheet size={20} />,
  'FACTURE': <FileText size={20} />,
  'DECOMPTE': <FileSpreadsheet size={20} />,
  'GARANTIE': <FileText size={20} />,
  'AUTRE': <File size={20} />
};

const typeColors: Record<string, string> = {
  'PLAN': 'type-plan',
  'CONTRAT': 'type-contrat',
  'PV_RECEPTION': 'type-pv',
  'RAPPORT_AVANCEMENT': 'type-rapport',
  'FACTURE': 'type-facture',
  'DECOMPTE': 'type-decompte',
  'GARANTIE': 'type-garantie',
  'AUTRE': 'type-autre'
};

export function DocumentsView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments
  });

  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsModalOpen(false);
      setEditingDocument(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] })
  });

  const filteredDocuments = documents?.filter(d => {
    const matchesSearch = d.Name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || d.Type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;
    const data = {
      Name: formData.get('name') as string,
      Type: formData.get('type') as Document['Type'],
      URL: formData.get('url') as string,
      ProjectID: parseInt(formData.get('projectId') as string) || undefined,
      ContractID: parseInt(formData.get('contractId') as string) || undefined,
      Size: parseInt(formData.get('size') as string) || undefined,
      MimeType: formData.get('mimeType') as string || undefined,
      UploadedBy: userId
    };

    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.DocumentID, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleDelete = (document: Document) => {
    if (confirm(`${t('common.delete')} ${document.Name}?`)) {
      deleteMutation.mutate(document.DocumentID);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="documents-view">
        <div className="loading-state">
          <Loader2 className="animate-spin" size={24} />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-view">
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{t('errors.generic')}: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-view">
      <div className="section-header">
        <div className="section-title">
          <FileText className="section-icon" size={24} />
          <h2>{t('documents.title')}</h2>
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
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{t('common.all')}</option>
            <option value="PLAN">{t('documents.types.PLAN')}</option>
            <option value="CONTRAT">{t('documents.types.CONTRAT')}</option>
            <option value="PV_RECEPTION">{t('documents.types.PV_RECEPTION')}</option>
            <option value="RAPPORT_AVANCEMENT">{t('documents.types.RAPPORT_AVANCEMENT')}</option>
            <option value="FACTURE">{t('documents.types.FACTURE')}</option>
            <option value="DECOMPTE">{t('documents.types.DECOMPTE')}</option>
            <option value="GARANTIE">{t('documents.types.GARANTIE')}</option>
            <option value="AUTRE">{t('documents.types.AUTRE')}</option>
          </select>
          <button 
            className="btn btn--primary" 
            onClick={() => { setEditingDocument(null); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            {t('documents.addDocument')}
          </button>
        </div>
      </div>

      {!filteredDocuments?.length && (
        <div className="empty-state">
          <p>{t('documents.title')}</p>
        </div>
      )}

      <div className="documents-list">
        {filteredDocuments?.map(document => (
          <div key={document.DocumentID} className="document-card">
            <div className={`document-icon ${typeColors[document.Type]}`}>
              {typeIcons[document.Type]}
            </div>
            <div className="document-content">
              <div className="document-header">
                <h3 className="document-name">{document.Name}</h3>
                <span className={`document-type ${typeColors[document.Type]}`}>
                  {t(`documents.types.${document.Type}`)}
                </span>
              </div>
              <div className="document-meta">
                <span className="document-version">v{document.Version}</span>
                {document.Size && (
                  <span className="document-size">{(document.Size / 1024).toFixed(1)} KB</span>
                )}
                <span className="document-date">
                  {new Date(document.UploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="document-actions">
              <button 
                className="btn btn--secondary btn--sm" 
                onClick={() => handleDownload(document.URL)}
              >
                <Download size={14} />
              </button>
              <button className="btn btn--secondary btn--sm" onClick={() => handleEdit(document)}>
                <Edit2 size={14} />
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(document)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingDocument ? t('documents.editDocument') : t('documents.addDocument')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('documents.name')} *</label>
                <input name="name" defaultValue={editingDocument?.Name} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('documents.type')}</label>
                  <select name="type" defaultValue={editingDocument?.Type || 'AUTRE'}>
                    <option value="PLAN">{t('documents.types.PLAN')}</option>
                    <option value="CONTRAT">{t('documents.types.CONTRAT')}</option>
                    <option value="PV_RECEPTION">{t('documents.types.PV_RECEPTION')}</option>
                    <option value="RAPPORT_AVANCEMENT">{t('documents.types.RAPPORT_AVANCEMENT')}</option>
                    <option value="FACTURE">{t('documents.types.FACTURE')}</option>
                    <option value="DECOMPTE">{t('documents.types.DECOMPTE')}</option>
                    <option value="GARANTIE">{t('documents.types.GARANTIE')}</option>
                    <option value="AUTRE">{t('documents.types.AUTRE')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('documents.upload')} URL *</label>
                  <input name="url" type="url" defaultValue={editingDocument?.URL} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project ID</label>
                  <input name="projectId" type="number" defaultValue={editingDocument?.ProjectID || ''} />
                </div>
                <div className="form-group">
                  <label>Contract ID</label>
                  <input name="contractId" type="number" defaultValue={editingDocument?.ContractID || ''} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Size (bytes)</label>
                  <input name="size" type="number" defaultValue={editingDocument?.Size || ''} />
                </div>
                <div className="form-group">
                  <label>MIME Type</label>
                  <input name="mimeType" defaultValue={editingDocument?.MimeType || ''} />
                </div>
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
