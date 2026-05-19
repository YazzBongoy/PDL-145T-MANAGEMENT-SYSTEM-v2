import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronRight, Building2, FolderTree, Calendar, DollarSign, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getApiUrl } from '../../api/config';
import './Programs.css';

interface Program {
  ProgramID: number;
  Name: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Budget: number;
  Status: string;
  Projects: Project[];
  _count: {
    Projects: number;
  };
}

interface Site {
  SiteID: string;
  Name: string;
  Province: string;
  Type: string;
  Territory?: { Name: string };
}

interface ProjectSiteEntry {
  Site: Site;
}

interface Project {
  ProjectID: number;
  Name: string;
  StartDate: string;
  EndDate: string;
  TotalBudget: number;
  ProjectSites?: ProjectSiteEntry[];
  _count: {
    Tasks: number;
  };
}

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

const fetchSites = async (): Promise<Site[]> => {
  const res = await fetch(getApiUrl('/api/sites'), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
};

const fetchPrograms = async (): Promise<Program[]> => {
  const res = await fetch(getApiUrl('/api/programs'), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch programs');
  return res.json();
};

const createProgram = async (data: object) => {
  const res = await fetch(getApiUrl('/api/programs'), { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create program');
  return res.json();
};

const updateProgram = async ({ id, data }: { id: number; data: object }) => {
  const res = await fetch(getApiUrl(`/api/programs/${id}`), { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update program');
  return res.json();
};

const deleteProgram = async (id: number) => {
  const res = await fetch(getApiUrl(`/api/programs/${id}`), { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete program');
};

const createProject = async (data: object) => {
  const res = await fetch(getApiUrl('/api/projects'), { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};

const updateProject = async ({ id, data }: { id: number; data: object }) => {
  const res = await fetch(getApiUrl(`/api/projects/${id}`), { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
};

const deleteProject = async (id: number) => {
  const res = await fetch(getApiUrl(`/api/projects/${id}`), { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete project');
};

const PROGRAM_STATUSES = ['ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED'];

export function ProgramsView() {
  const qc = useQueryClient();
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());

  // Programme modal state
  const [programModal, setProgramModal] = useState<{ open: boolean; editing: Program | null }>({ open: false, editing: null });
  // Projet modal state
  const [projectModal, setProjectModal] = useState<{ open: boolean; programId: number | null; editing: Project | null }>({ open: false, programId: null, editing: null });
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  const { data: programs, isLoading, error } = useQuery({ queryKey: ['programs'], queryFn: fetchPrograms });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSites });

  const createProgramMut = useMutation({ mutationFn: createProgram, onSuccess: () => { qc.invalidateQueries({ queryKey: ['programs'] }); setProgramModal({ open: false, editing: null }); } });
  const updateProgramMut = useMutation({ mutationFn: updateProgram, onSuccess: () => { qc.invalidateQueries({ queryKey: ['programs'] }); setProgramModal({ open: false, editing: null }); } });
  const deleteProgramMut = useMutation({ mutationFn: deleteProgram, onSuccess: () => qc.invalidateQueries({ queryKey: ['programs'] }) });

  const createProjectMut = useMutation({ mutationFn: createProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['programs'] }); setProjectModal({ open: false, programId: null, editing: null }); } });
  const updateProjectMut = useMutation({ mutationFn: updateProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['programs'] }); setProjectModal({ open: false, programId: null, editing: null }); } });
  const deleteProjectMut = useMutation({ mutationFn: deleteProject, onSuccess: () => qc.invalidateQueries({ queryKey: ['programs'] }) });

  const toggleExpand = (id: number) => {
    const s = new Set(expandedPrograms);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedPrograms(s);
  };

  const fmt = (amount: number) => new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'CDF', maximumFractionDigits: 0 }).format(amount);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  const handleProgramSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      description: fd.get('description') as string || undefined,
      startDate: fd.get('startDate') as string || undefined,
      endDate: fd.get('endDate') as string || undefined,
      budget: fd.get('budget') ? parseFloat(fd.get('budget') as string) : undefined,
      status: fd.get('status') as string
    };
    if (programModal.editing) {
      updateProgramMut.mutate({ id: programModal.editing.ProgramID, data });
    } else {
      createProgramMut.mutate(data);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      description: fd.get('description') as string || undefined,
      startDate: fd.get('startDate') as string,
      endDate: fd.get('endDate') as string || undefined,
      totalBudget: parseFloat(fd.get('totalBudget') as string) || 0,
      programId: projectModal.programId,
      siteIds: selectedSiteIds
    };
    if (projectModal.editing) {
      updateProjectMut.mutate({ id: projectModal.editing.ProjectID, data });
    } else {
      createProjectMut.mutate(data);
    }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(prev =>
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    );
  };

  if (isLoading) return <div className="programs-loading"><Loader2 className="animate-spin" size={24} /> Chargement...</div>;
  if (error) return <div className="programs-error">Erreur de chargement des programmes</div>;

  const totalProjects = programs?.reduce((acc, p) => acc + (p._count?.Projects || 0), 0) || 0;
  const totalBudget = programs?.reduce((acc, p) => acc + (p.Budget || 0), 0) || 0;

  return (
    <div className="programs-view" data-testid="programs-view">
      <div className="programs-header">
        <h1 className="programs-title" data-testid="programs-title">
          <FolderTree className="title-icon" />
          Programmes PDL 145 Territoires
        </h1>
        <button className="btn btn-primary" data-testid="programs-add-button"
          onClick={() => setProgramModal({ open: true, editing: null })}>
          <Plus size={18} /> Nouveau Programme
        </button>
      </div>

      <div className="programs-stats">
        <div className="stat-card">
          <div className="stat-icon blue"><FolderTree size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{programs?.length || 0}</span>
            <span className="stat-label">Programmes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Building2 size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalProjects}</span>
            <span className="stat-label">Projets / Lots</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{fmt(totalBudget)}</span>
            <span className="stat-label">Budget Total</span>
          </div>
        </div>
      </div>

      <div className="programs-list" data-testid="programs-list">
        {programs?.length === 0 && (
          <div className="programs-empty">
            <FolderTree size={48} />
            <p>Aucun programme. Cliquez sur « Nouveau Programme » pour commencer.</p>
          </div>
        )}
        {programs?.map((program) => (
          <div key={program.ProgramID} className="program-card" data-testid="program-card">
            <div className="program-header" data-testid="program-header" onClick={() => toggleExpand(program.ProgramID)}>
              <ChevronRight className={`expand-icon ${expandedPrograms.has(program.ProgramID) ? 'expanded' : ''}`} size={20} />
              <div className="program-info">
                <h3 className="program-name" data-testid="program-name">{program.Name}</h3>
                {program.Description && <p className="program-description">{program.Description}</p>}
                <div className="program-meta">
                  <span className={`status-badge ${program.Status.toLowerCase()}`}>{program.Status}</span>
                  <span className="meta-item"><Building2 size={14} />{program._count?.Projects || 0} projet(s)</span>
                  {program.StartDate && (
                    <span className="meta-item"><Calendar size={14} />{fmtDate(program.StartDate)}{program.EndDate ? ` → ${fmtDate(program.EndDate)}` : ''}</span>
                  )}
                  {program.Budget && (
                    <span className="meta-item budget"><DollarSign size={14} />{fmt(program.Budget)}</span>
                  )}
                </div>
              </div>
              <div className="program-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-icon btn-icon--edit" title="Modifier" onClick={() => setProgramModal({ open: true, editing: program })}>
                  <Edit2 size={15} />
                </button>
                <button className="btn-icon btn-icon--danger" title="Supprimer" onClick={() => { if (confirm(`Supprimer le programme "${program.Name}" ?`)) deleteProgramMut.mutate(program.ProgramID); }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {expandedPrograms.has(program.ProgramID) && (
              <div className="projects-list" data-testid="projects-list">
                <div className="projects-list-header">
                  <h4 className="projects-title">Projets / Lots du Programme</h4>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => { setSelectedSiteIds([]); setProjectModal({ open: true, programId: program.ProgramID, editing: null }); }}>
                    <Plus size={14} /> Ajouter un Projet
                  </button>
                </div>
                {program.Projects?.length === 0 && (
                  <p className="projects-empty">Aucun projet dans ce programme.</p>
                )}
                {program.Projects?.map((project) => (
                  <div key={project.ProjectID} className="project-item" data-testid="project-item">
                    <div className="project-icon"><Building2 size={18} /></div>
                    <div className="project-details">
                      <span className="project-name" data-testid="project-name">{project.Name}</span>
                      {project.ProjectSites && project.ProjectSites.length > 0 && (
                        <div className="project-sites">
                          {project.ProjectSites.map(ps => (
                            <span key={ps.Site.SiteID} className="site-badge">{ps.Site.Name}</span>
                          ))}
                        </div>
                      )}
                      <div className="project-meta">
                        <span>{fmtDate(project.StartDate)}{project.EndDate ? ` → ${fmtDate(project.EndDate)}` : ''}</span>
                        <span className="project-budget">{fmt(project.TotalBudget)}</span>
                        <span className="project-tasks">{project._count?.Tasks || 0} tâche(s)</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button className="btn-icon btn-icon--edit" title="Modifier"
                        onClick={() => {
                          setSelectedSiteIds(project.ProjectSites?.map(ps => ps.Site.SiteID) || []);
                          setProjectModal({ open: true, programId: program.ProgramID, editing: project });
                        }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon btn-icon--danger" title="Supprimer"
                        onClick={() => { if (confirm(`Supprimer le projet "${project.Name}" ?`)) deleteProjectMut.mutate(project.ProjectID); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Programme Modal ── */}
      {programModal.open && (
        <div className="modal-overlay" onClick={() => setProgramModal({ open: false, editing: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{programModal.editing ? 'Modifier le Programme' : 'Nouveau Programme'}</h3>
            <form onSubmit={handleProgramSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input name="name" required defaultValue={programModal.editing?.Name} placeholder="Nom du programme" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={programModal.editing?.Description || ''} placeholder="Description du programme" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date début</label>
                  <input name="startDate" type="date" defaultValue={programModal.editing?.StartDate?.split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input name="endDate" type="date" defaultValue={programModal.editing?.EndDate?.split('T')[0]} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (CDF)</label>
                  <input name="budget" type="number" step="0.01" defaultValue={programModal.editing?.Budget || ''} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" defaultValue={programModal.editing?.Status || 'ACTIVE'}>
                    {PROGRAM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setProgramModal({ open: false, editing: null })}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={createProgramMut.isPending || updateProgramMut.isPending}>
                  {createProgramMut.isPending || updateProgramMut.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
                  {programModal.editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Projet Modal ── */}
      {projectModal.open && (
        <div className="modal-overlay" onClick={() => setProjectModal({ open: false, programId: null, editing: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{projectModal.editing ? 'Modifier le Projet' : 'Nouveau Projet / Lot'}</h3>
            <form onSubmit={handleProjectSubmit}>
              <div className="form-group">
                <label>Nom *</label>
                <input name="name" required defaultValue={projectModal.editing?.Name} placeholder="Nom du projet ou lot" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={(projectModal.editing as any)?.Description || ''} placeholder="Description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date début *</label>
                  <input name="startDate" type="date" required defaultValue={projectModal.editing?.StartDate?.split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input name="endDate" type="date" defaultValue={projectModal.editing?.EndDate?.split('T')[0]} />
                </div>
              </div>
              <div className="form-group">
                <label>Budget total (CDF) *</label>
                <input name="totalBudget" type="number" step="0.01" required defaultValue={projectModal.editing?.TotalBudget || ''} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Sites d'exécution</label>
                {sites && sites.length > 0 ? (
                  <div className="sites-checklist">
                    {sites.map(site => (
                      <label key={site.SiteID} className="site-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedSiteIds.includes(site.SiteID)}
                          onChange={() => toggleSite(site.SiteID)}
                        />
                        <span>{site.Name}</span>
                        <span className="site-province">{site.Province}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="projects-empty">Aucun site disponible. Ajoutez d'abord des sites via la page Mesures.</p>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setProjectModal({ open: false, programId: null, editing: null })}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={createProjectMut.isPending || updateProjectMut.isPending}>
                  {createProjectMut.isPending || updateProjectMut.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
                  {projectModal.editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
