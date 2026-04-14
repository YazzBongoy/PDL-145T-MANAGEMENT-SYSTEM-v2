import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Save, Loader2, AlertCircle } from 'lucide-react';
import { useSettings, useUpdateSettings, useUpdateNotifications } from '../../hooks/useSettings';
import './Settings.css';

type SettingTab = 'profile' | 'notifications' | 'security' | 'appearance';

export function SettingsView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [localSettings, setLocalSettings] = useState({
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: {
      taskUpdates: true,
      approvals: true,
      dailySummary: false,
      maintenanceAlerts: true,
    },
    pushNotifications: {
      taskUpdates: true,
      approvals: true,
    },
  });

  const { data: settings, isLoading, error } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const updateNotificationsMutation = useUpdateNotifications();

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: settings.theme || 'system',
        language: settings.language || 'en',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY',
        emailNotifications: {
          taskUpdates: settings.emailNotifications?.taskUpdates ?? true,
          approvals: settings.emailNotifications?.approvals ?? true,
          dailySummary: settings.emailNotifications?.dailySummary ?? false,
          maintenanceAlerts: settings.emailNotifications?.maintenanceAlerts ?? true,
        },
        pushNotifications: {
          taskUpdates: settings.pushNotifications?.taskUpdates ?? true,
          approvals: settings.pushNotifications?.approvals ?? true,
        },
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync({
      theme: localSettings.theme,
      language: localSettings.language,
      dateFormat: localSettings.dateFormat,
    });
    
    await updateNotificationsMutation.mutateAsync({
      emailNotifications: localSettings.emailNotifications,
      pushNotifications: localSettings.pushNotifications,
    });
  };

  const handleNotificationToggle = (type: 'email' | 'push', key: string) => {
    if (type === 'email') {
      setLocalSettings(prev => ({
        ...prev,
        emailNotifications: {
          ...prev.emailNotifications,
          [key]: !prev.emailNotifications[key as keyof typeof prev.emailNotifications],
        },
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        pushNotifications: {
          ...prev.pushNotifications,
          [key]: !prev.pushNotifications[key as keyof typeof prev.pushNotifications],
        },
      }));
    }
  };

  const tabs = [
    { key: 'profile' as SettingTab, label: 'Profile', icon: User },
    { key: 'notifications' as SettingTab, label: 'Notifications', icon: Bell },
    { key: 'security' as SettingTab, label: 'Security', icon: Shield },
    { key: 'appearance' as SettingTab, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="settings-view" data-testid="settings-view">
      <div className="section-header">
        <div className="section-title">
          <Settings className="section-icon" size={24} />
          <h2 data-testid="settings-title">Settings</h2>
        </div>
        <button 
          className="btn btn--primary" 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending || updateNotificationsMutation.isPending}
          data-testid="settings-save-button"
        >
          <Save size={16} />
          {updateSettingsMutation.isPending || updateNotificationsMutation.isPending 
            ? 'Saving...' 
            : updateSettingsMutation.isSuccess 
              ? 'Saved!' 
              : 'Save Changes'}
        </button>
      </div>

      {isLoading && (
        <div className="loading-state" data-testid="settings-loading">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading settings...</p>
        </div>
      )}

      {error && (
        <div className="error-state" data-testid="settings-error">
          <AlertCircle size={24} />
          <p>Error loading settings: {error.message}</p>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar" data-testid="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`settings-tab-${tab.key}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section" data-testid="settings-section-profile">
              <h3 data-testid="settings-section-title">Profile Settings</h3>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" defaultValue="John Doe" data-testid="profile-name-input" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="user@pdl145t.com" data-testid="profile-email-input" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" defaultValue="Construction Manager" disabled data-testid="profile-role-input" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="+1 (555) 000-0000" data-testid="profile-phone-input" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section" data-testid="settings-section-notifications">
              <h3 data-testid="settings-section-title">Notification Preferences</h3>
              <h4 data-testid="notifications-email-heading">Email Notifications</h4>
              <div className="toggle-list">
                <label className="toggle-item" data-testid="toggle-email-taskUpdates">
                  <input 
                    type="checkbox" 
                    checked={localSettings.emailNotifications.taskUpdates}
                    onChange={() => handleNotificationToggle('email', 'taskUpdates')}
                    data-testid="checkbox-email-taskUpdates"
                  />
                  <span className="toggle-label">Email notifications for task updates</span>
                </label>
                <label className="toggle-item" data-testid="toggle-email-approvals">
                  <input 
                    type="checkbox" 
                    checked={localSettings.emailNotifications.approvals}
                    onChange={() => handleNotificationToggle('email', 'approvals')}
                    data-testid="checkbox-email-approvals"
                  />
                  <span className="toggle-label">Email notifications for approvals</span>
                </label>
                <label className="toggle-item" data-testid="toggle-email-dailySummary">
                  <input 
                    type="checkbox" 
                    checked={localSettings.emailNotifications.dailySummary}
                    onChange={() => handleNotificationToggle('email', 'dailySummary')}
                    data-testid="checkbox-email-dailySummary"
                  />
                  <span className="toggle-label">Daily summary report</span>
                </label>
                <label className="toggle-item" data-testid="toggle-email-maintenanceAlerts">
                  <input 
                    type="checkbox" 
                    checked={localSettings.emailNotifications.maintenanceAlerts}
                    onChange={() => handleNotificationToggle('email', 'maintenanceAlerts')}
                    data-testid="checkbox-email-maintenanceAlerts"
                  />
                  <span className="toggle-label">System maintenance alerts</span>
                </label>
              </div>
              <h4 style={{ marginTop: '1.5rem' }} data-testid="notifications-push-heading">Push Notifications</h4>
              <div className="toggle-list">
                <label className="toggle-item" data-testid="toggle-push-taskUpdates">
                  <input 
                    type="checkbox" 
                    checked={localSettings.pushNotifications.taskUpdates}
                    onChange={() => handleNotificationToggle('push', 'taskUpdates')}
                    data-testid="checkbox-push-taskUpdates"
                  />
                  <span className="toggle-label">Push notifications for task updates</span>
                </label>
                <label className="toggle-item" data-testid="toggle-push-approvals">
                  <input 
                    type="checkbox" 
                    checked={localSettings.pushNotifications.approvals}
                    onChange={() => handleNotificationToggle('push', 'approvals')}
                    data-testid="checkbox-push-approvals"
                  />
                  <span className="toggle-label">Push notifications for approvals</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section" data-testid="settings-section-security">
              <h3 data-testid="settings-section-title">Security Settings</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" data-testid="security-current-password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" data-testid="security-new-password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" data-testid="security-confirm-password" />
              </div>
              <div className="security-info" data-testid="security-2fa-section">
                <h4>Two-Factor Authentication</h4>
                <p>Status: <span className="status-disabled" data-testid="security-2fa-status">Disabled</span></p>
                <button className="btn btn--secondary" data-testid="security-enable-2fa">Enable 2FA</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section" data-testid="settings-section-appearance">
              <h3 data-testid="settings-section-title">Appearance</h3>
              <div className="form-group">
                <label>Theme</label>
                <select 
                  value={localSettings.theme}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value }))}
                  data-testid="appearance-theme-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select 
                  value={localSettings.language}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value }))}
                  data-testid="appearance-language-select"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Format</label>
                <select 
                  value={localSettings.dateFormat}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  data-testid="appearance-dateformat-select"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
