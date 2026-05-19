import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../api/config';
import type { Task, Resource } from '../../types';
import './Resources.css';

interface TaskResource {
  TaskID: number;
  ResourceID: number;
  AllocatedQuantity: number;
  ActualQuantity?: number | null;
  UsageDate: string;
  Resource?: Resource;
  Task?: Task;
}

export function ResourceTaskLinkView(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [taskResources, setTaskResources] = useState<TaskResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [allocatedQuantity, setAllocatedQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [tasksRes, resourcesRes, linksRes] = await Promise.all([
        fetch(getApiUrl('/api/tasks'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/resources'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/task-resources'), { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (resourcesRes.ok) setResources(await resourcesRes.json());
      if (linksRes.ok) setTaskResources(await linksRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkResource() {
    if (!selectedTask || !selectedResource) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/task-resources'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          TaskID: selectedTask,
          ResourceID: selectedResource,
          AllocatedQuantity: allocatedQuantity
        })
      });

      if (!res.ok) throw new Error('Failed to link resource');
      
      setSelectedTask(null);
      setSelectedResource(null);
      setAllocatedQuantity(1);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link resource');
    }
  }

  async function handleUnlinkResource(taskId: number, resourceId: number) {
    if (!confirm('Dissocier cette ressource de la tâche ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(`/api/task-resources/${taskId}/${resourceId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to unlink resource');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink resource');
    }
  }

  function getTaskResources(taskId: number) {
    return taskResources.filter(tr => tr.TaskID === taskId);
  }

  if (loading) return <div className="loading-state">Chargement...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="resource-task-link-view">
      <div className="section-header">
        <h2>Liaison Ressources-Tâches</h2>
        <p>Associer des ressources (Équipements, Personnes, Entreprises) aux tâches du projet</p>
      </div>

      <div className="link-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tâche</label>
            <select 
              value={selectedTask || ''} 
              onChange={(e) => setSelectedTask(Number(e.target.value))}
            >
              <option value="">Sélectionner une tâche</option>
              {tasks.map(task => (
                <option key={task.TaskID} value={task.TaskID}>
                  {task.Name} - {task.Description || 'Sans description'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Ressource</label>
            <select
              value={selectedResource || ''}
              onChange={(e) => setSelectedResource(Number(e.target.value))}
            >
              <option value="">Sélectionner une ressource</option>
              {resources.map(resource => (
                <option key={resource.ResourceID} value={resource.ResourceID}>
                  {resource.Name} ({resource.Type}) - Qté: {resource.Quantity}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantité allouée</label>
            <input
              type="number"
              min="1"
              value={allocatedQuantity}
              onChange={(e) => setAllocatedQuantity(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <button 
              onClick={handleLinkResource}
              disabled={!selectedTask || !selectedResource}
              className="btn btn--primary"
            >
              Lier
            </button>
          </div>
        </div>
      </div>

      <div className="tasks-resources-list">
        <h3>Tâches avec ressources associées</h3>
        {tasks.length === 0 ? (
          <p>Aucune tâche disponible</p>
        ) : (
          <div className="task-resources-grid">
            {tasks.map(task => {
              const linkedResources = getTaskResources(task.TaskID);
              return (
                <div key={task.TaskID} className="task-resource-card">
                  <div className="task-header">
                    <h4>{task.Name}</h4>
                    <p>{task.Description || 'Sans description'}</p>
                  </div>
                  <div className="linked-resources">
                    {linkedResources.length === 0 ? (
                      <p className="no-resources">Aucune ressource associée</p>
                    ) : (
                      linkedResources.map(tr => (
                        <div key={`${tr.TaskID}-${tr.ResourceID}`} className="resource-item">
                          <span className="resource-name">{tr.Resource?.Name}</span>
                          <span className="resource-type">{tr.Resource?.Type}</span>
                          <span className="resource-quantity">
                            Alloué: {tr.AllocatedQuantity} {tr.ActualQuantity && `/ Réel: ${tr.ActualQuantity}`}
                          </span>
                          <button
                            onClick={() => handleUnlinkResource(tr.TaskID, tr.ResourceID)}
                            className="btn btn--danger btn--sm"
                          >
                            Dissocier
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
