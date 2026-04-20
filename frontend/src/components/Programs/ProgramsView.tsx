import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronRight, Building2, FolderTree, TrendingUp, Calendar, DollarSign } from 'lucide-react';
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

interface Project {
  ProjectID: number;
  Name: string;
  StartDate: string;
  EndDate: string;
  TotalBudget: number;
  _count: {
    Tasks: number;
  };
}

const fetchPrograms = async (): Promise<Program[]> => {
  const response = await fetch('http://localhost:8002/api/programs', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch programs');
  return response.json();
};

export function ProgramsView() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());

  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  const toggleExpand = (programId: number) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) return <div className="programs-loading">Chargement des programmes...</div>;
  if (error) return <div className="programs-error">Erreur de chargement</div>;

  return (
    <div className="programs-view" data-testid="programs-view">
      <div className="programs-header">
        <h1 className="programs-title" data-testid="programs-title">
          <FolderTree className="title-icon" />
          Programmes PDL 145 Territoires
        </h1>
        <button className="btn btn-primary" data-testid="programs-add-button">
          <Plus size={18} />
          Nouveau Programme
        </button>
      </div>

      <div className="programs-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FolderTree size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{programs?.length || 0}</span>
            <span className="stat-label">Programmes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {programs?.reduce((acc, p) => acc + (p._count?.Projects || 0), 0) || 0}
            </span>
            <span className="stat-label">Projets Totaux</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {formatCurrency(programs?.reduce((acc, p) => acc + (p.Budget || 0), 0) || 0)}
            </span>
            <span className="stat-label">Budget Total</span>
          </div>
        </div>
      </div>

      <div className="programs-list" data-testid="programs-list">
        {programs?.map((program) => (
          <div key={program.ProgramID} className="program-card" data-testid="program-card">
            <div 
              className="program-header"
              data-testid="program-header"
              onClick={() => toggleExpand(program.ProgramID)}
            >
              <ChevronRight 
                className={`expand-icon ${expandedPrograms.has(program.ProgramID) ? 'expanded' : ''}`}
                size={20}
              />
              <div className="program-info">
                <h3 className="program-name" data-testid="program-name">{program.Name}</h3>
                <p className="program-description" data-testid="program-description">{program.Description}</p>
                <div className="program-meta">
                  <span className={`status-badge ${program.Status.toLowerCase()}`}>
                    {program.Status}
                  </span>
                  <span className="meta-item">
                    <Building2 size={14} />
                    {program._count.Projects} projets
                  </span>
                  <span className="meta-item" data-testid="program-dates">
                    <Calendar size={14} />
                    {formatDate(program.StartDate)} - {formatDate(program.EndDate)}
                  </span>
                  <span className="meta-item budget" data-testid="program-budget">
                    <DollarSign size={14} />
                    {formatCurrency(program.Budget || 0)}
                  </span>
                </div>
              </div>
            </div>

            {expandedPrograms.has(program.ProgramID) && (
              <div className="projects-list" data-testid="projects-list">
                <h4 className="projects-title">Projets du Programme</h4>
                {program.Projects.map((project) => (
                  <div key={project.ProjectID} className="project-item" data-testid="project-item">
                    <div className="project-icon">
                      <Building2 size={18} />
                    </div>
                    <div className="project-details">
                      <span className="project-name" data-testid="project-name">{project.Name}</span>
                      <div className="project-meta">
                        <span data-testid="project-dates">{formatDate(project.StartDate)} - {formatDate(project.EndDate)}</span>
                        <span className="project-budget" data-testid="project-budget">
                          {formatCurrency(project.TotalBudget)}
                        </span>
                        <span className="project-tasks" data-testid="project-tasks">
                          {project._count.Tasks} tâches
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
