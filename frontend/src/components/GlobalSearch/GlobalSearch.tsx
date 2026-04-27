import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FolderTree, FolderOpen, CheckCircle, Wrench, TrendingUp, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import './GlobalSearch.css';

interface SearchResult {
  id: number;
  type: 'program' | 'project' | 'task' | 'device' | 'report';
  title: string;
  subtitle: string;
  link: string;
}

interface Program {
  ProgramID: number;
  Name: string;
  Description: string;
}

interface Project {
  ProjectID: number;
  Name: string;
  Description: string | null;
  Program?: { Name: string };
}

interface Task {
  TaskID: number;
  Name: string;
  Description: string | null;
  Project?: { Name: string };
}

interface Device {
  ResourceID: number;
  Name: string;
  Type: string;
  Location: string | null;
}

const fetchPrograms = async (): Promise<Program[]> => {
  const response = await fetch('/api/programs', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchDevices = async (): Promise<Device[]> => {
  const response = await fetch('/api/resources', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) return [];
  return response.json();
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'program': return Building2;
    case 'project': return FolderOpen;
    case 'task': return CheckCircle;
    case 'device': return Wrench;
    case 'report': return TrendingUp;
    default: return FolderTree;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'program': return '#3b82f6';
    case 'project': return '#10b981';
    case 'task': return '#f59e0b';
    case 'device': return '#8b5cf6';
    case 'report': return '#ef4444';
    default: return '#6b7280';
  }
};

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ onNavigate, isOpen, onClose }: GlobalSearchProps): React.ReactElement | null {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: programs } = useQuery({ queryKey: ['search-programs'], queryFn: fetchPrograms, enabled: isOpen });
  const { data: projects } = useQuery({ queryKey: ['search-projects'], queryFn: fetchProjects, enabled: isOpen });
  const { data: tasks } = useQuery({ queryKey: ['search-tasks'], queryFn: fetchTasks, enabled: isOpen });
  const { data: devices } = useQuery({ queryKey: ['search-devices'], queryFn: fetchDevices, enabled: isOpen });

  // Build search index
  const buildSearchIndex = useCallback((): SearchResult[] => {
    const index: SearchResult[] = [];

    programs?.forEach(p => {
      index.push({
        id: p.ProgramID,
        type: 'program',
        title: p.Name,
        subtitle: p.Description || 'Program',
        link: 'programs'
      });
    });

    projects?.forEach(p => {
      index.push({
        id: p.ProjectID,
        type: 'project',
        title: p.Name,
        subtitle: p.Description || p.Program?.Name || 'Project',
        link: 'projects'
      });
    });

    tasks?.forEach(t => {
      index.push({
        id: t.TaskID,
        type: 'task',
        title: t.Name,
        subtitle: t.Description || t.Project?.Name || 'Task',
        link: 'tasks'
      });
    });

    devices?.forEach(d => {
      index.push({
        id: d.ResourceID,
        type: 'device',
        title: d.Name,
        subtitle: d.Type + (d.Location ? ` - ${d.Location}` : ''),
        link: 'devices'
      });
    });

    return index;
  }, [programs, projects, tasks, devices]);

  // Search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const index = buildSearchIndex();
    const searchTerm = query.toLowerCase();
    
    const filtered = index.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.subtitle.toLowerCase().includes(searchTerm)
    ).slice(0, 10);

    setResults(filtered);
    setSelectedIndex(0);
  }, [query, buildSearchIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          const selected = results[selectedIndex];
          if (selected) {
            onNavigate(selected.link);
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay">
      <div ref={containerRef} className="global-search-container">
        <div className="global-search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search programs, projects, tasks, devices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
          <kbd className="shortcut-hint">ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="global-search-results">
            <div className="results-header">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            <ul className="results-list">
              {results.map((result, index) => {
                const Icon = getIconForType(result.type);
                const color = getColorForType(result.type);
                const isSelected = index === selectedIndex;

                return (
                  <li
                    key={`${result.type}-${result.id}`}
                    className={`result-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="result-icon" style={{ color }}>
                      <Icon size={20} />
                    </div>
                    <div className="result-content">
                      <div className="result-title">{result.title}</div>
                      <div className="result-subtitle">
                        <span className="result-type" style={{ backgroundColor: `${color}20`, color }}>
                          {result.type}
                        </span>
                        {result.subtitle}
                      </div>
                    </div>
                    <div className="result-action">
                      <span className="view-hint">View</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="global-search-empty">
            <p>No results found for "{query}"</p>
            <p className="hint">Try searching for programs, projects, tasks, or devices</p>
          </div>
        )}

        {!query && (
          <div className="global-search-hints">
            <p className="hint-title">Quick navigation</p>
            <div className="shortcut-hints">
              <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>esc</kbd> Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
