import React, { useState, useEffect } from 'react';
import type { Sprint, Task } from '../../types';
import { fetchProjectSprints, fetchSprintBoard, updateTaskStatus } from '../../api/construction';
import './ConstructionDashboard.css';

interface SprintBoardViewProps {
  projectId?: number;
}

interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export function SprintBoardView({ projectId }: SprintBoardViewProps): React.ReactElement {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | ''>('');
  const [boardData, setBoardData] = useState<{
    sprint: Sprint;
    columns: {
      NotStarted: Task[];
      InProgress: Task[];
      Completed: Task[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      loadSprints();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedSprintId) {
      loadBoardData();
    }
  }, [selectedSprintId]);

  async function loadSprints() {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await fetchProjectSprints(projectId);
      setSprints(data);
      
      // Auto-select first active sprint
      const activeSprint = data.find(s => s.Status === 'ACTIVE');
      if (activeSprint) {
        setSelectedSprintId(activeSprint.SprintID);
      } else if (data.length > 0) {
        setSelectedSprintId(data[0].SprintID);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  }

  async function loadBoardData() {
    if (!selectedSprintId) return;
    
    try {
      setLoading(true);
      const data = await fetchSprintBoard(selectedSprintId);
      setBoardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load sprint board');
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveTask(taskId: number, newStatus: string) {
    try {
      setUpdating(taskId);
      await updateTaskStatus(taskId, newStatus);
      await loadBoardData();
    } catch (err) {
      setError('Failed to update task status');
    } finally {
      setUpdating(null);
    }
  }

  const columns: BoardColumn[] = boardData
    ? [
        {
          id: 'NotStarted',
          title: 'Not Started',
          tasks: boardData.columns.NotStarted || [],
          color: '#f0f0f0',
        },
        {
          id: 'InProgress',
          title: 'In Progress',
          tasks: boardData.columns.InProgress || [],
          color: '#fff3cd',
        },
        {
          id: 'Completed',
          title: 'Completed',
          tasks: boardData.columns.Completed || [],
          color: '#d4edda',
        },
      ]
    : [];

  function getNextColumn(currentColumn: string): string | null {
    const flow = ['NotStarted', 'InProgress', 'Completed'];
    const currentIndex = flow.indexOf(currentColumn);
    if (currentIndex < flow.length - 1) {
      return flow[currentIndex + 1];
    }
    return null;
  }

  function getMoveButtonText(currentColumn: string): string {
    switch (currentColumn) {
      case 'NotStarted':
        return 'Start →';
      case 'InProgress':
        return 'Complete →';
      default:
        return '';
    }
  }

  if (!projectId) {
    return (
      <div className="sprint-board-view">
        <div className="empty-state">
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sprint-board-view">
      <div className="section-header">
        <h3>Sprint Board</h3>
        <div className="sprint-selector">
          <label>Select Sprint:</label>
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value ? parseInt(e.target.value) : '')}
            disabled={loading}
          >
            <option value="">Choose a sprint...</option>
            {sprints.map((sprint) => (
              <option key={sprint.SprintID} value={sprint.SprintID}>
                {sprint.Name} ({sprint.Status})
              </option>
            ))}
          </select>
          <button onClick={loadBoardData} className="btn btn--secondary btn--sm" disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading && <div className="loading-state">Loading sprint board...</div>}

      {boardData && !loading && (
        <>
          <div className="sprint-info">
            <h4>{boardData.sprint.Name}</h4>
            <p>
              {new Date(boardData.sprint.StartDate).toLocaleDateString()} - {' '}
              {new Date(boardData.sprint.EndDate).toLocaleDateString()}
            </p>
            <span className={`sprint-status badge--${boardData.sprint.Status.toLowerCase()}`}>
              {boardData.sprint.Status}
            </span>
          </div>

          <div className="kanban-board">
            {columns.map((column) => (
              <div
                key={column.id}
                className="kanban-column"
                style={{ backgroundColor: column.color }}
              >
                <div className="kanban-column-header">
                  <h5>{column.title}</h5>
                  <span className="task-count">{column.tasks.length}</span>
                </div>

                <div className="kanban-tasks">
                  {column.tasks.map((task) => (
                    <div key={task.TaskID} className="kanban-card">
                      <div className="kanban-card-header">
                        <span className="task-id">#{task.TaskID}</span>
                      </div>
                      <p className="task-description">{task.Description}</p>
                      {task.Duration && (
                        <p className="task-meta">{task.Duration} hours</p>
                      )}
                      
                      {getNextColumn(column.id) && (
                        <button
                          onClick={() => handleMoveTask(task.TaskID, getNextColumn(column.id)!)}
                          disabled={updating === task.TaskID}
                          className="btn btn--primary btn--sm btn--block"
                        >
                          {updating === task.TaskID ? 'Moving...' : getMoveButtonText(column.id)}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
