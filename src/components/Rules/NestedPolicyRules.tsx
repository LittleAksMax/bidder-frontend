import { FC, useEffect, useState } from 'react';
import { VARIABLE_TYPES } from '../../api/nestedpolicy.types';
import {
  BranchNode,
  ConditionNode as ConvertConditionNode,
  Metric,
  MetricType,
  Node,
  Operator,
  TerminalNode as ConvertTerminalNode,
} from '../../api/types';
import { gradientColors } from './rulesUtil';
import CreateButton from '../buttons/CreateButton';
import DeleteButton from '../buttons/DeleteButton';
import './styles/NestedPolicyRules.css';
import './styles/RuleNodes.css';

interface NestedPolicyRulesProps {
  onSlotsFilledChange: (filled: boolean) => void;
  onRuleChange: (nextRule: Node | null) => void;
  rule: Node | null;
}

interface NodeEditorProps {
  node: Node | null;
  depth: number;
  onChange: (nextNode: Node | null) => void;
}

interface ConditionEditorProps {
  node: ConvertConditionNode;
  depth: number;
  onChange: (nextNode: ConvertConditionNode) => void;
  onDelete: () => void;
}

interface TerminalEditorProps {
  node: ConvertTerminalNode;
  onChange: (nextNode: ConvertTerminalNode) => void;
  onDelete: () => void;
}

const DEFAULT_METRIC = VARIABLE_TYPES[0]!.value as Metric;
const OPERATOR_CYCLE: Operator[] = ['+', '-', '='];
const METRIC_LABELS: Record<Metric, string> = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  orders: 'Orders',
  roas: 'RoaS',
  acos: 'ACoS',
  cpc: 'CPC',
  ctr: 'CTR',
  sales: 'Sales',
  spend: 'Spend',
};

const createEmptyNode = (): Node => ({});

const createEmptyBranch = (): BranchNode => ({
  lower: 0,
  upper: 0,
  node: createEmptyNode(),
});

const createEmptyCondition = (): ConvertConditionNode => ({
  metric: DEFAULT_METRIC,
  type: getMetricType(DEFAULT_METRIC),
  branches: [createEmptyBranch()],
  default: null,
});

const createEmptyTerminal = (): ConvertTerminalNode => ({
  operator: '+',
  amount: 0,
  percentage: false,
});

const isNodeEmpty = (node: Node | null | undefined): boolean =>
  !node || (!node.condition && !node.terminal);

const isIntegerMetric = (metric: Metric): boolean =>
  metric === 'orders' || metric === 'impressions' || metric === 'clicks';

const isDecimalMetric = (metric: Metric): boolean => !isIntegerMetric(metric);

const getMetricType = (metric: Metric): MetricType =>
  isDecimalMetric(metric) ? 'decimal' : 'integer';

const clampToNonNegative = (value: number): number => Math.max(0, value);

const normaliseBoundValue = (value: number, metricType: MetricType): number =>
  metricType === 'integer'
    ? clampToNonNegative(Math.round(value))
    : clampToNonNegative(Math.round(value * 100) / 100);

const normaliseAmountValue = (value: number): number =>
  clampToNonNegative(Math.round(value * 100) / 100);

const parseNumberInputValue = (value: string, metricType: MetricType): number => {
  const parsedValue =
    metricType === 'integer' ? Number.parseInt(value || '0', 10) : Number.parseFloat(value || '0');

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return normaliseBoundValue(parsedValue, metricType);
};

const getBoundStep = (metricType: MetricType): number => (metricType === 'decimal' ? 0.01 : 1);

const getDepthClassName = (depth: number): string => {
  const maxIndex = gradientColors.length - 1;
  return `condition-node-depth-${Math.min(depth, maxIndex)}`;
};

const TERMINAL_DELETE_CONFIRMATION = {
  title: 'Delete terminal action?',
  body: 'This will remove this terminal action.',
};

const CONDITION_DELETE_CONFIRMATION = {
  title: 'Delete condition?',
  body: 'This will remove this condition and any nested rules beneath it.',
};

const BRANCH_DELETE_CONFIRMATION = {
  title: 'Delete branch?',
  body: 'This will remove this branch and any nested rule attached to it.',
};

const normaliseOperatorValue = (value: unknown): Operator => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    const operator = String.fromCharCode(value) as Operator;
    return OPERATOR_CYCLE.includes(operator) ? operator : '+';
  }

  return OPERATOR_CYCLE.includes(value as Operator) ? (value as Operator) : '+';
};

