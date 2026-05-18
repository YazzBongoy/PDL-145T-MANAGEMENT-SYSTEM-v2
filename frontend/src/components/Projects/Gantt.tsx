import React, { useMemo } from 'react';
import type { Task, TaskStatus } from '../../types';
import './Gantt.css';

interface GanttTask extends Task {
  startDate: Date;
  endDate: Date;
  color?: string;
}

interface GanttChartProps {
  projectName: string;
  projectStart: string;
  projectEnd?: string;
  tasks: Task[];
}

const statusColors: Record<TaskStatus, string> = {
  NotStarted: '#94a3b8',
  InProgress: '#3b82f6',
  Completed: '#22c55e',
  Blocked: '#ef4444'
};

export function GanttChart({ projectName, projectStart, projectEnd, tasks }: GanttChartProps): React.ReactElement {
  const { ganttTasks, timelineStart, timelineEnd, totalDays } = useMemo(() => {
    const pStart = new Date(projectStart);
    const pEnd = projectEnd ? new Date(projectEnd) : new Date();
    
    // If no end date, set it to 30 days from start
    if (!projectEnd) {
      pEnd.setDate(pEnd.getDate() + 30);
    }
    
    // Calculate task dates based on project timeline and task duration
    let currentDate = new Date(pStart);
    const ganttTasksWithDates: GanttTask[] = tasks.map((task) => {
      const duration = task.Duration || 1;
      const start = new Date(currentDate);
      const end = new Date(currentDate);
      end.setDate(end.getDate() + duration);
      
      currentDate = new Date(end);
      
      return {
        ...task,
        startDate: start,
        endDate: end,
        color: statusColors[task.CompletionStatus]
      };
    });
    
    // Extend timeline to fit all tasks
    const lastTaskEnd = ganttTasksWithDates.length > 0 
      ? ganttTasksWithDates[ganttTasksWithDates.length - 1].endDate 
      : pEnd;
    
    const end = lastTaskEnd > pEnd ? lastTaskEnd : pEnd;
    const totalDays = Math.ceil((end.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      ganttTasks: ganttTasksWithDates,
      timelineStart: pStart,
      timelineEnd: end,
      totalDays: Math.max(totalDays, 7) // Minimum 7 days
    };
  }, [projectStart, projectEnd, tasks]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTaskPosition = (task: GanttTask): { left: number; width: number } => {
    const startOffset = Math.ceil((task.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: Math.max(0, left), width: Math.max(2, width) }; // Minimum 2% width for visibility
  };

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers: { date: Date; label: string; position: number }[] = [];
    const current = new Date(timelineStart);
    
    while (current <= timelineEnd) {
      const offset = Math.ceil((current.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      markers.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short' }),
        position: (offset / totalDays) * 100
      });
      
      // Move to next month
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    
    return markers;
  }, [timelineStart, timelineEnd, totalDays]);

  if (tasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>No tasks to display. Add tasks to see the project timeline.</p>
      </div>
    );
  }

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <h4 className="gantt-title">{projectName} - Timeline</h4>
        <div className="gantt-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: statusColors.NotStarted }}></span>
            Not Started
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: statusColors.InProgress }}></span>
            In Progress
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: statusColors.Completed }}></span>
            Completed
          </span>
        </div>
      </div>
      
      <div className="gantt-timeline">
        <div className="gantt-months">
          {monthMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="month-marker"
              style={{ left: `${marker.position}%` }}
            >
              {marker.label}
            </div>
          ))}
        </div>
        
        <div className="gantt-grid">
          {/* Grid lines */}
          {Array.from({ length: Math.min(totalDays, 20) }, (_, i) => (
            <div
              key={i}
              className="grid-line"
              style={{ left: `${(i / Math.min(totalDays, 20)) * 100}%` }}
            />
          ))}
        </div>
        
        <div className="gantt-tasks">
          {ganttTasks.map((task) => {
            const { left, width } = getTaskPosition(task);
            return (
              <div key={task.TaskID} className="gantt-task-row">
                <div className="task-label" title={task.Description || `Task ${task.TaskID}`}>
                  {task.Description || `Task ${task.TaskID}`}
                  {task.AssignedTo && <span className="task-assignee">({task.AssignedTo})</span>}
                </div>
                <div className="task-bar-container">
                  <div
                    className="task-bar"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: task.color
                    }}
                    title={`${task.Description || `Task ${task.TaskID}`}: ${formatDate(task.startDate)} - ${formatDate(task.endDate)} (${task.CompletionStatus})`}
                  >
                    <span className="task-bar-label">
                      {task.Duration ? `${task.Duration}d` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="gantt-date-range">
          <span>{formatDate(timelineStart)}</span>
          <span>{formatDate(timelineEnd)}</span>
        </div>
      </div>
    </div>
  );
}
