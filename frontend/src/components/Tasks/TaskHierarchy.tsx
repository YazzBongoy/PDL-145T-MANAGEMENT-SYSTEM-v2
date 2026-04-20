import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, AlertCircle, Package, Users, Wrench } from 'lucide-react';
import './TaskHierarchy.css';

interface Task {
  TaskID: number;
  Name: string;
  Description: string;
  CompletionStatus: string;
  progressPercentage: number;
  Level: number;
  AssignedTo: string;
  Duration: number;
  SubTasks: Task[];
  TaskResources: TaskResource[];
  _count?: {
    SubTasks: number;
    TaskResources: number;
  };
}

interface TaskResource {
  ResourceID: number;
  AllocatedQuantity: number;
  Resource: {
    Name: string;
    Type: string;
  };
}

interface TaskHierarchyProps {
  projectId: number;
}

const fetchTaskHierarchy = async (projectId: number): Promise<Task[]> => {
  const response = await fetch(`http://localhost:8002/api/tasks/hierarchy/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch task hierarchy');
  return response.json();
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 className="status-icon completed" size={16} />;
    case 'InProgress':
      return <Clock className="status-icon in-progress" size={16} />;
    case 'NotStarted':
      return <Circle className="status-icon not-started" size={16} />;
    default:
      return <AlertCircle className="status-icon" size={16} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return '#10b981';
    case 'InProgress':
      return '#f59e0b';
    case 'NotStarted':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const TaskItem: React.FC<{ task: Task; level: number }> = ({ task, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasSubtasks = task.SubTasks && task.SubTasks.length > 0;
  const hasResources = task.TaskResources && task.TaskResources.length > 0;

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return '#4a90e2';
      case 2: return '#7c3aed';
      case 3: return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <div className="task-item-container">
      <div 
        className={`task-item level-${level}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="task-header">
          {hasSubtasks && (
            <button 
              className="expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!hasSubtasks && <span className="expand-placeholder" />}
          
          <div 
            className="level-indicator"
            style={{ backgroundColor: getLevelColor(level) }}
          >
            N{level}
          </div>
          
          {getStatusIcon(task.CompletionStatus)}
          
          <div className="task-info">
            <span className="task-name">{task.Name}</span>
            {task.Description && (
              <span className="task-description">{task.Description}</span>
            )}
          </div>
        </div>

        <div className="task-meta">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${task.progressPercentage}%`,
                backgroundColor: getStatusColor(task.CompletionStatus)
              }}
            />
            <span className="progress-text">{task.progressPercentage}%</span>
          </div>
          
          <div className="task-badges">
            {task.AssignedTo && (
              <span className="badge assigned">
                <Users size={12} />
                {task.AssignedTo}
              </span>
            )}
            {task.Duration && (
              <span className="badge duration">
                <Clock size={12} />
                {task.Duration}j
              </span>
            )}
            {hasResources && (
              <span className="badge resources">
                <Package size={12} />
                {task.TaskResources.length} ressources
              </span>
            )}
            {hasSubtasks && (
              <span className="badge subtasks">
                <Wrench size={12} />
                {task.SubTasks.length} sous-tâches
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasSubtasks && (
        <div className="subtasks-container">
          {task.SubTasks.map((subtask) => (
            <TaskItem key={subtask.TaskID} task={subtask} level={level + 1} />
          ))}
        </div>
      )}

      {isExpanded && hasResources && level === 3 && (
        <div className="resources-list" style={{ marginLeft: `${(level + 1) * 24}px` }}>
          <h5>Ressources attachées:</h5>
          {task.TaskResources.map((tr, idx) => (
            <div key={idx} className="resource-item">
              <Package size={14} />
              <span>{tr.Resource.Name}</span>
              <span className="resource-qty">({tr.AllocatedQuantity} alloué)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function TaskHierarchy({ projectId }: TaskHierarchyProps) {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['taskHierarchy', projectId],
    queryFn: () => fetchTaskHierarchy(projectId)
  });

  if (isLoading) return <div className="hierarchy-loading">Chargement de l'arbre des tâches...</div>;
  if (error) return <div className="hierarchy-error">Erreur de chargement des tâches</div>;
  if (!tasks || tasks.length === 0) return <div className="hierarchy-empty">Aucune tâche pour ce projet</div>;

  return (
    <div className="task-hierarchy">
      <h3 className="hierarchy-title">🌳 Arborescence des Tâches</h3>
      <div className="hierarchy-legend">
        <span className="legend-item"><span className="dot level-1"></span> Niveau 1: Tâche principale</span>
        <span className="legend-item"><span className="dot level-2"></span> Niveau 2: Sous-tâche</span>
        <span className="legend-item"><span className="dot level-3"></span> Niveau 3: Sous-sous-tâche</span>
      </div>
      <div className="hierarchy-tree">
        {tasks.map((task) => (
          <TaskItem key={task.TaskID} task={task} level={1} />
        ))}
      </div>
    </div>
  );
}
