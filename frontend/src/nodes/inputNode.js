import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const InputNode = ({ id, data }) => {
  const initialFields = {
    inputName: id.replace('customInput-', 'input_'),
    inputType: 'Text'
  };

  const handles = [
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-value`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="Input"
      initialFields={initialFields}
      handles={handles}
      className="input-node"
      renderContent={(fields, handleChange) => (
        <>
          <div className="node-field">
            <label>
              Name:
              <input
                type="text"
                value={fields.inputName}
                onChange={(e) => handleChange('inputName', e.target.value)}
              />
            </label>
          </div>
          <div className="node-field">
            <label>
              Type:
              <select
                value={fields.inputType}
                onChange={(e) => handleChange('inputType', e.target.value)}
              >
                <option value="Text">Text</option>
                <option value="File">File</option>
              </select>
            </label>
          </div>
        </>
      )}
    />
  );
};


