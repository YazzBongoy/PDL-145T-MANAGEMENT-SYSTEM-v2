import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Edit2, Trash2, Loader2, AlertCircle, Download, File, FileImage, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { Document } from '../../types';
import './Documents.css';

const auth = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch(getApiUrl('/api/documents'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
};

const uploadDocument = async (formData: FormData): Promise<Document> => {
  const response = await fetch(getApiUrl('/api/documents/upload'), {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload document');
  }
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
    headers: auth()
  });
  if (!response.ok) throw new Error('Failed to delete document');
};

const fetchProjects = async () => {
  const r = await fetch(getApiUrl('/api/projects'), { headers: auth() });
  return r.json() as Promise<{ ProjectID: number; Name: string }[]>;
};

const fetchContracts = async () => {
  const r = await fetch(getApiUrl('/api/contracts'), { headers: auth() });
  return r.json() as Promise<{ ContractID: number; ContractNumber: string; Title: string }[]>;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: contracts } = useQuery({ queryKey: ['contracts'], queryFn: fetchContracts });

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsModalOpen(false);
      setSelectedFile(null);
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
    const form = e.currentTarget;
    const name = (form.querySelector('[name=name]') as HTMLInputElement)?.value;
    const type = (form.querySelector('[name=type]') as HTMLSelectElement)?.value;
    const projectId = (form.querySelector('[name=projectId]') as HTMLInputElement)?.value;
    const contractId = (form.querySelector('[name=contractId]') as HTMLInputElement)?.value;

    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.DocumentID, data: { Name: name, Type: type as Document['Type'] } });
    } else {
      if (!selectedFile) return;
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('name', name || selectedFile.name);
      fd.append('type', type || 'AUTRE');
      if (projectId) fd.append('projectID', projectId);
      if (contractId) fd.append('contractID', contractId);
      uploadMutation.mutate(fd);
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
              {!editingDocument && (
                <div
                  className={`doc-dropzone${dragOver ? ' doc-dropzone--over' : ''}${selectedFile ? ' doc-dropzone--selected' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.zip,.txt"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }}
                  />
                  {selectedFile ? (
                    <><FileText size={28} color="#3b82f6" /><p className="doc-dropzone__name">{selectedFile.name}</p><span className="doc-dropzone__size">{(selectedFile.size / 1024).toFixed(1)} KB</span></>
                  ) : (
                    <><UploadCloud size={32} color="#94a3b8" /><p>Glisser-déposer ou cliquer pour sélectionner un fichier</p><span className="doc-dropzone__hint">PDF, Word, Excel, Image — max 50 MB</span></>
                  )}
                </div>
              )}
              <div className="form-group">
                <label>{t('documents.name')}</label>
                <input name="name" defaultValue={editingDocument?.Name} placeholder={selectedFile?.name || ''} />
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
              </div>
              {!editingDocument && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Projet</label>
                    <select name="projectId">
                      <option value="">— Aucun —</option>
                      {projects?.map(p => (
                        <option key={p.ProjectID} value={p.ProjectID}>{p.Name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contrat</label>
                    <select name="contractId">
                      <option value="">— Aucun —</option>
                      {contracts?.map(c => (
                        <option key={c.ContractID} value={c.ContractID}>{c.ContractNumber} – {c.Title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {uploadMutation.isError && (
                <p className="doc-upload-error">{(uploadMutation.error as Error).message}</p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => { setIsModalOpen(false); setSelectedFile(null); }}>
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={uploadMutation.isPending || updateMutation.isPending || (!editingDocument && !selectedFile)}
                >
                  {uploadMutation.isPending || updateMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Envoi...</> : editingDocument ? t('common.save') : 'Télécharger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
