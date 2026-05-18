import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, 
  Camera, Plus, Edit2, Save, X, Loader2 
} from 'lucide-react';
import { getApiUrl } from '../../api/config';
import type { ConstructionStep, Task } from '../../types';
import './ConstructionSteps.css';

interface ConstructionStepsViewProps {
  task: Task;
  onClose: () => void;
}

const fetchSteps = async (taskId: number): Promise<ConstructionStep[]> => {
  const response = await fetch(getApiUrl(`/api/construction-steps/task/${taskId}`), {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch steps');
  return response.json();
};

const createDefaultSteps = async (taskId: number): Promise<{ steps: ConstructionStep[] }> => {
  const response = await fetch(getApiUrl(`/api/construction-steps/task/${taskId}/default`), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to create default steps');
  return response.json();
};

const updateStepProgress = async ({ id, progress, status }: { id: number; progress: number; status: string }): Promise<ConstructionStep> => {
  const response = await fetch(getApiUrl(`/api/construction-steps/${id}/progress`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ progressPercent: progress, status })
  });
  if (!response.ok) throw new Error('Failed to update step');
  return response.json();
};

const statusIcons = {
  'NOT_STARTED': <Clock size={16} className="status-icon not-started" />,
  'IN_PROGRESS': <Loader2 size={16} className="status-icon in-progress animate-spin" />,
  'COMPLETED': <CheckCircle size={16} className="status-icon completed" />,
  'BLOCKED': <AlertCircle size={16} className="status-icon blocked" />
};

const statusColors = {
  'NOT_STARTED': 'status-not-started',
  'IN_PROGRESS': 'status-in-progress',
  'COMPLETED': 'status-completed',
  'BLOCKED': 'status-blocked'
};

export function ConstructionStepsView({ task, onClose }: ConstructionStepsViewProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ progress: 0, status: 'NOT_STARTED' });

  const { data: steps, isLoading, error } = useQuery({
    queryKey: ['construction-steps', task.TaskID],
    queryFn: () => fetchSteps(task.TaskID)
  });

  const createDefaultMutation = useMutation({
    mutationFn: () => createDefaultSteps(task.TaskID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['construction-steps', task.TaskID] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: updateStepProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['construction-steps', task.TaskID] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingStep(null);
    }
  });

  const toggleExpand = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const startEdit = (step: ConstructionStep) => {
    setEditingStep(step.StepID);
    setEditForm({ progress: step.ProgressPercent, status: step.Status });
  };

  const saveEdit = (stepId: number) => {
    updateProgressMutation.mutate({
      id: stepId,
      progress: editForm.progress,
      status: editForm.status
    });
  };

  const getOverallProgress = () => {
    if (!steps || steps.length === 0) return 0;
    const total = steps.reduce((sum, step) => sum + step.ProgressPercent, 0);
    return Math.round(total / steps.length);
  };

  if (isLoading) {
    return (
      <div className="construction-steps-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-content">
          <div className="loading-state">
            <Loader2 className="animate-spin" size={24} />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="construction-steps-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-content">
          <div className="error-state">
            <AlertCircle size={24} />
            <p>{t('errors.generic')}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasNoSteps = !steps || steps.length === 0;
  const overallProgress = getOverallProgress();

  return (
    <div className="construction-steps-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content construction-steps-content">
        <div className="modal-header">
          <div>
            <h2>{task.Name}</h2>
            <p className="task-type">
              {task.ouvrageType && t(`tasks.ouvrageTypes.${task.ouvrageType.toLowerCase().replace('_', '')}`)}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="progress-overview">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="progress-text">{overallProgress}% {t('construction.progress')}</span>
        </div>

        {hasNoSteps && (
          <div className="no-steps">
            <p>{t('construction.noSteps')}</p>
            <button 
              className="btn btn--primary"
              onClick={() => createDefaultMutation.mutate()}
              disabled={createDefaultMutation.isPending}
            >
              {createDefaultMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> {t('common.loading')}</>
              ) : (
                <><Plus size={16} /> {t('construction.addDefaultSteps')}</>
              )}
            </button>
          </div>
        )}

        <div className="steps-list">
          {steps?.map((step, index) => (
            <div 
              key={step.StepID} 
              className={`step-card ${statusColors[step.Status]}`}
            >
              <div className="step-header" onClick={() => toggleExpand(step.StepID)}>
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                  <h4>{step.Name}</h4>
                  <span className={`step-status ${statusColors[step.Status]}`}>
                    {statusIcons[step.Status]}
                    {t(`construction.stepStatus.${step.Status.toLowerCase()}`)}
                  </span>
                </div>
                <div className="step-progress">
                  {editingStep === step.StepID ? (
                    <div className="edit-progress" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.progress}
                        onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) || 0 })}
                        className="progress-input"
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="status-select"
                      >
                        <option value="NOT_STARTED">{t('construction.stepStatus.notStarted')}</option>
                        <option value="IN_PROGRESS">{t('construction.stepStatus.inProgress')}</option>
                        <option value="COMPLETED">{t('construction.stepStatus.completed')}</option>
                        <option value="BLOCKED">{t('construction.stepStatus.blocked')}</option>
                      </select>
                      <button 
                        className="btn-icon save"
                        onClick={() => saveEdit(step.StepID)}
                        disabled={updateProgressMutation.isPending}
                      >
                        <Save size={16} />
                      </button>
                      <button 
                        className="btn-icon cancel"
                        onClick={() => setEditingStep(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="progress-value">{step.ProgressPercent}%</span>
                      <button 
                        className="btn-icon edit"
                        onClick={(e) => { e.stopPropagation(); startEdit(step); }}
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                  {expandedSteps.has(step.StepID) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedSteps.has(step.StepID) && (
                <div className="step-details">
                  {step.Description && <p className="step-description">{step.Description}</p>}
                  
                  <div className="step-meta">
                    {step.StartDate && (
                      <span>{t('common.start')}: {new Date(step.StartDate).toLocaleDateString()}</span>
                    )}
                    {step.EndDate && (
                      <span>{t('common.end')}: {new Date(step.EndDate).toLocaleDateString()}</span>
                    )}
                    {step.EstimatedCost !== undefined && step.EstimatedCost > 0 && (
                      <span>{t('common.budget')}: {step.EstimatedCost.toLocaleString()} $</span>
                    )}
                  </div>

                  <div className="step-photos">
                    <div className="photos-header">
                      <Camera size={16} />
                      <span>{t('construction.photos')} ({step.Photos?.length || 0})</span>
                    </div>
                    <button className="btn btn--secondary btn--sm">
                      <Camera size={14} />
                      {t('construction.uploadPhoto')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