const areIntervalsValid = (branch: BranchNode): boolean => {
  if (branch.lower !== null && branch.lower !== undefined && !Number.isFinite(branch.lower)) {
    return false;
  }

  if (branch.upper !== null && branch.upper !== undefined && !Number.isFinite(branch.upper)) {
    return false;
  }

  if (
    branch.lower !== null &&
    branch.lower !== undefined &&
    branch.upper !== null &&
    branch.upper !== undefined
  ) {
    return branch.lower <= branch.upper;
  }

  return true;
};

const areAllSlotsFilled = (node: Node | null): boolean => {
  if (isNodeEmpty(node)) {
    return false;
  }

  if (node?.terminal) {
    return OPERATOR_CYCLE.includes(node.terminal.operator) && Number.isFinite(node.terminal.amount);
  }

  if (!node?.condition) {
    return false;
  }

  return (
    node.condition.branches.length > 0 &&
    node.condition.branches.every(
      (branch) => areIntervalsValid(branch) && areAllSlotsFilled(branch.node ?? null),
    ) &&
    (node.condition.default == null || areAllSlotsFilled(node.condition.default))
  );
};

const getMetricLabel = (metric: Metric): string => METRIC_LABELS[metric];

const EmptyNodeSlot: FC<{ onAddCondition: () => void; onAddTerminal: () => void }> = ({
  onAddCondition,
  onAddTerminal,
}) => (
  <div className="empty-slot-root">
    <div className="empty-slot-action">
      <CreateButton onClick={onAddCondition} />
      <span className="empty-slot-label">Add Condition</span>
    </div>
    <div className="empty-slot-action">
      <CreateButton onClick={onAddTerminal} />
      <span className="empty-slot-label">Add Terminal</span>
    </div>
  </div>
);

const TerminalEditor: FC<TerminalEditorProps> = ({ node, onChange, onDelete }) => {
  const [operator, setOperator] = useState<Operator>(
    normaliseOperatorValue(node.operator as unknown),
  );
  const [amount, setAmount] = useState<number>(node.amount);
  const [percentage, setPercentage] = useState<boolean>(node.percentage);

  useEffect(() => {
    const nextOperator = normaliseOperatorValue(node.operator as unknown);
    const nextAmount = normaliseAmountValue(node.amount);
    const nextPercentage = nextOperator === '=' ? false : node.percentage;

    setOperator(nextOperator);
    setAmount(nextAmount);
    setPercentage(nextPercentage);

    if (
      nextOperator !== node.operator ||
      nextAmount !== node.amount ||
      nextPercentage !== node.percentage
    ) {
      onChange({
        operator: nextOperator,
        amount: nextAmount,
        percentage: nextPercentage,
      });
    }
  }, [node, onChange]);

  const updateNode = (
    nextOperator: Operator,
    nextAmount: number,
    nextPercentage: boolean,
  ): void => {
    onChange({
      operator: nextOperator,
      amount: nextAmount,
      percentage: nextPercentage,
    });
  };

  const handleOperatorToggle = (): void => {
    const currentIndex = OPERATOR_CYCLE.indexOf(operator);
    const nextOperator = OPERATOR_CYCLE[(currentIndex + 1) % OPERATOR_CYCLE.length]!;
    const nextPercentage = nextOperator === '=' ? false : percentage;
    setOperator(nextOperator);
    setPercentage(nextPercentage);
    updateNode(nextOperator, amount, nextPercentage);
  };

  const handleAmountChange = (nextAmountValue: string): void => {
    const nextAmount = Number.parseFloat(nextAmountValue || '0');
    const resolvedAmount = Number.isFinite(nextAmount) ? normaliseAmountValue(nextAmount) : 0;
    setAmount(resolvedAmount);
    updateNode(operator, resolvedAmount, operator === '=' ? false : percentage);
  };

  const handlePercentageToggle = (): void => {
    if (operator === '=') {
      return;
    }

    const nextPercentage = !percentage;
    setPercentage(nextPercentage);
    updateNode(operator, amount, nextPercentage);
  };

  const operatorClassName =
    operator === '+'
      ? 'terminal-node-sign-positive'
      : operator === '-'
        ? 'terminal-node-sign-negative'
        : 'terminal-node-sign-neutral';

  const showPercentage = operator !== '=' && percentage;
  const holographicHint = `{= ${operator}${amount}${showPercentage ? '%' : ''} }`;

  return (
    <div className="terminal-node">
      <div className="terminal-node-controls">
        <span
          className={`terminal-node-sign ${operatorClassName}`}
          onClick={handleOperatorToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOperatorToggle();
            }
          }}
        >
          {operator}
        </span>
        <input
          type="number"
          value={amount}
          onChange={(event) => handleAmountChange(event.target.value)}
          className="terminal-node-amount-input"
          min={0}
          step={0.01}
        />
        {operator !== '=' ? (
          <span
            className={`terminal-node-percent ${percentage ? 'terminal-node-percent-on' : 'terminal-node-percent-off'}`}
            onClick={handlePercentageToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handlePercentageToggle();
              }
            }}
          >
            %
          </span>
        ) : null}
        <code className="terminal-node-hint">{holographicHint}</code>
      </div>
      <DeleteButton onClick={onDelete} confirmation={TERMINAL_DELETE_CONFIRMATION} />
    </div>
  );
};

