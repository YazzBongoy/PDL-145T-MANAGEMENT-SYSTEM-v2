import React, { useState, useEffect, useCallback } from 'react';
import type {
  DocumentItem,
  DocumentStats,
  DocumentFilters,
  PaginatedDocuments,
} from '../../types';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { Badge } from '../ui/Badge';
import type { BadgeProps } from '../ui/Badge';
import type { TableColumn } from '../ui/Table';
import { Table } from '../ui/Table';
import './DocumentList.css';

interface DocumentListProps {
  token: string;
  limit?: number;
}

const EMPTY_FILTERS: DocumentFilters = {
  category: '',
  lot: '',
  territoire: '',
  siteId: '',
  phase: '',
  q: '',
};

const CATEGORIES = ['JURIDIQUE', 'FINANCE', 'SUIVI', 'TECHNIQUE', 'ADMIN'];
const TERRITOIRES = ['Inongo', 'Kutu', 'Mushie', 'Yumbi'];
const LOTS = ['Lot 2', 'Lot 4', 'Lot 6', 'Lot 8'];
const PHASES = ['Phase 1', 'Phase 2'];

const CATEGORY_VARIANTS: Record<string, BadgeProps['variant']> = {
  JURIDIQUE: 'info',
  FINANCE: 'success',
  SUIVI: 'default',
  TECHNIQUE: 'warning',
  ADMIN: 'error',
};

export function DocumentList({ token, limit = 20 }: DocumentListProps): React.ReactElement {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce de la recherche libre
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => (prev.q === searchInput ? prev : { ...prev, q: searchInput }));
      setPage(1);
    }, 300);
    return (): void => clearTimeout(timer);
  }, [searchInput]);

  const fetchDocuments = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      (Object.keys(filters) as (keyof DocumentFilters)[]).forEach(key => {
        if (filters[key]) params.set(key, filters[key]);
      });

      const res = await fetch(`/api/documents?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Echec du chargement des documents');
      const payload: PaginatedDocuments = await res.json();
      setDocuments(payload.data);
      setTotal(payload.pagination.total);
      setTotalPages(payload.pagination.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Echec du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, filters]);

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/documents/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setStats(await res.json());
    } catch {
      // Les statistiques sont non bloquantes
    }
  }, [token]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = useCallback((key: keyof DocumentFilters, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleReset = useCallback((): void => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
    setPage(1);
  }, []);

  const handleDownload = useCallback(async (doc: DocumentItem): Promise<void> => {
    try {
      const res = await fetch(`/api/documents/${doc.DocumentID}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Fichier indisponible');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.FileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fichier indisponible');
    }
  }, [token]);

  const formatDate = (value?: string | null): string =>
    value ? new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const columns: TableColumn<DocumentItem>[] = [
    {
      key: 'title',
      title: 'Document',
      width: '32%',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.Title}</div>
          <div className="text-sm text-gray-500">{record.FileName}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Categorie',
      width: '12%',
      align: 'center',
      render: (_, record) => (
        <Badge variant={CATEGORY_VARIANTS[record.Category] ?? 'default'}>{record.Category}</Badge>
      ),
    },
    {
      key: 'lot',
      title: 'Lot',
      width: '10%',
      render: (_, record) => record.Lot ?? '—',
    },
    {
      key: 'territory',
      title: 'Territoire',
      width: '12%',
      render: (_, record) => record.Territory?.Name ?? '—',
    },
    {
      key: 'site',
      title: 'Site',
      width: '12%',
      render: (_, record) => record.Site?.Name ?? record.SiteID ?? '—',
    },
    {
      key: 'phase',
      title: 'Phase',
      width: '10%',
      render: (_, record) => record.Phase ?? '—',
    },
    {
      key: 'date',
      title: 'Date',
      width: '12%',
      render: (_, record) => formatDate(record.DocumentDate),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      align: 'right',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => handleDownload(record)}
          className="btn btn--secondary btn--sm"
          title="Telecharger le document"
        >
          Telecharger
        </button>
      ),
    },
  ];

  return (
    <Card variant="outlined">
      <CardHeader
        title="Documents PDL-145T"
        actions={
          stats ? (
            <span className="document-list__total">{stats.total} documents classes</span>
          ) : null
        }
      />

      {stats && (
        <div className="document-list__stats" aria-label="Repartition documentaire">
          {CATEGORIES.map(category => (
            <Badge key={category} variant={CATEGORY_VARIANTS[category] ?? 'default'}>
              {category} : {stats.byCategory[category] ?? 0}
            </Badge>
          ))}
        </div>
      )}

      <div className="document-list__filters" role="search">
        <label className="document-list__field">
          <span>Categorie</span>
          <select
            className="input"
            value={filters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
            aria-label="Filtrer par categorie"
          >
            <option value="">Toutes</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="document-list__field">
          <span>Lot</span>
          <select
            className="input"
            value={filters.lot}
            onChange={e => handleFilterChange('lot', e.target.value)}
            aria-label="Filtrer par lot"
          >
            <option value="">Tous</option>
            {LOTS.map(lot => (
              <option key={lot} value={lot}>{lot}</option>
            ))}
          </select>
        </label>

        <label className="document-list__field">
          <span>Territoire</span>
          <select
            className="input"
            value={filters.territoire}
            onChange={e => handleFilterChange('territoire', e.target.value)}
            aria-label="Filtrer par territoire"
          >
            <option value="">Tous</option>
            {TERRITOIRES.map(territoire => (
              <option key={territoire} value={territoire}>{territoire}</option>
            ))}
          </select>
        </label>

        <label className="document-list__field">
          <span>Phase</span>
          <select
            className="input"
            value={filters.phase}
            onChange={e => handleFilterChange('phase', e.target.value)}
            aria-label="Filtrer par phase"
          >
            <option value="">Toutes</option>
            {PHASES.map(phase => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
        </label>

        <label className="document-list__field document-list__field--grow">
          <span>Recherche</span>
          <input
            className="input"
            type="search"
            placeholder="Titre, fichier, notes..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Rechercher un document"
          />
        </label>

        <button type="button" onClick={handleReset} className="btn btn--secondary">
          Reinitialiser
        </button>
      </div>

      {error && <p className="error" role="alert" aria-live="polite">{error}</p>}

      <Table
        dataSource={documents}
        columns={columns}
        loading={loading}
        rowKey={record => record.DocumentID}
        emptyState={
          <>
            <div className="text-4xl mb-4">🗂️</div>
            <div className="font-medium text-gray-600">Aucun document trouve</div>
            <div className="text-sm text-gray-500 mt-2">
              Ajustez les filtres ou lancez le seed documentaire.
            </div>
          </>
        }
        caption="Documents du programme PDL-145T classes selon l'ontologie ascat"
      />

      {totalPages > 1 && (
        <div className="document-list__pagination">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Precedent
          </button>
          <span className="document-list__page-info">
            Page {page} / {totalPages} — {total} documents
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Suivant
          </button>
        </div>
      )}
    </Card>
  );
}

export default DocumentList;
