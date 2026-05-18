import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FolderOpen, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';
import { getApiUrl } from '../../api/config';
import './KPIs.css';

interface KPIData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  spentBudget: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  delayedTasks: number;
  taskCompletionRate: number;
  budgetExecutionRate: number;
  averageProjectProgress: number;
}

const fetchKPIData = async (): Promise<KPIData> => {
  const response = await fetch(getApiUrl('/api/metrics/dashboard'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch KPI data');
  return response.json();
};

const fetchProjects = async () => {
  const response = await fetch(getApiUrl('/api/projects'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

const fetchTasks = async () => {
  const response = await fetch(getApiUrl('/api/tasks'), {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
}) {
  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card__header">
        <div className={`kpi-card__icon kpi-card__icon--${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`kpi-card__trend kpi-card__trend--${trend}`}>
            {trend === 'up' && <TrendingUp size={16} />}
            {trend === 'down' && <TrendingDown size={16} />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className="kpi-card__content">
        <div className="kpi-card__value">{value}</div>
        <div className="kpi-card__title">{title}</div>
        {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ 
  label, 
  current, 
  total, 
  color = 'blue' 
}: { 
  label: string; 
  current: number; 
  total: number; 
  color?: string;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__label">{label}</span>
        <span className="progress-bar__value">{percentage}%</span>
      </div>
      <div className="progress-bar__track">
        <div 
          className={`progress-bar__fill progress-bar__fill--${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-bar__stats">
        <span>{current} / {total}</span>
      </div>
    </div>
  );
}

function StatusDistribution({ 
  title, 
  data 
}: { 
  title: string; 
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <div className="status-distribution">
      <h4 className="status-distribution__title">{title}</h4>
      <div className="status-distribution__chart">
        {data.map((item, index) => (
          <div 
            key={index}
            className="status-distribution__segment"
            style={{ 
              width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
              backgroundColor: item.color
            }}
            title={`${item.label}: ${item.value}`}
          />
        ))}
      </div>
      <div className="status-distribution__legend">
        {data.map((item, index) => (
          <div key={index} className="status-distribution__legend-item">
            <span 
              className="status-distribution__legend-color" 
              style={{ backgroundColor: item.color }}
            />
            <span className="status-distribution__legend-label">{item.label}</span>
            <span className="status-distribution__legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgrammaticKPIs() {
  const { t } = useTranslation();
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });

  const { data: kpiData } = useQuery({
    queryKey: ['kpiData'],
    queryFn: fetchKPIData
  });

  // Calculate metrics
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter((p: any) => p.Status === 'IN_PROGRESS').length || 0;
  const completedProjects = projects?.filter((p: any) => p.Status === 'COMPLETED').length || 0;
  
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t: any) => t.CompletionStatus === 'COMPLETED').length || 0;
  const inProgressTasks = tasks?.filter((t: any) => t.CompletionStatus === 'IN_PROGRESS').length || 0;
  const notStartedTasks = tasks?.filter((t: any) => t.CompletionStatus === 'NOT_STARTED').length || 0;
  const delayedTasks = tasks?.filter((t: any) => t.CompletionStatus === 'DELAYED' || t.Status === 'BLOCKED').length || 0;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const budgetExecutionRate = kpiData?.budgetExecutionRate || 0;
  const averageProgress = kpiData?.averageProjectProgress || 0;

  return (
    <div className="programmatic-kpis">
      <div className="kpi-section">
        <h3 className="kpi-section__title">
          <Target size={20} />
          {t('kpis.overview', 'Vue d\'ensemble')}
        </h3>
        <div className="kpi-grid kpi-grid--4">
          <KPICard
            title={t('kpis.projects', 'Projets')}
            value={totalProjects}
            subtitle={`${activeProjects} ${t('kpis.active', 'actifs')}, ${completedProjects} ${t('kpis.completed', 'terminés')}`}
            icon={FolderOpen}
            color="blue"
          />
          <KPICard
            title={t('kpis.tasks', 'Tâches')}
            value={totalTasks}
            subtitle={`${completedTasks} ${t('kpis.completed', 'terminées')}, ${inProgressTasks} ${t('kpis.inProgress', 'en cours')}`}
            icon={CheckCircle}
            color="green"
            trend={taskCompletionRate >= 70 ? 'up' : 'neutral'}
            trendValue={`${taskCompletionRate}%`}
          />
          <KPICard
            title={t('kpis.budgetExecution', 'Exécution budgétaire')}
            value={`${budgetExecutionRate.toFixed(1)}%`}
            subtitle={t('kpis.ofTotal', 'du total')}
            icon={DollarSign}
            color="amber"
          />
          <KPICard
            title={t('kpis.averageProgress', 'Progression moyenne')}
            value={`${averageProgress.toFixed(1)}%`}
            subtitle={t('kpis.perProject', 'par projet')}
            icon={BarChart3}
            color="purple"
          />
        </div>
      </div>

      <div className="kpi-section">
        <h3 className="kpi-section__title">
          <Clock size={20} />
          {t('kpis.progress', 'Progression')}
        </h3>
        <div className="kpi-grid kpi-grid--2">
          <div className="kpi-card">
            <ProgressBar
              label={t('kpis.projectCompletion', 'Achèvement des projets')}
              current={completedProjects}
              total={totalProjects}
              color="blue"
            />
            <ProgressBar
              label={t('kpis.taskCompletion', 'Achèvement des tâches')}
              current={completedTasks}
              total={totalTasks}
              color="green"
            />
            <ProgressBar
              label={t('kpis.budgetUsed', 'Budget utilisé')}
              current={kpiData?.spentBudget || 0}
              total={kpiData?.totalBudget || 1}
              color="amber"
            />
          </div>

          <div className="kpi-card">
            <StatusDistribution
              title={t('kpis.taskStatusDistribution', 'Répartition des statuts de tâches')}
              data={[
                { label: t('kpis.completed', 'Terminées'), value: completedTasks, color: '#10b981' },
                { label: t('kpis.inProgress', 'En cours'), value: inProgressTasks, color: '#3b82f6' },
                { label: t('kpis.notStarted', 'Non commencées'), value: notStartedTasks, color: '#6b7280' },
                { label: t('kpis.delayed', 'Retardées'), value: delayedTasks, color: '#ef4444' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="kpi-section">
        <h3 className="kpi-section__title">
          <AlertTriangle size={20} />
          {t('kpis.alerts', 'Alertes')}
        </h3>
        <div className="kpi-grid kpi-grid--3">
          <div className={`alert-card ${delayedTasks > 0 ? 'alert-card--warning' : 'alert-card--success'}`}>
            <div className="alert-card__icon">
              <Clock size={20} />
            </div>
            <div className="alert-card__content">
              <div className="alert-card__value">{delayedTasks}</div>
              <div className="alert-card__label">{t('kpis.delayedTasks', 'Tâches retardées')}</div>
            </div>
          </div>

          <div className={`alert-card ${taskCompletionRate < 50 ? 'alert-card--danger' : taskCompletionRate < 70 ? 'alert-card--warning' : 'alert-card--success'}`}>
            <div className="alert-card__icon">
              <Target size={20} />
            </div>
            <div className="alert-card__content">
              <div className="alert-card__value">{taskCompletionRate}%</div>
              <div className="alert-card__label">{t('kpis.completionRate', 'Taux d\'achèvement')}</div>
            </div>
          </div>

          <div className={`alert-card ${budgetExecutionRate > 90 ? 'alert-card--warning' : 'alert-card--success'}`}>
            <div className="alert-card__icon">
              <DollarSign size={20} />
            </div>
            <div className="alert-card__content">
              <div className="alert-card__value">{budgetExecutionRate.toFixed(1)}%</div>
              <div className="alert-card__label">{t('kpis.budgetSpent', 'Budget dépensé')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgrammaticKPIs;
