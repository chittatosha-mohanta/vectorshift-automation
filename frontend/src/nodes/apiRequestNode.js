import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const ApiRequestNode = ({ id, data }) => {
  const initialFields = {
    method: data?.method || 'GET',
    url: data?.url || 'https://api.example.com/data'
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-trigger`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-response`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="API Request"
      initialFields={initialFields}
      handles={handles}
      className="api-request-node"
      renderContent={(fields, handleChange) => (
        <>
          <div className="node-field">
            <label>
              Method:
              <select
                value={fields.method}
                onChange={(e) => handleChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>
          </div>
          <div className="node-field">
            <label>
              URL:
              <input
                type="text"
                value={fields.url}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </>
      )}
    />
  );
};
