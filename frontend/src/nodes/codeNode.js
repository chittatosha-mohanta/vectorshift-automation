import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const CodeNode = ({ id, data }) => {
  const initialFields = {
    code: data?.code || '// type code here',
    language: data?.language || 'JavaScript'
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-result`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="Code Executor"
      initialFields={initialFields}
      handles={handles}
      className="code-node"
      renderContent={(fields, handleChange) => (
        <>
          <div className="node-field">
            <label>
              Language:
              <select
                value={fields.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
              </select>
            </label>
          </div>
          <div className="node-field">
            <label>
              Code:
              <textarea
                value={fields.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="// your code here"
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
