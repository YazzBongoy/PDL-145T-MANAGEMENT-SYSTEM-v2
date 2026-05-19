import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, Loader2, ChevronDown, ChevronRight, MapPin, Filter } from 'lucide-react';
import './Tasks.css';
import { getApiUrl } from '../../api/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site {
  SiteID: string;
  Name: string;
  Type: string;
  Province: string;
}

interface Task {
  TaskID: number;
  ProjectID: number;
  SiteID: string | null;
  ParentTaskID: number | null;
  Name: string;
  CompletionStatus: string;
  progressPercentage: number;
  Level: number;
  SortOrder: number;
  Weight: number;
  Site?: Site | null;
  children?: Task[];
}

interface Project {
  ProjectID: number;
  Name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  NotStarted: 'Non commencé',
  InProgress: 'En cours',
  Completed: 'Terminé',
  Blocked: 'Bloqué',
};

const STATUS_COLORS: Record<string, string> = {
  NotStarted: '#94a3b8',
  InProgress: '#3b82f6',
  Completed: '#22c55e',
  Blocked: '#ef4444',
};

const TYPE_LABEL: Record<string, string> = {
  ECOLE_PRIMAIRE: 'EP',
  CENTRE_DE_SANTE: 'CS',
  BATIMENT_ADMINISTRATIF: 'BA',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const auth = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

function buildTree(flat: Task[]): Task[] {
  const sorted = [...flat].sort((a, b) => a.SortOrder - b.SortOrder);
  const map = new Map<number, Task>();
  sorted.forEach(t => map.set(t.TaskID, { ...t, children: [] }));
  const roots: Task[] = [];
  map.forEach(t => {
    if (t.ParentTaskID && map.has(t.ParentTaskID)) map.get(t.ParentTaskID)!.children!.push(t);
    else if (!t.ParentTaskID) roots.push(t);
  });
  return roots;
}

function countStats(tasks: Task[]): { total: number; done: number; inProgress: number; blocked: number } {
  let total = 0, done = 0, inProgress = 0, blocked = 0;
  const walk = (t: Task) => {
    total++;
    if (t.CompletionStatus === 'Completed') done++;
    else if (t.CompletionStatus === 'InProgress') inProgress++;
    else if (t.CompletionStatus === 'Blocked') blocked++;
    t.children?.forEach(walk);
  };
  tasks.forEach(walk);
  return { total, done, inProgress, blocked };
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function progressToStatus(p: number, current: string): string {
  if (current === 'Blocked') return 'Blocked';
  if (p === 0) return 'NotStarted';
  if (p >= 100) return 'Completed';
  return 'InProgress';
}

function TaskRow({ task, depth, onUpdate }: {
  task: Task;
  depth: number;
  onUpdate: (id: number, status: string, progress: number, level: number) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const [localProgress, setLocalProgress] = useState(task.progressPercentage);
  const [localStatus, setLocalStatus] = useState(task.CompletionStatus);
  const hasChildren = (task.children?.length || 0) > 0;
  const isLeaf = task.Level === 3;
  const isCalc = !isLeaf;

  return (
    <>
      <tr className={`tv-row tv-row--d${Math.min(depth, 2)} ${isCalc ? 'tv-row--calc' : ''}`}>
        <td style={{ paddingLeft: `${8 + depth * 20}px` }}>
          <div className="tv-name-cell">
            {hasChildren ? (
              <button className="tv-toggle" onClick={() => setOpen(o => !o)}>
                {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            ) : <span className="tv-toggle-gap" />}
            {task.CompletionStatus === 'Completed' && <CheckCircle size={13} color="#22c55e" />}
            {task.CompletionStatus === 'InProgress' && <Clock size={13} color="#3b82f6" />}
            {task.CompletionStatus === 'Blocked' && <AlertCircle size={13} color="#ef4444" />}
            {task.CompletionStatus === 'NotStarted' && <Clock size={13} color="#94a3b8" />}
            <span className={depth === 0 ? 'tv-name tv-name--l1' : depth === 1 ? 'tv-name tv-name--l2' : 'tv-name'}>{task.Name}</span>
            {isLeaf && task.Weight > 0 && <span className="tv-weight">{task.Weight}%</span>}
          </div>
        </td>
        <td>
          {isCalc ? (
            <span className="tv-status-calc" style={{ color: STATUS_COLORS[task.CompletionStatus] }}>
              {STATUS_LABELS[task.CompletionStatus] || task.CompletionStatus}
            </span>
          ) : (
            <div className="tv-status-leaf">
              <span className="tv-status-badge" style={{ background: STATUS_COLORS[localStatus] + '22', color: STATUS_COLORS[localStatus], borderColor: STATUS_COLORS[localStatus] }}>
                {STATUS_LABELS[localStatus] || localStatus}
              </span>
              {localStatus !== 'Blocked' ? (
                <button
                  className="tv-blocked-btn"
                  title="Marquer comme bloqué"
                  onClick={() => { setLocalStatus('Blocked'); onUpdate(task.TaskID, 'Blocked', localProgress, task.Level); }}
                >⊘</button>
              ) : (
                <button
                  className="tv-blocked-btn tv-blocked-btn--active"
                  title="Débloquer"
                  onClick={() => { const s = progressToStatus(localProgress, 'InProgress'); setLocalStatus(s); onUpdate(task.TaskID, s, localProgress, task.Level); }}
                >⊘</button>
              )}
            </div>
          )}
        </td>
        <td>
          <div className="tv-progress-cell">
            {isCalc ? (
              <>
                <span className="tv-progress-calc">{task.progressPercentage}%</span>
                <div className="tv-bar"><div className="tv-bar-fill tv-bar-fill--calc" style={{ width: `${task.progressPercentage}%` }} /></div>
              </>
            ) : (
              <>
                <input
                  className="tv-progress-input"
                  type="number" min={0} max={100}
                  value={localProgress}
                  onChange={e => {
                    const v = Math.min(100, Math.max(0, Number(e.target.value)));
                    setLocalProgress(v);
                    if (localStatus !== 'Blocked') setLocalStatus(progressToStatus(v, localStatus));
                  }}
                  onBlur={() => onUpdate(task.TaskID, localStatus, localProgress, task.Level)}
                />
                <span className="tv-pct">%</span>
                <div className="tv-bar"><div className="tv-bar-fill" style={{ width: `${localProgress}%`, background: localProgress >= 100 ? '#22c55e' : localProgress > 0 ? '#3b82f6' : '#e5e7eb' }} /></div>
              </>
            )}
          </div>
        </td>
      </tr>
      {open && hasChildren && task.children!.map(c => (
        <TaskRow key={c.TaskID} task={c} depth={depth + 1} onUpdate={onUpdate} />
      ))}
    </>
  );
}

// ─── SiteBlock ────────────────────────────────────────────────────────────────

function SiteBlock({ site, projectId, statusFilter }: { site: Site; projectId: number; statusFilter: string }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks-site', site.SiteID],
    queryFn: async () => {
      const r = await fetch(getApiUrl(`/api/tasks?projectId=${projectId}&siteId=${site.SiteID}`), { headers: auth() });
      return r.json() as Promise<Task[]>;
    },
    enabled: open,
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status, progress, level }: { id: number; status: string; progress: number; level: number }) => {
      // Level 3 (feuille) → endpoint dédié qui recalcule les parents
      // Level 1/2 (rubrique) → ne pas permettre la mise à jour manuelle
      if (level !== 3) return null;
      const r = await fetch(getApiUrl(`/api/tasks/${id}/progress`), {
        method: 'PATCH', headers: auth(),
        body: JSON.stringify({ progressPercentage: progress, CompletionStatus: status }),
      });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-site', site.SiteID] }),
  });

  const allTasks = tasks || [];
  const filtered = statusFilter
    ? allTasks.filter(t => t.CompletionStatus === statusFilter)
    : allTasks;
  const tree = buildTree(filtered);
  const stats = countStats(buildTree(allTasks));
  const avgProgress = allTasks.length > 0
    ? Math.round(allTasks.reduce((s, t) => s + (t.progressPercentage || 0), 0) / allTasks.length)
    : 0;

  const typeLabel = TYPE_LABEL[site.Type] || site.Type;

  return (
    <div className="tv-site-block">
      <button className="tv-site-header" onClick={() => setOpen(o => !o)}>
        <span className={`tv-type-badge tv-type-badge--${typeLabel.toLowerCase()}`}>{typeLabel}</span>
        <span className="tv-site-name">{site.Name}</span>
        <span className="tv-site-stats">
          <span className="tv-stat tv-stat--done">{stats.done} ✓</span>
          <span className="tv-stat tv-stat--progress">{stats.inProgress} ⏳</span>
          {stats.blocked > 0 && <span className="tv-stat tv-stat--blocked">{stats.blocked} ✗</span>}
          <span className="tv-stat">{avgProgress}%</span>
        </span>
        <div className="tv-site-bar"><div className="tv-site-bar-fill" style={{ width: `${avgProgress}%` }} /></div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="tv-site-content">
          {isLoading && <div className="tv-loading"><Loader2 className="animate-spin" size={18} /> Chargement...</div>}
          {!isLoading && tree.length === 0 && <p className="tv-empty">Aucune tâche{statusFilter ? ' pour ce filtre' : ''}.</p>}
          {!isLoading && tree.length > 0 && (
            <table className="tv-table">
              <thead>
                <tr>
                  <th>Tâche</th>
                  <th style={{ width: '160px' }}>Statut</th>
                  <th style={{ width: '180px' }}>Avancement</th>
                </tr>
              </thead>
              <tbody>
                {tree.map(t => (
                  <TaskRow key={t.TaskID} task={t} depth={0}
                    onUpdate={(id, status, progress, level) => updateMut.mutate({ id, status, progress, level })} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TasksView (main) ─────────────────────────────────────────────────────────

export function TasksView({ initialProjectId }: { initialProjectId?: number } = {}) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId ?? null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const r = await fetch(getApiUrl('/api/projects'), { headers: auth() });
      return r.json() as Promise<Project[]>;
    },
  });

  const { data: sites, isLoading: loadingSites } = useQuery({
    queryKey: ['project-sites', selectedProjectId],
    queryFn: async () => {
      const r = await fetch(getApiUrl(`/api/projects/${selectedProjectId}/sites`), { headers: auth() });
      return r.json() as Promise<Site[]>;
    },
    enabled: selectedProjectId !== null,
  });

  const visibleSites = (sites || []).filter(s => !typeFilter || s.Type === typeFilter);

  return (
    <div className="tv-view">
      {/* Header */}
      <div className="tv-header">
        <CheckCircle size={22} />
        <h1>Suivi des Tâches par Site</h1>
      </div>

      {/* Filters bar */}
      <div className="tv-filters">
        <div className="tv-filter-group">
          <label>Lot / Projet</label>
          <select value={selectedProjectId ?? ''} onChange={e => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">— Sélectionner un lot —</option>
            {loadingProjects && <option disabled>Chargement...</option>}
            {projects?.map(p => <option key={p.ProjectID} value={p.ProjectID}>{p.Name}</option>)}
          </select>
        </div>

        {selectedProjectId && (
          <>
            <div className="tv-filter-group">
              <label><Filter size={12} /> Type de site</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Tous</option>
                <option value="BATIMENT_ADMINISTRATIF">Bâtiment Administratif</option>
                <option value="ECOLE_PRIMAIRE">École Primaire</option>
                <option value="CENTRE_DE_SANTE">Centre de Santé</option>
              </select>
            </div>
            <div className="tv-filter-group">
              <label><Filter size={12} /> Statut</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {!selectedProjectId && (
        <div className="tv-empty-state">
          <CheckCircle size={48} color="#94a3b8" />
          <p>Sélectionnez un lot pour afficher les tâches par site.</p>
        </div>
      )}

      {selectedProjectId && loadingSites && (
        <div className="tv-loading"><Loader2 className="animate-spin" size={24} /> Chargement des sites...</div>
      )}

      {selectedProjectId && !loadingSites && visibleSites.length === 0 && (
        <div className="tv-empty-state"><MapPin size={40} color="#94a3b8" /><p>Aucun site trouvé pour ce lot.</p></div>
      )}

      {selectedProjectId && !loadingSites && visibleSites.length > 0 && (
        <div className="tv-sites-list">
          <p className="tv-sites-count">{visibleSites.length} site(s) · Cliquez sur un site pour afficher ses tâches</p>
          {visibleSites.map(s => (
            <SiteBlock key={s.SiteID} site={s} projectId={selectedProjectId} statusFilter={statusFilter} />
          ))}
        </div>
      )}
    </div>
  );
}
