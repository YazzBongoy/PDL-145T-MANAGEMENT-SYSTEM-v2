import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Loader2, Building2, BookOpen } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import './SitesView.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

interface Project {
  ProjectID: number;
  Name: string;
  ProjectSites?: { Site: Site }[];
}

interface Site {
  SiteID: string;
  Name: string;
  Type: string;
  Province: string;
}

interface Task {
  TaskID: number;
  Name: string;
  CompletionStatus: string;
  progressPercentage: number;
  Level: number;
  SortOrder: number;
  ParentTaskID: number | null;
  SiteID: string | null;
  SubTasks?: Task[];
}

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

function StatusIcon({ status }: { status: string }) {
  if (status === 'Completed') return <CheckCircle size={14} color="#22c55e" />;
  if (status === 'InProgress') return <Clock size={14} color="#3b82f6" />;
  if (status === 'Blocked') return <AlertCircle size={14} color="#ef4444" />;
  return <Clock size={14} color="#94a3b8" />;
}

function buildTree(tasks: Task[]): Task[] {
  const sorted = [...tasks].sort((a, b) => a.SortOrder - b.SortOrder);
  const map = new Map<number, Task>();
  sorted.forEach(t => map.set(t.TaskID, { ...t, SubTasks: [] }));
  const roots: Task[] = [];
  map.forEach(task => {
    if (task.ParentTaskID && map.has(task.ParentTaskID)) {
      map.get(task.ParentTaskID)!.SubTasks!.push(task);
    } else if (!task.ParentTaskID) {
      roots.push(task);
    }
  });
  return roots;
}

