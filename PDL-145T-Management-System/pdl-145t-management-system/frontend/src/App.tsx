import { useState, useEffect } from 'react';
import './App.css';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

// Dashboard placeholders
function AdminDashboard({ user, onLogout, token }: { user: any; onLogout: () => void; token: string }) {
  return <div><h2>Admin Dashboard</h2><ProjectList user={user} token={token} /><ResourceList user={user} token={token} /><button onClick={onLogout}>Logout</button></div>;
}
function SupervisorDashboard({ user, onLogout, token }: { user: any; onLogout: () => void; token: string }) {
  return <div><h2>Supervisor Dashboard</h2><ProjectList user={user} token={token} /><ResourceList user={user} token={token} /><button onClick={onLogout}>Logout</button></div>;
}
function FinanceDashboard({ user: _user, onLogout }: { user: any; onLogout: () => void }) {
  return <div><h2>Finance Dashboard</h2><button onClick={onLogout}>Logout</button></div>;
}
function ConstructionDashboard({ user: _user, onLogout }: { user: any; onLogout: () => void }) {
  return <div><h2>Construction Dashboard</h2><button onClick={onLogout}>Logout</button></div>;
}
function UserDashboard({ user: _user, onLogout }: { user: any; onLogout: () => void }) {
  return <div><h2>User Dashboard</h2><button onClick={onLogout}>Logout</button></div>;
}

