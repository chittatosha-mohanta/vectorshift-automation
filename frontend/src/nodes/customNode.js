import { useState, useEffect } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const CustomNode = ({
  id,
  data,
  title,
  icon,
  initialFields = {},
  renderContent,
  handles = [],
  className = "",
  style = {}
}) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();

  // Initialize all local state values in a single object (safe for Hook Rules)
  const [fields, setFields] = useState(() => {
    const initial = {};
    Object.keys(initialFields).forEach((key) => {
      initial[key] = data?.[key] !== undefined ? data[key] : initialFields[key];
    });
    return initial;
  });

  // Sync data updates from external changes (like storage syncs in Zustand) back to local state
  useEffect(() => {
    setFields((prev) => {
      let changed = false;
      const updated = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (data?.[key] !== undefined && data[key] !== prev[key]) {
          updated[key] = data[key];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [data]);

  const handleChange = (field, value) => {
    setFields((prev) => ({
      ...prev,
      [field]: value,
    }));
    updateNodeField(id, field, value);
  };

  // Evaluate dynamic handles and style if they are provided as functions
  const resolvedHandles = typeof handles === 'function' ? handles(fields) : handles;
  const resolvedStyle = typeof style === 'function' ? style(fields) : style;

  // Automatically update ReactFlow internals if dynamic handles change
  const handlesKey = JSON.stringify(resolvedHandles);
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, handlesKey, updateNodeInternals]);

  return (
    <BaseNode
      id={id}
      title={title}
      icon={icon}
      handles={resolvedHandles}
      className={className}
      style={resolvedStyle}
    >
      {renderContent && renderContent(fields, handleChange)}
    </BaseNode>
  );
};


