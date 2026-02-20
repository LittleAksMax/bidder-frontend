import { FC, useEffect, useState } from 'react';
import { ConditionRuleNode, VARIABLE_TYPES, VariableType } from '../../api/types';
import Slot from './Slot';
import { gradientColors, isPercentageVariable, defaultVariableRanges } from './rulesUtil';
import DeleteButton from '../buttons/DeleteButton';
import { useEditorDispatch } from '../Rules/EditorContext';
import { Path } from './treeUtils';

interface ConditionNodeProps {
  node: ConditionRuleNode;
  path: Path;
  usedVars: Set<VariableType>;
  onVariableChange: (variable: VariableType) => void;
  onRangeChange: (range: { min: number; max: number }) => void;
}

export const ConditionNode: FC<ConditionNodeProps> = ({
  node,
  path,
  usedVars,
  onVariableChange,
  onRangeChange,
}) => {
  const depth = path.length;
  const backgroundColor = gradientColors[Math.min(depth, gradientColors.length - 1)];

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(0, parseInt(e.target.value || '0', 10)); // Default to 0 if empty
    const newMax = Math.max(newMin, node.max); // Ensure max is at least min
    onRangeChange({ min: newMin, max: newMax });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(0, parseInt(e.target.value || '0', 10)); // Default to 0 if empty
    const newMin = Math.min(newMax, node.min); // Ensure min is not greater than max
    onRangeChange({ min: newMin, max: newMax });
  };

  const handleVariableChange = (variable: VariableType) => {
    const defaults = defaultVariableRanges[variable] || { min: 0, max: 100 };
    onVariableChange(variable);
    onRangeChange({ min: defaults.min, max: defaults.max });
  };

  const dispatch = useEditorDispatch();

  return (
    <div
      style={{
        border: '1px solid #aaa',
        borderRadius: 8,
        padding: 12,
        margin: '0.5rem 0',
        backgroundColor,
      }}
    >
      <div style={{ marginBottom: 8, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              <strong>If</strong>
            </span>
            <input
              type="number"
              value={node.min}
              style={{ width: 80 }}
              onChange={handleMinChange}
            />
            {isPercentageVariable(node.variable) && <span>%</span>}
            <span>&le;</span>
            <select
              value={node.variable}
              style={{ width: '15em' }}
              onChange={(e) => handleVariableChange(e.target.value as VariableType)}
            >
              {VARIABLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <span>&le;</span>
            <input
              type="number"
              value={node.max}
              style={{ width: 80 }}
              onChange={handleMaxChange}
            />
            {isPercentageVariable(node.variable) && <span>%</span>}
          </div>
          <DeleteButton onClick={() => dispatch({ type: 'set_slot', path, value: null })} />
        </div>
      </div>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <hr style={{ border: '1px solid #ccc' }} />
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: backgroundColor,
            padding: '0 8px',
            fontWeight: 500,
          }}
        >
          <em>Then:</em>
        </span>
        <Slot path={[...path, 'if']} />
      </div>
      <div style={{ position: 'relative' }}>
        <hr style={{ border: '1px solid #ccc' }} />
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: backgroundColor,
            padding: '0 8px',
            fontWeight: 500,
          }}
        >
          <em>Otherwise:</em>
        </span>
        <Slot path={[...path, 'else']} />
      </div>
    </div>
  );
};
