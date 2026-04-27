import { Sun, Moon, Monitor } from 'lucide-react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const themes: { key: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="theme-toggle">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`theme-toggle__btn ${theme === key ? 'active' : ''}`}
          onClick={() => onThemeChange(key)}
          aria-label={`Switch to ${label} theme`}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
