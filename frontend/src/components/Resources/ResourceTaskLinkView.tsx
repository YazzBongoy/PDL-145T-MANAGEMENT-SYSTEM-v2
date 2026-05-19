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

interface Site {
  SiteID: string;
  Name: string;
  Type: string;
  Province: string;
}

interface SiteResource {
  SiteID: string;
  ResourceID: number;
  AllocatedQuantity: number;
  ActualQuantity?: number | null;
  UsageDate: string;
  Resource?: Resource;
  Site?: Site;
}

type TabId = 'tasks' | 'sites';

export function ResourceTaskLinkView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [taskResources, setTaskResources] = useState<TaskResource[]>([]);
  const [siteResources, setSiteResources] = useState<SiteResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
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
      
      const [tasksRes, resourcesRes, sitesRes, taskLinksRes, siteLinksRes] = await Promise.all([
        fetch(getApiUrl('/api/tasks'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/resources'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/sites'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/task-resources'), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(getApiUrl('/api/site-resources'), { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (resourcesRes.ok) setResources(await resourcesRes.json());
      if (sitesRes.ok) setSites(await sitesRes.json());
      if (taskLinksRes.ok) setTaskResources(await taskLinksRes.json());
      if (siteLinksRes.ok) setSiteResources(await siteLinksRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkTaskResource() {
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

  async function handleLinkSiteResource() {
    if (!selectedSite || !selectedResource) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/site-resources'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          SiteID: selectedSite,
          ResourceID: selectedResource,
          AllocatedQuantity: allocatedQuantity
        })
      });

      if (!res.ok) throw new Error('Failed to link resource');
      
      setSelectedSite(null);
      setSelectedResource(null);
      setAllocatedQuantity(1);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link resource');
    }
  }

  async function handleUnlinkTaskResource(taskId: number, resourceId: number) {
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

  async function handleUnlinkSiteResource(siteId: string, resourceId: number) {
    if (!confirm('Dissocier cette ressource du site ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(`/api/site-resources/${siteId}/${resourceId}`), {
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

  function getSiteResources(siteId: string) {
    return siteResources.filter(sr => sr.SiteID === siteId);
  }

  if (loading) return <div className="loading-state">Chargement...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="resource-task-link-view">
      <div className="section-header">
        <h2>Gestion des Ressources</h2>
        <p>Associer des ressources (Équipements, Personnes, Entreprises) aux tâches et aux sites</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Ressources-Tâches
        </button>
        <button 
          className={`tab ${activeTab === 'sites' ? 'active' : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          Ressources-Sites
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
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
                  onClick={handleLinkTaskResource}
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
                                onClick={() => handleUnlinkTaskResource(tr.TaskID, tr.ResourceID)}
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
        </>
      )}

      {activeTab === 'sites' && (
        <>
          <div className="link-form">
            <div className="form-row">
              <div className="form-group">
                <label>Site</label>
                <select 
                  value={selectedSite || ''} 
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <option value="">Sélectionner un site</option>
                  {sites.map(site => (
                    <option key={site.SiteID} value={site.SiteID}>
                      {site.Name} ({site.Type}) - {site.Province}
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
                  onClick={handleLinkSiteResource}
                  disabled={!selectedSite || !selectedResource}
                  className="btn btn--primary"
                >
                  Lier
                </button>
              </div>
            </div>
          </div>

          <div className="tasks-resources-list">
            <h3>Sites avec ressources associées</h3>
            {sites.length === 0 ? (
              <p>Aucun site disponible</p>
            ) : (
              <div className="task-resources-grid">
                {sites.map(site => {
                  const linkedResources = getSiteResources(site.SiteID);
                  return (
                    <div key={site.SiteID} className="task-resource-card">
                      <div className="task-header">
                        <h4>{site.Name}</h4>
                        <p>{site.Type} - {site.Province}</p>
                      </div>
                      <div className="linked-resources">
                        {linkedResources.length === 0 ? (
                          <p className="no-resources">Aucune ressource associée</p>
                        ) : (
                          linkedResources.map(sr => (
                            <div key={`${sr.SiteID}-${sr.ResourceID}`} className="resource-item">
                              <span className="resource-name">{sr.Resource?.Name}</span>
                              <span className="resource-type">{sr.Resource?.Type}</span>
                              <span className="resource-quantity">
                                Alloué: {sr.AllocatedQuantity} {sr.ActualQuantity && `/ Réel: ${sr.ActualQuantity}`}
                              </span>
                              <button
                                onClick={() => handleUnlinkSiteResource(sr.SiteID, sr.ResourceID)}
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
        </>
      )}
    </div>
  );
}