// Minimal Project CRUD UI
function ProjectList({ user, token }: { user: any; token: string }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ Name: '', StartDate: '', EndDate: '', TotalBudget: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      setProjects(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/projects/${editId}` : '/api/projects';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save project');
      setShowForm(false);
      setForm({ Name: '', StartDate: '', EndDate: '', TotalBudget: '' });
      setEditId(null);
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save project');
    }
  };

  const handleEdit = (project: any) => {
    setForm({
      Name: project.Name,
      StartDate: project.StartDate ? project.StartDate.slice(0, 10) : '',
      EndDate: project.EndDate ? project.EndDate.slice(0, 10) : '',
      TotalBudget: project.TotalBudget,
    });
    setEditId(project.ProjectID);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div>
      <h3>Projects</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={() => { setShowForm(true); setEditId(null); }} disabled={user.role !== 'ADMIN' && user.role !== 'SUPERVISOR'}>
        + New Project
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="project-form">
          <input name="Name" placeholder="Name" value={form.Name} onChange={handleChange} required />
          <input name="StartDate" type="date" placeholder="Start Date" value={form.StartDate} onChange={handleChange} required />
          <input name="EndDate" type="date" placeholder="End Date" value={form.EndDate} onChange={handleChange} />
          <input name="TotalBudget" type="number" placeholder="Total Budget" value={form.TotalBudget} onChange={handleChange} required />
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
        </form>
      )}
      <ul>
        {projects.map((p) => (
          <li key={p.ProjectID}>
            <b>{p.Name}</b> (Start: {p.StartDate?.slice(0, 10)}) Budget: {p.TotalBudget}
            {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
              <>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.ProjectID)}>Delete</button>
              </>
            )}
            <TaskList projectId={p.ProjectID} user={user} token={token} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskList({ projectId, user, token }: { projectId: number; user: any; token: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ Description: '', Duration: '', AssignedTo: '', CompletionStatus: 'NotStarted' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      setTasks(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/tasks/${editId}` : `/api/projects/${projectId}/tasks`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save task');
      setShowForm(false);
      setForm({ Description: '', Duration: '', AssignedTo: '', CompletionStatus: 'NotStarted' });
      setEditId(null);
      fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleEdit = (task: any) => {
    setForm({
      Description: task.Description,
      Duration: task.Duration || '',
      AssignedTo: task.AssignedTo || '',
      CompletionStatus: task.CompletionStatus || 'NotStarted',
    });
    setEditId(task.TaskID);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <h4>Tasks</h4>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={() => { setShowForm(true); setEditId(null); }} disabled={user.role !== 'ADMIN' && user.role !== 'SUPERVISOR'}>
        + New Task
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="task-form">
          <input name="Description" placeholder="Description" value={form.Description} onChange={handleChange} required />
          <input name="Duration" type="number" placeholder="Duration (days)" value={form.Duration} onChange={handleChange} />
          <input name="AssignedTo" placeholder="Assigned To" value={form.AssignedTo} onChange={handleChange} />
          <select name="CompletionStatus" value={form.CompletionStatus} onChange={handleChange}>
            <option value="NotStarted">Not Started</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
        </form>
      )}
      <ul>
        {tasks.map((t) => (
          <li key={t.TaskID}>
            <b>{t.Description}</b> (Status: {t.CompletionStatus}) Assigned: {t.AssignedTo || 'Unassigned'}
            {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
              <>
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t.TaskID)}>Delete</button>
              </>
            )}
            <ExpenseList taskId={t.TaskID} user={user} token={token} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResourceList({ user, token }: { user: any; token: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ Type: '', Quantity: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resources', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch resources');
      setResources(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/resources/${editId}` : '/api/resources';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save resource');
      setShowForm(false);
      setForm({ Type: '', Quantity: '' });
      setEditId(null);
      fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save resource');
    }
  };

  const handleEdit = (resource: any) => {
    setForm({ Type: resource.Type, Quantity: resource.Quantity });
    setEditId(resource.ResourceID);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete resource');
      fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete resource');
    }
  };

  return (
    <div>
      <h3>Resources</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={() => { setShowForm(true); setEditId(null); }} disabled={user.role !== 'ADMIN' && user.role !== 'SUPERVISOR'}>
        + New Resource
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="resource-form">
          <input name="Type" placeholder="Type" value={form.Type} onChange={handleChange} required />
          <input name="Quantity" type="number" placeholder="Quantity" value={form.Quantity} onChange={handleChange} required />
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
        </form>
      )}
      <ul>
        {resources.map((r) => (
          <li key={r.ResourceID}>
            <b>{r.Type}</b> (Qty: {r.Quantity})
            {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
              <>
                <button onClick={() => handleEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.ResourceID)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExpenseList({ taskId, user, token }: { taskId: number; user: any; token: string }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ Description: '', Cost: '', Date: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      setExpenses(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/expenses/${editId}` : `/api/tasks/${taskId}/expenses`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save expense');
      setShowForm(false);
      setForm({ Description: '', Cost: '', Date: '' });
      setEditId(null);
      fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleEdit = (expense: any) => {
    setForm({
      Description: expense.Description || '',
      Cost: expense.Cost,
      Date: expense.Date ? expense.Date.slice(0, 10) : '',
    });
    setEditId(expense.ExpenseID);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <h5>Expenses</h5>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={() => { setShowForm(true); setEditId(null); }} disabled={user.role !== 'ADMIN' && user.role !== 'SUPERVISOR'}>
        + New Expense
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="expense-form">
          <input name="Description" placeholder="Description" value={form.Description} onChange={handleChange} />
          <input name="Cost" type="number" placeholder="Cost" value={form.Cost} onChange={handleChange} required />
          <input name="Date" type="date" placeholder="Date" value={form.Date} onChange={handleChange} required />
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
        </form>
      )}
      <ul>
        {expenses.map((e) => (
          <li key={e.ExpenseID}>
            <b>{e.Description || 'Expense'}</b> - {e.Cost} on {e.Date?.slice(0, 10)}
            {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
              <>
                <button onClick={() => handleEdit(e)}>Edit</button>
                <button onClick={() => handleDelete(e.ExpenseID)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App(): React.ReactElement {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('USER');
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealthStatus(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch health status'
        );
        setHealthStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  const refreshHealth = (): void => {
    setLoading(true);
    setError(null);
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setHealthStatus(data);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch health status'
        );
        setHealthStatus(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
      // Auto-login after registration
      const loginRes = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });
      if (!loginRes.ok) {
        throw new Error('Registration succeeded but login failed');
      }
      const loginData = await loginRes.json();
      setToken(loginData.token);
      setUser(loginData.user);
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterRole('USER');
      setShowRegister(false);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDL-145T Management System</h1>
        <p>Welcome to the PDL-145T Management System frontend</p>
      </header>

      <main className="app-main">
        {/* Auth UI and Dashboards */}
        <section className="auth-section">
          {token && user ? (
            user.role === 'ADMIN' ? (
              <AdminDashboard user={user} onLogout={handleLogout} token={token} />
            ) : user.role === 'SUPERVISOR' ? (
              <SupervisorDashboard user={user} onLogout={handleLogout} token={token} />
            ) : user.role === 'FINANCE' ? (
              <FinanceDashboard user={user} onLogout={handleLogout} />
            ) : user.role === 'CONSTRUCTION' ? (
              <ConstructionDashboard user={user} onLogout={handleLogout} />
            ) : (
              <UserDashboard user={user} onLogout={handleLogout} />
            )
          ) : showRegister ? (
            <form onSubmit={handleRegister} className="register-form">
              <h2>Register</h2>
              {registerError && <div className="error">{registerError}</div>}
              <input
                type="text"
                placeholder="Name"
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                required
              />
              <select value={registerRole} onChange={e => setRegisterRole(e.target.value)}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="FINANCE">Finance</option>
                <option value="CONSTRUCTION">Construction</option>
              </select>
              <button type="submit">Register</button>
              <button type="button" onClick={() => setShowRegister(false)}>
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <h2>Login</h2>
              {authError && <div className="error">{authError}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
              <button type="button" onClick={() => setShowRegister(true)}>
                Register
              </button>
            </form>
          )}
        </section>
        <section className="health-check">
          <h2>Backend Health Status</h2>

          {loading && <p>Loading health status...</p>}

          {error && (
            <div className="error">
              <p>Error: {error}</p>
              <button onClick={refreshHealth}>Retry</button>
            </div>
          )}

          {healthStatus && (
            <div className="health-status">
              <div
                className={`status-indicator ${healthStatus.status.toLowerCase()}`}
              >
                Status: {healthStatus.status}
              </div>
              <p>
                Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
              </p>
              <p>Uptime: {Math.floor(healthStatus.uptime)} seconds</p>
              <button onClick={refreshHealth}>Refresh</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