function TaskRow({ task, depth, onUpdate }: {
  task: Task;
  depth: number;
  onUpdate: (id: number, status: string, progress: number, level: number) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const [localProgress, setLocalProgress] = useState(task.progressPercentage);
  const hasChildren = (task.SubTasks?.length || 0) > 0;
  const indent = depth * 20;
  const isLeaf = task.Level === 3;
  const isCalc = !isLeaf;

  return (
    <>
      <tr className={`task-row task-row--level-${depth}${isCalc ? ' task-row--calc' : ''}`}>
        <td style={{ paddingLeft: `${indent + 8}px` }}>
          <div className="task-name-cell">
            {hasChildren ? (
              <button className="task-toggle" onClick={() => setOpen(o => !o)}>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="task-toggle-spacer" />
            )}
            <StatusIcon status={task.CompletionStatus} />
            <span className={`task-name ${depth === 0 ? 'task-name--bold' : ''}`}>{task.Name}</span>
            {isLeaf && (task as any).Weight > 0 && (
              <span className="task-weight">{(task as any).Weight}%</span>
            )}
          </div>
        </td>
        <td>
          {isCalc ? (
            <span className="status-calc" style={{ color: STATUS_COLORS[task.CompletionStatus] || '#94a3b8' }}>
              {STATUS_LABELS[task.CompletionStatus] || task.CompletionStatus}
            </span>
          ) : (
            <select
              className="status-select"
              value={task.CompletionStatus}
              style={{ borderColor: STATUS_COLORS[task.CompletionStatus] || '#94a3b8' }}
              onChange={e => onUpdate(task.TaskID, e.target.value, localProgress, task.Level)}
            >
              {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          )}
        </td>
        <td>
          <div className="progress-cell">
            {isCalc ? (
              <>
                <span className="progress-calc">{task.progressPercentage}%</span>
                <div className="progress-bar-mini">
                  <div className="progress-bar-fill progress-bar-fill--calc" style={{ width: `${task.progressPercentage}%` }} />
                </div>
              </>
            ) : (
              <>
                <input
                  type="number" className="progress-input"
                  min={0} max={100}
                  value={localProgress}
                  onChange={e => setLocalProgress(Number(e.target.value))}
                  onBlur={() => onUpdate(task.TaskID, task.CompletionStatus, localProgress, task.Level)}
                />
                <span>%</span>
                <div className="progress-bar-mini">
                  <div className="progress-bar-fill" style={{ width: `${localProgress}%` }} />
                </div>
              </>
            )}
          </div>
        </td>
      </tr>
      {open && hasChildren && task.SubTasks!.map(child => (
        <TaskRow key={child.TaskID} task={child} depth={depth + 1} onUpdate={onUpdate} />
      ))}
    </>
  );
}

function SiteTaskPanel({ site, projectId }: { site: Site; projectId: number }) {
  const qc = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['site-tasks', site.SiteID],
    queryFn: async () => {
      const res = await fetch(
        getApiUrl(`/api/tasks?projectId=${projectId}&siteId=${site.SiteID}`),
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<Task[]>;
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status, progress, level }: { id: number; status: string; progress: number; level: number }) => {
      if (level !== 3) return null;
      const res = await fetch(getApiUrl(`/api/tasks/${id}/progress`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ progressPercentage: progress, CompletionStatus: status }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-tasks', site.SiteID] }),
  });

  const typeIcon = site.Type === 'ECOLE_PRIMAIRE' ? <BookOpen size={16} /> : site.Type === 'CENTRE_DE_SANTE' ? <Building2 size={16} /> : <Building2 size={16} />;
  const typeLabel = site.Type === 'ECOLE_PRIMAIRE' ? 'École Primaire' : site.Type === 'CENTRE_DE_SANTE' ? 'Centre de Santé' : 'Bâtiment Administratif';

  if (isLoading) return (
    <div className="site-panel">
      <div className="site-panel__header">
        {typeIcon}<span>{site.Name}</span><span className="site-type-badge">{typeLabel}</span>
      </div>
      <div className="site-panel__loading"><Loader2 className="animate-spin" size={20} /> Chargement...</div>
    </div>
  );

  const taskList = tasks || [];
  const tree = buildTree(taskList);
  const done = taskList.filter(t => t.CompletionStatus === 'Completed').length;
  const total = taskList.length;
  const avgProgress = total > 0 ? Math.round(taskList.reduce((s, t) => s + (t.progressPercentage || 0), 0) / total) : 0;

  return (
    <div className="site-panel">
      <div className="site-panel__header">
        {typeIcon}
        <span className="site-panel__name">{site.Name}</span>
        <span className="site-type-badge">{typeLabel}</span>
        <span className="site-stats">{done}/{total} tâches · {avgProgress}% avancement</span>
        <div className="site-progress-bar">
          <div className="site-progress-fill" style={{ width: `${avgProgress}%` }} />
        </div>
      </div>
      {tree.length === 0 ? (
        <p className="site-panel__empty">Aucune tâche pour ce site.</p>
      ) : (
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Tâche</th>
              <th>Statut</th>
              <th>Avancement</th>
            </tr>
          </thead>
          <tbody>
            {tree.map(task => (
              <TaskRow
                key={task.TaskID}
                task={task}
                depth={0}
                onUpdate={(id, status, progress, level) => updateMut.mutate({ id, status, progress, level })}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function SitesView() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/projects'), { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<Project[]>;
    },
  });

  const { data: sites, isLoading: loadingSites } = useQuery({
    queryKey: ['project-sites', selectedProjectId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/projects/${selectedProjectId}/sites`), { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<Site[]>;
    },
    enabled: selectedProjectId !== null,
  });

  const selectedSite = sites?.find(s => s.SiteID === selectedSiteId) ?? null;

  return (
    <div className="sites-view">
      <div className="sites-view__header">
        <MapPin size={22} />
        <h1>Sites & Avancement des Tâches</h1>
      </div>

      <div className="sites-view__filters">
        <div className="filter-group">
          <label>Lot / Projet</label>
          <select
            value={selectedProjectId ?? ''}
            onChange={e => {
              setSelectedProjectId(e.target.value ? Number(e.target.value) : null);
              setSelectedSiteId(null);
            }}
          >
            <option value="">— Sélectionner un lot —</option>
            {loadingProjects ? <option disabled>Chargement...</option> : null}
            {projects?.map(p => (
              <option key={p.ProjectID} value={p.ProjectID}>{p.Name}</option>
            ))}
          </select>
        </div>

        {selectedProjectId && (
          <div className="filter-group">
            <label>Site</label>
            <select
              value={selectedSiteId ?? ''}
              onChange={e => setSelectedSiteId(e.target.value || null)}
            >
              <option value="">— Tous les sites —</option>
              {loadingSites ? <option disabled>Chargement...</option> : null}
              {sites?.map(s => (
                <option key={s.SiteID} value={s.SiteID}>{s.Name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedProjectId && (
        <div className="sites-view__empty">
          <MapPin size={48} color="#94a3b8" />
          <p>Sélectionnez un lot pour afficher ses sites et l'avancement des tâches.</p>
        </div>
      )}

      {selectedProjectId && loadingSites && (
        <div className="sites-view__loading"><Loader2 className="animate-spin" size={24} /> Chargement des sites...</div>
      )}

      {selectedProjectId && sites && (
        <div className="sites-view__content">
          {(selectedSite ? [selectedSite] : sites).map(site => (
            <SiteTaskPanel key={site.SiteID} site={site} projectId={selectedProjectId} />
          ))}
        </div>
      )}
    </div>
  );
}
