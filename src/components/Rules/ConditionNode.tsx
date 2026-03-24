import { FC } from 'react';
import { ConditionRuleNode, VARIABLE_TYPES, VariableType } from '../../api/types';
import Slot from './Slot';
import { gradientColors, isPercentageVariable, defaultVariableRanges } from './rulesUtil';
import DeleteButton from '../buttons/DeleteButton';
import { useEditorDispatch } from '../Rules/EditorContext';
import { Path } from './treeUtils';
import './styles/RuleNodes.css';

interface ConditionNodeProps {
  node: ConditionRuleNode;
  path: Path;
  usedVars: Set<VariableType>;
  onVariableChange: (variable: VariableType) => void;
  onRangeChange: (range: { min: number; max: number }) => void;
}

const getDepthClassName = (depth: number): string => {
  const maxIndex = gradientColors.length - 1;
  const index = Math.min(depth, maxIndex);
  return `condition-node-depth-${index}`;
};

export const ConditionNode: FC<ConditionNodeProps> = ({
  node,
  path,
  usedVars,
  onVariableChange,
  onRangeChange,
}) => {
  const depth = path.length;
  const depthClassName = getDepthClassName(depth);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(0, parseInt(e.target.value || '0', 10));
    const newMax = Math.max(newMin, node.max);
    onRangeChange({ min: newMin, max: newMax });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(0, parseInt(e.target.value || '0', 10));
    const newMin = Math.min(newMax, node.min);
    onRangeChange({ min: newMin, max: newMax });
  };

  const handleVariableChange = (variable: VariableType) => {
    const defaults = defaultVariableRanges[variable] || { min: 0, max: 100 };
    onVariableChange(variable);
    onRangeChange({ min: defaults.min, max: defaults.max });
  };

  const dispatch = useEditorDispatch();

  return (
    <div className={`condition-node ${depthClassName}`}>
      <div className="condition-node-header">
        <div className="condition-node-header-row">
          <div className="condition-node-header-main">
            <span>
              <strong>If</strong>
            </span>
            <input
              type="number"
              value={node.min}
              className="condition-node-number-input"
              onChange={handleMinChange}
            />
            {isPercentageVariable(node.variable) && <span>%</span>}
            <span>&le;</span>
            <select
              value={node.variable}
              className="condition-node-variable-select"
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
              className="condition-node-number-input"
              onChange={handleMaxChange}
            />
            {isPercentageVariable(node.variable) && <span>%</span>}
          </div>
          <DeleteButton onClick={() => dispatch({ type: 'set_slot', path, value: null })} />
        </div>
      </div>
      <div className="condition-node-section">
        <hr className="condition-node-divider" />
        <span className="condition-node-branch-label">
          <em>Then:</em>
        </span>
        <Slot path={[...path, 'if']} />
      </div>
      <div className="condition-node-section-last">
        <hr className="condition-node-divider" />
        <span className="condition-node-branch-label">
          <em>Otherwise:</em>
        </span>
        <Slot path={[...path, 'else']} />
      </div>
    </div>
  );
};
