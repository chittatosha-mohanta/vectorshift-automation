import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const PromptNode = ({ id, data }) => {
  const initialFields = {
    promptText: data?.promptText || ''
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-system`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-output`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="Prompt Template"
      initialFields={initialFields}
      handles={handles}
      className="prompt-node"
      renderContent={(fields, handleChange) => (
        <div className="node-field">
          <label>
            Template:
            <textarea
              value={fields.promptText}
              onChange={(e) => handleChange('promptText', e.target.value)}
              placeholder="Enter prompt template..."
              rows={2}
            />
          </label>
        </div>
      )}
    />
  );
};
