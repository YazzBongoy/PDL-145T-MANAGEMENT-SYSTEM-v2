import React from 'react';
import './Table.css';

export interface TableColumn<T = any> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  title: React.ReactNode;
  /** How to render the cell content */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  /** Data key to access the value from record */
  dataIndex?: string;
  /** Column width */
  width?: string | number;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom class name for the column */
  className?: string;
}

export interface TableProps<T = any> {
  /** Table data source */
  dataSource: T[];
  /** Column configuration */
  columns: TableColumn<T>[];
  /** Loading state */
  loading?: boolean;
  /** Whether to show zebra striping */
  striped?: boolean;
  /** Whether to show borders */
  bordered?: boolean;
  /** Table size variant */
  size?: 'small' | 'default' | 'large';
  /** Custom CSS class name */
  className?: string;
  /** Row key extractor function */
  rowKey?: (record: T, index: number) => string | number;
  /** Custom row class name function */
  rowClassName?: (record: T, index: number) => string;
  /** Row click handler */
  onRowClick?: (record: T, index: number) => void;
  /** Empty state content */
  emptyState?: React.ReactNode;
  /** Table caption for accessibility */
  caption?: string;
  /** Whether table should be responsive */
  responsive?: boolean;
}

export const Table = <T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  striped = true,
  bordered = false,
  size = 'default',
  className = '',
  rowKey = (_, index) => index,
  rowClassName = () => '',
  onRowClick,
  emptyState,
  caption,
  responsive = true
}: TableProps<T>): React.ReactElement => {
  const tableClasses = [
    'enhanced-table',
    striped ? 'enhanced-table--striped' : '',
    bordered ? 'enhanced-table--bordered' : '',
    `enhanced-table--${size}`,
    responsive ? 'enhanced-table--responsive' : '',
    loading ? 'enhanced-table--loading' : '',
    className
  ].filter(Boolean).join(' ');

  const renderCell = (column: TableColumn<T>, record: T, index: number): React.ReactNode => {
    if (column.render) {
      return column.render(
        column.dataIndex ? record[column.dataIndex] : record,
        record,
        index
      );
    }

    if (column.dataIndex) {
      return record[column.dataIndex];
    }

    return null;
  };

  const handleRowClick = (record: T, index: number) => {
    if (onRowClick) {
      onRowClick(record, index);
    }
  };

  if (loading) {
    return (
      <div className={tableClasses}>
        <div className="enhanced-table__loading">
          <div className="enhanced-table__spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!dataSource.length) {
    return (
      <div className={tableClasses}>
        <div className="enhanced-table__empty">
          {emptyState || (
            <>
              <div className="enhanced-table__empty-icon">📊</div>
              <div className="enhanced-table__empty-text">No data available</div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={tableClasses}>
      <div className="enhanced-table__wrapper">
        <table className="enhanced-table__table" role="table">
          {caption && <caption className="enhanced-table__caption">{caption}</caption>}
          
          <thead className="enhanced-table__head">
            <tr className="enhanced-table__header-row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    'enhanced-table__header-cell',
                    `enhanced-table__header-cell--${column.align || 'left'}`,
                    column.sortable ? 'enhanced-table__header-cell--sortable' : '',
                    column.className
                  ].filter(Boolean).join(' ')}
                  style={{ width: column.width }}
                  scope="col"
                >
                  <div className="enhanced-table__header-content">
                    {column.title}
                    {column.sortable && (
                      <span className="enhanced-table__sort-icon">↕</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="enhanced-table__body">
            {dataSource.map((record, index) => {
              const key = rowKey(record, index);
              const customRowClass = rowClassName(record, index);
              
              return (
                <tr
                  key={key}
                  className={[
                    'enhanced-table__row',
                    striped && index % 2 === 0 ? 'enhanced-table__row--even' : '',
                    striped && index % 2 === 1 ? 'enhanced-table__row--odd' : '',
                    onRowClick ? 'enhanced-table__row--clickable' : '',
                    customRowClass
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleRowClick(record, index)}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        'enhanced-table__cell',
                        `enhanced-table__cell--${column.align || 'left'}`,
                        column.className
                      ].filter(Boolean).join(' ')}
                    >
                      <div className="enhanced-table__cell-content">
                        {renderCell(column, record, index)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
