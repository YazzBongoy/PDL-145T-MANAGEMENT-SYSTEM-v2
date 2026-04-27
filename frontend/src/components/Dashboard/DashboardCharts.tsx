import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import './DashboardCharts.css';

interface DashboardChartsProps {
  programs: any[];
  projects: any[];
  tasks: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardCharts({ programs, projects, tasks }: DashboardChartsProps) {
  // Budget allocation by program
  const budgetData = programs.map((p) => ({
    name: p.Name.length > 20 ? p.Name.substring(0, 20) + '...' : p.Name,
    budget: Number(p.Budget) || 0,
    spent: p.Projects?.reduce((sum: number, proj: any) => sum + (Number(proj.TotalBudget) || 0), 0) || 0
  }));

  // Task status distribution
  const taskStatusData = [
    { name: 'Not Started', value: tasks.filter(t => t.CompletionStatus === 'NotStarted').length },
    { name: 'In Progress', value: tasks.filter(t => t.CompletionStatus === 'InProgress').length },
    { name: 'Completed', value: tasks.filter(t => t.CompletionStatus === 'Completed').length },
    { name: 'Blocked', value: tasks.filter(t => t.CompletionStatus === 'Blocked').length }
  ].filter(item => item.value > 0);

  // Project progress over time (mock data)
  const progressData = [
    { month: 'Jan', completed: 12, total: 20 },
    { month: 'Feb', completed: 15, total: 25 },
    { month: 'Mar', completed: 18, total: 30 },
    { month: 'Apr', completed: 22, total: 35 },
    { month: 'May', completed: 28, total: 40 },
    { month: 'Jun', completed: 35, total: 45 }
  ];

  // Resource utilization
  const resourceData = projects.slice(0, 6).map((p) => ({
    name: p.Name.length > 15 ? p.Name.substring(0, 15) + '...' : p.Name,
    allocated: Math.floor(Math.random() * 50) + 20,
    utilized: Math.floor(Math.random() * 40) + 15
  }));

  return (
    <div className="dashboard-charts">
      <div className="charts-grid">
        {/* Budget Allocation Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Budget Allocation by Program</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Legend />
                <Bar dataKey="budget" name="Total Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Allocated" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="chart-card">
          <h3 className="chart-title">Task Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} tasks`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress Trend */}
        <div className="chart-card wide">
          <h3 className="chart-title">Project Progress Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="total" name="Total Tasks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="chart-card">
          <h3 className="chart-title">Resource Utilization</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="utilized" name="Utilized" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
