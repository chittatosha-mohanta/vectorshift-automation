import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const TextNode = ({ id, data }) => {
  const initialFields = {
    text: data?.text || '{{input}}'
  };

  const getHandles = (fields) => {
    const text = fields.text || '';
    // Find all valid JS variable names wrapped in {{ ... }}
    const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = [...text.matchAll(variableRegex)];
    const variables = [...new Set(matches.map((m) => m[1]))];

    // Map variables to left-side handles
    const dynamicHandles = variables.map((variable, idx) => {
      const topPercent = variables.length === 1
        ? 50
        : 20 + (idx * 60) / (variables.length - 1);

      return {
        type: 'target',
        position: Position.Left,
        id: `${id}-${variable}`,
        style: { top: `${topPercent}%` }
      };
    });

    return [
      ...dynamicHandles,
      {
        type: 'source',
        position: Position.Right,
        id: `${id}-output`
      }
    ];
  };

  const getStyle = (fields) => {
    const text = fields.text || '';
    const lines = text.split('\n');
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
    const width = Math.max(220, Math.min(500, longestLine * 8 + 48));
    const height = Math.max(80, Math.min(400, lines.length * 18 + 70));
    return { width, minHeight: height };
  };

  return (
    <CustomNode
      id={id}
      data={data}
      title="Text"
      initialFields={initialFields}
      handles={getHandles}
      style={getStyle}
      className="text-node"
      renderContent={(fields, handleChange) => (
        <div className="node-field">
          <label>
            Text:
            <textarea
              value={fields.text}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Type text with {{variables}}..."
              style={{
                height: 'auto',
                minHeight: '40px',
                fontFamily: 'monospace'
              }}
            />
          </label>
        </div>
      )}
    />
  );
};
