import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const DatabaseNode = ({ id, data }) => {
  const initialFields = {
    dbType: data?.dbType || 'Postgres',
    query: data?.query || 'SELECT * FROM users LIMIT 10;'
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-conn`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-res`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="Database Query"
      initialFields={initialFields}
      handles={handles}
      className="database-node"
      renderContent={(fields, handleChange) => (
        <>
          <div className="node-field">
            <label>
              DB Type:
              <select
                value={fields.dbType}
                onChange={(e) => handleChange('dbType', e.target.value)}
              >
                <option value="Postgres">Postgres</option>
                <option value="MongoDB">MongoDB</option>
                <option value="MySQL">MySQL</option>
              </select>
            </label>
          </div>
          <div className="node-field">
            <label>
              Query:
              <textarea
                value={fields.query}
                onChange={(e) => handleChange('query', e.target.value)}
                placeholder="Enter database query..."
                rows={2}
                style={{ fontFamily: 'monospace' }}
              />
            </label>
          </div>
        </>
      )}
    />
  );
};
