import { Position } from 'reactflow';
import { CustomNode } from './customNode';

export const OutputNode = ({ id, data }) => {
  const initialFields = {
    outputName: id.replace('customOutput-', 'output_'),
    outputType: 'Text'
  };

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-value`
    }
  ];

  return (
    <CustomNode
      id={id}
      data={data}
      title="Output"
      initialFields={initialFields}
      handles={handles}
      className="output-node"
      renderContent={(fields, handleChange) => (
        <>
          <div className="node-field">
            <label>
              Name:
              <input
                type="text"
                value={fields.outputName}
                onChange={(e) => handleChange('outputName', e.target.value)}
              />
            </label>
          </div>
          <div className="node-field">
            <label>
              Type:
              <select
                value={fields.outputType}
                onChange={(e) => handleChange('outputType', e.target.value)}
              >
                <option value="Text">Text</option>
                <option value="File">Image</option>
              </select>
            </label>
          </div>
        </>
      )}
    />
  );
};
