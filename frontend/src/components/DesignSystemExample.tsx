import React from 'react';
import './DesignSystemExample.css';

/**
 * Example component showcasing the new design system
 * This demonstrates proper usage of:
 * - Color palette (primary, secondary, accent)
 * - Typography hierarchy
 * - Spacing system
 * - Icon integration (Heroicons)
 * - Component styling patterns
 */
export const DesignSystemExample: React.FC = () => {
  return (
    <div className="design-system-example">
      {/* Header Section */}
      <header className="example-header">
        <h1 className="text-display-medium text-primary">
          PDL-145T Design System
        </h1>
        <p className="text-body-large text-secondary">
          Modern, accessible, and professional UI components
        </p>
      </header>

      {/* Color Palette Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Color Palette</h2>
        
        <div className="color-grid">
          <div className="color-group">
            <h3 className="text-title-medium">Primary (Blue)</h3>
            <div className="color-row">
              <div className="color-swatch bg-primary-50">50</div>
              <div className="color-swatch bg-primary-100">100</div>
              <div className="color-swatch bg-primary-300">300</div>
              <div className="color-swatch bg-primary-600 text-white">600</div>
              <div className="color-swatch bg-primary-900 text-white">900</div>
            </div>
          </div>
          
          <div className="color-group">
            <h3 className="text-title-medium">Secondary (Emerald)</h3>
            <div className="color-row">
              <div className="color-swatch bg-secondary-50">50</div>
              <div className="color-swatch bg-secondary-100">100</div>
              <div className="color-swatch bg-secondary-300">300</div>
              <div className="color-swatch bg-secondary-600 text-white">600</div>
              <div className="color-swatch bg-secondary-900 text-white">900</div>
            </div>
          </div>
          
          <div className="color-group">
            <h3 className="text-title-medium">Accent (Violet)</h3>
            <div className="color-row">
              <div className="color-swatch bg-accent-50">50</div>
              <div className="color-swatch bg-accent-100">100</div>
              <div className="color-swatch bg-accent-300">300</div>
              <div className="color-swatch bg-accent-600 text-white">600</div>
              <div className="color-swatch bg-accent-900 text-white">900</div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Typography Hierarchy</h2>
        
        <div className="typography-examples">
          <div className="text-display-large">Display Large</div>
          <div className="text-display-medium">Display Medium</div>
          <div className="text-display-small">Display Small</div>
          
          <div className="text-headline-large">Headline Large</div>
          <div className="text-headline-medium">Headline Medium</div>
          <div className="text-headline-small">Headline Small</div>
          
          <div className="text-title-large">Title Large</div>
          <div className="text-title-medium">Title Medium</div>
          <div className="text-title-small">Title Small</div>
          
          <div className="text-body-large">Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
          <div className="text-body-medium">Body Medium - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
          <div className="text-body-small">Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
          
          <div className="text-label-large">Label Large</div>
          <div className="text-label-medium">Label Medium</div>
          <div className="text-label-small">Label Small</div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Button Components</h2>
        
        <div className="button-examples">
          <div className="button-group">
            <button className="btn btn--primary">
              <div className="icon-bg icon-plus icon--sm"></div>
              Primary Button
            </button>
            
            <button className="btn btn--secondary">
              <div className="icon-bg icon-cog-6-tooth icon--sm"></div>
              Secondary Button
            </button>
            
            <button className="btn btn--danger">
              <div className="icon-bg icon-trash icon--sm"></div>
              Danger Button
            </button>
            
            <button className="btn btn--outline">
              <div className="icon-bg icon-eye icon--sm"></div>
              Outline Button
            </button>
          </div>
          
          <div className="button-group">
            <button className="btn btn--primary btn-icon-only">
              <div className="icon-bg icon-heart icon--sm"></div>
              <span className="sr-only">Favorite</span>
            </button>
            
            <button className="btn btn--secondary btn-icon-only">
              <div className="icon-bg icon-bell icon--sm"></div>
              <span className="sr-only">Notifications</span>
            </button>
            
            <button className="btn btn--accent btn-icon-only">
              <div className="icon-bg icon-star icon--sm"></div>
              <span className="sr-only">Star</span>
            </button>
          </div>
        </div>
      </section>

      {/* Icons Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Icon System (Heroicons)</h2>
        
        <div className="icon-examples">
          <div className="icon-group">
            <h3 className="text-title-medium">Status Icons</h3>
            <div className="icon-row">
              <div className="icon-item">
                <div className="icon-bg icon-check-circle icon--lg icon-success"></div>
                <span className="text-label-small">Success</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-x-circle icon--lg icon-error"></div>
                <span className="text-label-small">Error</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-exclamation-triangle icon--lg icon-warning"></div>
                <span className="text-label-small">Warning</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-information-circle icon--lg icon-info"></div>
                <span className="text-label-small">Info</span>
              </div>
            </div>
          </div>
          
          <div className="icon-group">
            <h3 className="text-title-medium">Action Icons</h3>
            <div className="icon-row">
              <div className="icon-item">
                <div className="icon-bg icon-plus icon--lg icon-primary"></div>
                <span className="text-label-small">Add</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-pencil icon--lg icon-secondary"></div>
                <span className="text-label-small">Edit</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-trash icon--lg icon-error"></div>
                <span className="text-label-small">Delete</span>
              </div>
              <div className="icon-item">
                <div className="icon-bg icon-eye icon--lg icon-accent"></div>
                <span className="text-label-small">View</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Card Components</h2>
        
        <div className="card-examples">
          <div className="example-card elevation-2">
            <div className="card-header">
              <div className="icon-bg icon-document-text icon--md icon-primary"></div>
              <h3 className="text-title-large">Project Card</h3>
            </div>
            <div className="card-content">
              <p className="text-body-medium">
                This is an example card component using the design system.
                It demonstrates proper spacing, typography, and elevation.
              </p>
              <div className="status-indicator ok">
                <span>Active Project</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn--primary btn--sm">
                <div className="icon-bg icon-eye icon--xs"></div>
                View Details
              </button>
              <button className="btn btn--outline btn--sm">
                <div className="icon-bg icon-pencil icon--xs"></div>
                Edit
              </button>
            </div>
          </div>
          
          <div className="example-card elevation-3">
            <div className="card-header">
              <div className="icon-bg icon-user-circle icon--md icon-secondary"></div>
              <h3 className="text-title-large">User Profile</h3>
            </div>
            <div className="card-content">
              <p className="text-body-medium">
                User profile card with elevated styling and interactive elements.
              </p>
              <div className="status-indicator warning">
                <span>Pending Verification</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn--secondary btn--sm">
                <div className="icon-bg icon-mail icon--xs"></div>
                Contact
              </button>
              <button className="btn btn--accent btn--sm">
                <div className="icon-bg icon-cog-6-tooth icon--xs"></div>
                Settings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements Section */}
      <section className="example-section">
        <h2 className="text-headline-large">Form Elements</h2>
        
        <form className="example-form">
          <div className="form-group">
            <label className="text-label-medium">Project Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter project name..."
            />
          </div>
          
          <div className="form-group">
            <label className="text-label-medium">Description</label>
            <textarea 
              className="textarea" 
              placeholder="Enter project description..."
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label className="text-label-medium">Status</label>
            <select className="select">
              <option>Select status...</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
          </div>
          
          <div className="button-group">
            <button type="submit" className="btn btn--primary">
              <div className="icon-bg icon-check-circle icon--sm"></div>
              Save Changes
            </button>
            <button type="button" className="btn btn--outline">
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default DesignSystemExample;