const NodeEditor: FC<NodeEditorProps> = ({ node, depth, onChange }) => {
  if (isNodeEmpty(node)) {
    return (
      <EmptyNodeSlot
        onAddCondition={() => onChange({ condition: createEmptyCondition() })}
        onAddTerminal={() => onChange({ terminal: createEmptyTerminal() })}
      />
    );
  }

  if (node?.condition) {
    return (
      <ConditionEditor
        node={node.condition}
        depth={depth}
        onChange={(nextCondition) => onChange({ condition: nextCondition })}
        onDelete={() => onChange(null)}
      />
    );
  }

  if (node?.terminal) {
    return (
      <TerminalEditor
        node={node.terminal}
        onChange={(nextTerminal) => onChange({ terminal: nextTerminal })}
        onDelete={() => onChange(null)}
      />
    );
  }

  return null;
};

const ConditionEditor: FC<ConditionEditorProps> = ({ node, depth, onChange, onDelete }) => {
  const metricType = getMetricType(node.metric);
  const boundStep = getBoundStep(metricType);

  const updateBranch = (branchIndex: number, nextBranch: BranchNode): void => {
    onChange({
      ...node,
      branches: node.branches.map((branch, index) => (index === branchIndex ? nextBranch : branch)),
    });
  };

  const handleMetricChange = (nextMetric: Metric): void => {
    const nextMetricType = getMetricType(nextMetric);

    onChange({
      ...node,
      metric: nextMetric,
      type: nextMetricType,
      branches: node.branches.map((branch) => ({
        ...branch,
        lower:
          branch.lower === null || branch.lower === undefined
            ? null
            : normaliseBoundValue(branch.lower, nextMetricType),
        upper:
          branch.upper === null || branch.upper === undefined
            ? null
            : normaliseBoundValue(branch.upper, nextMetricType),
      })),
    });
  };

  const handleBoundToggle = (
    branchIndex: number,
    bound: 'lower' | 'upper',
    isUnbounded: boolean,
  ): void => {
    const branch = node.branches[branchIndex]!;
    const nextValue = isUnbounded ? null : 0;

    updateBranch(branchIndex, {
      ...branch,
      [bound]: nextValue,
    });
  };

  const handleBoundValueChange = (
    branchIndex: number,
    bound: 'lower' | 'upper',
    rawValue: string,
  ): void => {
    const branch = node.branches[branchIndex]!;
    updateBranch(branchIndex, {
      ...branch,
      [bound]: parseNumberInputValue(rawValue, metricType),
    });
  };

  const handleAddBranch = (): void => {
    onChange({
      ...node,
      branches: [...node.branches, createEmptyBranch()],
    });
  };

  const handleDeleteBranch = (branchIndex: number): void => {
    onChange({
      ...node,
      branches: node.branches.filter((_, index) => index !== branchIndex),
    });
  };

  const handleDefaultToggle = (enabled: boolean): void => {
    onChange({
      ...node,
      default: enabled ? createEmptyNode() : null,
    });
  };

  return (
    <div className={`condition-node ${getDepthClassName(depth)}`}>
      <div className="condition-node-header">
        <div className="condition-node-header-row">
          <div className="condition-node-header-main condition-node-header-main-wrap">
            <span>
              <strong>Evaluate</strong>
            </span>
            <select
              value={node.metric}
              className="condition-node-variable-select"
              onChange={(event) => handleMetricChange(event.target.value as Metric)}
            >
              {VARIABLE_TYPES.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {getMetricLabel(metric.value as Metric)}
                </option>
              ))}
            </select>
          </div>
          <DeleteButton onClick={onDelete} confirmation={CONDITION_DELETE_CONFIRMATION} />
        </div>
      </div>

      {node.branches.map((branch, branchIndex) => {
        const lowerUnbounded = branch.lower === null || branch.lower === undefined;
        const upperUnbounded = branch.upper === null || branch.upper === undefined;
        const branchLabel = 'If';

        return (
          <div
            key={`branch-${branchIndex}`}
            className={
              branchIndex === node.branches.length - 1
                ? 'condition-node-section-last'
                : 'condition-node-section'
            }
          >
            <hr className="condition-node-divider" />
            <div className="condition-node-branch-header">
              <span className="condition-node-branch-heading">
                <em>{branchLabel}</em>
              </span>
              <div className="condition-node-interval-controls">
                <label className="condition-node-bound-toggle">
                  <input
                    type="checkbox"
                    checked={lowerUnbounded}
                    aria-label="Toggle lower bound"
                    title="Toggle lower bound"
                    onChange={(event) =>
                      handleBoundToggle(branchIndex, 'lower', event.target.checked)
                    }
                  />
                </label>
                <input
                  type="number"
                  className="condition-node-number-input condition-node-interval-input"
                  value={branch.lower ?? ''}
                  disabled={lowerUnbounded}
                  min={0}
                  step={boundStep}
                  onChange={(event) =>
                    handleBoundValueChange(branchIndex, 'lower', event.target.value)
                  }
                />
                <span>&le;</span>
                <span className="condition-node-metric-badge">{getMetricLabel(node.metric)}</span>
                <span>&le;</span>
                <input
                  type="number"
                  className="condition-node-number-input condition-node-interval-input"
                  value={branch.upper ?? ''}
                  disabled={upperUnbounded}
                  min={0}
                  step={boundStep}
                  onChange={(event) =>
                    handleBoundValueChange(branchIndex, 'upper', event.target.value)
                  }
                />
                <label className="condition-node-bound-toggle">
                  <input
                    type="checkbox"
                    checked={upperUnbounded}
                    aria-label="Toggle upper bound"
                    title="Toggle upper bound"
                    onChange={(event) =>
                      handleBoundToggle(branchIndex, 'upper', event.target.checked)
                    }
                  />
                </label>
              </div>
              <DeleteButton
                onClick={() => handleDeleteBranch(branchIndex)}
                disabled={node.branches.length === 1}
                confirmation={BRANCH_DELETE_CONFIRMATION}
              />
            </div>
            <NodeEditor
              node={branch.node ?? null}
              depth={depth + 1}
              onChange={(nextNode) =>
                updateBranch(branchIndex, {
                  ...branch,
                  node: nextNode ?? createEmptyNode(),
                })
              }
            />
          </div>
        );
      })}

      <div className="condition-node-branch-actions">
        <CreateButton onClick={handleAddBranch} />
        <span>Add Branch</span>
      </div>

      <label className="condition-node-default-toggle">
        <input
          type="checkbox"
          checked={node.default != null}
          aria-label="Toggle default branch"
          title="Toggle default branch"
          onChange={(event) => handleDefaultToggle(event.target.checked)}
        />
        <span>Add Default?</span>
      </label>

      {node.default != null ? (
        <div className="condition-node-section-last">
          <hr className="condition-node-divider" />
          <div className="condition-node-branch-header">
            <span className="condition-node-branch-heading">
              <em>Default</em>
            </span>
          </div>
          <NodeEditor
            node={node.default}
            depth={depth + 1}
            onChange={(nextNode) =>
              onChange({
                ...node,
                default: nextNode,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
};

export const NestedPolicyRules: FC<NestedPolicyRulesProps> = ({
  onSlotsFilledChange,
  onRuleChange,
  rule,
}) => {
  useEffect(() => {
    onSlotsFilledChange(areAllSlotsFilled(rule));
  }, [onSlotsFilledChange, rule]);

  return (
    <div className="nested-policy-rules">
      <NodeEditor node={rule} depth={0} onChange={(nextRule) => onRuleChange(nextRule)} />
    </div>
  );
};

export default NestedPolicyRules;
