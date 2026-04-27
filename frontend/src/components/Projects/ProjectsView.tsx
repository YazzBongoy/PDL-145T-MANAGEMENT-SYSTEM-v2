import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FolderOpen, Calendar, DollarSign, Loader2, AlertCircle, Edit2, Trash2, ChevronLeft, ListTodo } from 'lucide-react';
import './Projects.css';

interface Project {
  ProjectID: number;
  ProgramID: number;
  Name: string;
  Description: string | null;
  StartDate: string;
  EndDate: string | null;
  TotalBudget: string | number;
  CreatedAt: string;
  UpdatedAt: string;
  Program?: {
    Name: string;
  };
}

interface Program {
  ProgramID: number;
  Name: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

const fetchPrograms = async (): Promise<Program[]> => {
  const response = await fetch('/api/programs', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch programs');
  return response.json();
};

const createProject = async (data: Omit<Project, 'ProjectID' | 'CreatedAt' | 'UpdatedAt' | 'Program'>): Promise<Project> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create project');
  }
  return response.json();
};

const updateProject = async ({ id, data }: { id: number; data: Partial<Omit<Project, 'ProjectID' | 'CreatedAt' | 'UpdatedAt'>> }): Promise<Project> => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project');
  }
  return response.json();
};

const deleteProject = async (id: number): Promise<void> => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete project');
  }
};

export function ProjectsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const filteredProjects = projects?.filter(p => 
    p.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.Description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      Name: formData.get('name') as string,
      Description: formData.get('description') as string,
      StartDate: formData.get('startDate') as string,
      EndDate: formData.get('endDate') as string || null,
      TotalBudget: Number(formData.get('totalBudget')),
      ProgramID: Number(formData.get('programId'))
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.ProjectID, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.Name}"?`)) {
      deleteMutation.mutate(project.ProjectID);
    }
  };

  const handleViewTasks = (project: Project) => {
    setViewingProject(project);
  };

  if (viewingProject) {
    return (
      <div className="projects-view">
        <div className="section-header">
          <button className="btn btn--secondary" onClick={() => setViewingProject(null)}>
            <ChevronLeft size={16} />
            Back to Projects
          </button>
          <h2>{viewingProject.Name}</h2>
        </div>
        <div className="project-detail">
          <p>Project details and task management would be displayed here.</p>
          <p>Program: {viewingProject.Program?.Name || 'N/A'}</p>
          <p>Budget: ${viewingProject.TotalBudget}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-view">
      <div className="section-header">
        <div className="section-title">
          <FolderOpen className="section-icon" size={24} />
          <h2>Projects</h2>
        </div>
        <div className="section-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>Error loading projects: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>No projects found. Create your first project!</p>
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.ProjectID} className="project-card">
            <div className="project-header">
              <h3 className="project-name">{project.Name}</h3>
              <div className="project-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => handleViewTasks(project)}>
                  <ListTodo size={14} />
                  Tasks
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => handleEdit(project)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(project)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {project.Description && (
              <p className="project-description">{project.Description}</p>
            )}
            
            <div className="project-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>{new Date(project.StartDate).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <DollarSign size={14} />
                <span>${project.TotalBudget}</span>
              </div>
            </div>
            
            {project.Program && (
              <div className="project-program">
                <span className="program-badge">{project.Program.Name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" defaultValue={editingProject?.Name} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" defaultValue={editingProject?.Description || ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input 
                    name="startDate" 
                    type="date" 
                    defaultValue={editingProject?.StartDate?.split('T')[0]} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    name="endDate" 
                    type="date" 
                    defaultValue={editingProject?.EndDate?.split('T')[0] || ''} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Budget *</label>
                  <input 
                    name="totalBudget" 
                    type="number" 
                    defaultValue={editingProject?.TotalBudget} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Program *</label>
                  <select name="programId" defaultValue={editingProject?.ProgramID} required>
                    <option value="">Select Program</option>
                    {programs?.map(p => (
                      <option key={p.ProgramID} value={p.ProgramID}>{p.Name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
