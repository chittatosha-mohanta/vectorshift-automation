import { Handle } from 'reactflow';

export const BaseNode = ({
  id,
  title,
  icon,
  children,
  handles = [],
  className = '',
  style = {}
}) => {
  return (
    <div className={`base-node ${className}`} style={style}>
      {/* Handles */}
      {handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type}
          position={handle.position}
          id={handle.id || `${id}-${handle.type}-${index}`}
          style={handle.style}
        />
      ))}

      {/* Header */}
      <div className="base-node-header">
        {icon && <span className="base-node-icon">{icon}</span>}
        <span className="base-node-title">{title}</span>
      </div>

      {/* Card Content Body */}
      <div className="base-node-content">
        {children}
      </div>
    </div>
  );
};
