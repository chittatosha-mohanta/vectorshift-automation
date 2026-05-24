import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const JsonParseNode = ({ id, data }) => {
  const initialFields = {
    keyPath: data?.keyPath || 'data.result'
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-raw`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-parsed`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="JSON Parser"
      initialFields={initialFields}
      handles={handles}
      className="json-parse-node"
      renderContent={(fields, handleChange) => (
        <div className="node-field">
          <label>
            Key Path:
            <input
              type="text"
              value={fields.keyPath}
              onChange={(e) => handleChange('keyPath', e.target.value)}
              placeholder="e.g. data.items[0]"
            />
          </label>
        </div>
      )}
    />
  );
};
