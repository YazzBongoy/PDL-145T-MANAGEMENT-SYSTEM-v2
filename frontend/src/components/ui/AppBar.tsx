import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Wrench, TrendingUp, Settings, X, FolderTree, FolderOpen, CheckCircle, Search, Command, Building2, FileText, Clipboard, Users, Bell, KeyRound, FileBarChart, Ruler } from 'lucide-react';
import { Logo } from './Logo';
import { GlobalSearch } from '../GlobalSearch';
import type { User } from '../../types';

interface AppBarProps {
  user: User | null;
  currentView?: string;
  onViewChange?: (view: string) => void;
  onLogout?: () => void;
}

export function AppBar({ user, currentView = 'dashboard', onViewChange, onLogout }: AppBarProps): React.ReactElement {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { key: 'programs', label: t('nav.programs'), icon: FolderTree },
    { key: 'projects', label: t('nav.projects'), icon: FolderOpen },
    { key: 'tasks', label: t('nav.tasks'), icon: CheckCircle },
    { key: 'measurements', label: 'Mesures', icon: Ruler },
    { key: 'enterprises', label: t('enterprises.title'), icon: Building2 },
    { key: 'contracts', label: t('contracts.title'), icon: Clipboard },
    { key: 'documents', label: t('documents.title'), icon: FileText },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'permissions', label: 'Permissions', icon: KeyRound },
    { key: 'advanced-reports', label: 'Advanced Reports', icon: FileBarChart },
    { key: 'devices', label: t('nav.devices'), icon: Wrench },
    { key: 'reports', label: t('nav.reports'), icon: TrendingUp },
    { key: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const handleNavClick = (view: string): void => {
    onViewChange?.(view);
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Global search keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="app-bar">
      <div className="app-bar__container">
        {/* Logo */}
        <div className="app-bar__brand">
          <Logo variant="full" size="md" />
        </div>

        {/* Desktop Navigation */}
        <nav className="app-bar__nav app-bar__nav--desktop">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`app-bar__nav-item ${
                currentView === item.key ? 'app-bar__nav-item--active' : ''
              }`}
              aria-current={currentView === item.key ? 'page' : undefined}
              data-testid={`nav-${item.key}`}
            >
              <item.icon className="app-bar__nav-icon" size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Search & User Menu */}
        <div className="app-bar__actions">
          {/* Search Button */}
          {user && (
            <button
              onClick={() => setSearchOpen(true)}
              className="app-bar__search-button"
              aria-label={`${t('common.search')} (Cmd+K)`}
            >
              <Search size={18} />
              <span className="search-text">{t('common.search')}</span>
              <kbd className="keyboard-shortcut">
                <Command size={12} />
                <span>K</span>
              </kbd>
            </button>
          )}

          {/* Global Search Modal */}
          {user && (
            <GlobalSearch
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              onNavigate={handleNavClick}
            />
          )}

          {user && (
            <div className="app-bar__user-menu" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="app-bar__user-button"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="app-bar__user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="app-bar__user-name">{user.name}</span>
                <svg className="app-bar__chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="app-bar__user-dropdown">
                  <div className="app-bar__user-info">
                    <span className="app-bar__user-role">{user.role}</span>
                    <span className="app-bar__user-email">{user.email}</span>
                  </div>
                  <div className="app-bar__user-actions">
                    <button className="app-bar__user-action">{t('nav.profile')}</button>
                    <button className="app-bar__user-action">{t('nav.preferences')}</button>
                    <hr className="app-bar__separator" />
                    <button onClick={onLogout} className="app-bar__user-action app-bar__user-action--danger">
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="app-bar__mobile-menu-button"
            aria-expanded={mobileMenuOpen}
            aria-label={t('common.actions')}
          >
            <svg className="app-bar__hamburger" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="app-bar__mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Drawer */}
          <div className="app-bar__mobile-drawer" ref={mobileMenuRef}>
            <div className="app-bar__mobile-header">
              <Logo variant="full" size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="app-bar__mobile-close"
                aria-label={t('common.close')}
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="app-bar__nav app-bar__nav--mobile">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`app-bar__nav-item app-bar__nav-item--mobile ${
                    currentView === item.key ? 'app-bar__nav-item--active' : ''
                  }`}
                  aria-current={currentView === item.key ? 'page' : undefined}
                  data-testid={`nav-mobile-${item.key}`}
                >
                  <item.icon className="app-bar__nav-icon" size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* Mobile User Section */}
            {user && (
              <div className="app-bar__mobile-user">
                <div className="app-bar__mobile-user-info">
                  <div className="app-bar__user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="app-bar__mobile-user-name">{user.name}</div>
                    <div className="app-bar__mobile-user-role">{user.role}</div>
                  </div>
                </div>
                <div className="app-bar__mobile-user-actions">
                  <button className="app-bar__mobile-user-action">{t('nav.profile')}</button>
                  <button className="app-bar__mobile-user-action">{t('nav.preferences')}</button>
                  <button onClick={onLogout} className="app-bar__mobile-user-action app-bar__mobile-user-action--danger">
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
