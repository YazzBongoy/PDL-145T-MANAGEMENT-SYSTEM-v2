import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, FolderOpen, Package, FileText, Ruler, CheckCircle, FileSpreadsheet, X } from 'lucide-react';
import { Logo } from './Logo';
import type { User } from '../../types';

interface AppBarProps {
  user: User | null;
  onLogout?: () => void;
}

export function AppBar({ user, onLogout }: AppBarProps): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/resources', label: 'Resources', icon: Package },
    { path: '/measurements', label: 'Measurements', icon: Ruler },
    { path: '/validations', label: 'Validations', icon: CheckCircle },
    { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { path: '/documents', label: 'Documents', icon: FileText },
  ];

  const handleNavClick = (): void => {
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
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `app-bar__nav-item ${isActive ? 'app-bar__nav-item--active' : ''}`
              }
            >
              <item.icon className="app-bar__nav-icon" size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Menu */}
        <div className="app-bar__actions">
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
                    <button className="app-bar__user-action">Profile</button>
                    <button className="app-bar__user-action">Preferences</button>
                    <hr className="app-bar__separator" />
                    <button onClick={onLogout} className="app-bar__user-action app-bar__user-action--danger">
                      Sign Out
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
            aria-label="Toggle menu"
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
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="app-bar__nav app-bar__nav--mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `app-bar__nav-item app-bar__nav-item--mobile ${isActive ? 'app-bar__nav-item--active' : ''}`
                  }
                >
                  <item.icon className="app-bar__nav-icon" size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
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
                  <button className="app-bar__mobile-user-action">Profile</button>
                  <button className="app-bar__mobile-user-action">Preferences</button>
                  <button onClick={onLogout} className="app-bar__mobile-user-action app-bar__mobile-user-action--danger">
                    Sign Out
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
