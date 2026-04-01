import { FC, useEffect } from 'react';
import { VARIABLE_TYPES } from '../../api/types';
import {
  BranchNode,
  ConditionNode as ConvertConditionNode,
  Metric,
  MetricType,
  Node,
  Operator,
  TerminalNode as ConvertTerminalNode,
} from '../../api/convert.types';
import { gradientColors } from './rulesUtil';
import CreateButton from '../buttons/CreateButton';
import DeleteButton from '../buttons/DeleteButton';
import './styles/DecisionGraphPolicyRules.css';
import './styles/RuleNodes.css';

interface DecisionGraphPolicyRulesProps {
  onSlotsFilledChange: (filled: boolean) => void;
  onRuleChange: (nextRule: Node | null) => void;
  rule: Node | null;
}

type GraphPathSegment = { kind: 'branch'; index: number } | { kind: 'default' };
type GraphPath = ReadonlyArray<GraphPathSegment>;

interface GraphEntry {
  depth: number;
  incomingLabel: string | null;
  node: Node | null;
  path: GraphPath;
}

interface EmptyGraphNodeProps {
  onAddCondition: () => void;
  onAddTerminal: () => void;
}

interface DecisionGraphTerminalCardProps {
  node: ConvertTerminalNode;
  onChange: (nextNode: ConvertTerminalNode) => void;
  onDelete: () => void;
}

interface GraphBranchEditorProps {
  branch: BranchNode;
  metric: Metric;
  onChange: (nextBranch: BranchNode) => void;
  onCreateConditionChild: () => void;
  onCreateTerminalChild: () => void;
  onDelete: () => void;
  disableDelete: boolean;
}

interface DecisionGraphMetricCardProps {
  depth: number;
  isRoot: boolean;
  node: ConvertConditionNode;
  onChange: (nextNode: ConvertConditionNode) => void;
  onCreateBranchCondition: (branchIndex: number) => void;
  onCreateBranchTerminal: (branchIndex: number) => void;
  onCreateDefaultCondition: () => void;
  onCreateDefaultTerminal: () => void;
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

const formatBoundLabel = (value: number | null | undefined, metricType: MetricType): string => {
  if (value === null || value === undefined) {
    return 'inf';
  }

  return metricType === 'integer'
    ? `${Math.round(value)}`
    : `${normaliseBoundValue(value, metricType).toFixed(2)}`;
};

const formatBranchLabel = (metric: Metric, branch: BranchNode): string => {
  const metricType = getMetricType(metric);
  const lower = branch.lower === null || branch.lower === undefined ? '-inf' : formatBoundLabel(branch.lower, metricType);
  const upper = formatBoundLabel(branch.upper, metricType);
  return `${getMetricLabel(metric)} [${lower}, ${upper}]`;
};

const getNodeAtPath = (root: Node | null, path: GraphPath): Node | null => {
  let currentNode = root;

  for (const segment of path) {
    if (!currentNode?.condition) {
      return null;
    }

    if (segment.kind === 'default') {
      currentNode = currentNode.condition.default ?? null;
      continue;
    }

    currentNode = currentNode.condition.branches[segment.index]?.node ?? null;
  }

  return currentNode;
};

const replaceNodeAtPath = (root: Node | null, path: GraphPath, nextNode: Node | null): Node | null => {
  if (path.length === 0) {
    return nextNode;
  }

  if (!root?.condition) {
    return root;
  }

  const head = path[0]!;
  const rest = path.slice(1);

  if (head.kind === 'default') {
    return {
      condition: {
        ...root.condition,
        default: replaceNodeAtPath(root.condition.default ?? null, rest, nextNode),
      },
    };
  }

  return {
    condition: {
      ...root.condition,
      branches: root.condition.branches.map((branch, index) =>
        head.kind === 'branch' && index === head.index
          ? {
              ...branch,
              node:
                replaceNodeAtPath(branch.node ?? createEmptyNode(), rest, nextNode) ??
                createEmptyNode(),
            }
          : branch,
      ),
    },
  };
};

const removeNodeAtPath = (root: Node | null, path: GraphPath): Node | null => {
  if (path.length === 0) {
    return null;
  }

  const parentPath = path.slice(0, -1);
  const parentNode = getNodeAtPath(root, parentPath);

  if (!parentNode?.condition) {
    return root;
  }

  const lastSegment = path[path.length - 1]!;

  if (lastSegment.kind === 'default') {
    return replaceNodeAtPath(root, parentPath, {
      condition: {
        ...parentNode.condition,
        default: null,
      },
    });
  }

  return replaceNodeAtPath(root, parentPath, {
    condition: {
      ...parentNode.condition,
      branches: parentNode.condition.branches.map((branch, index) =>
        index === lastSegment.index ? { ...branch, node: createEmptyNode() } : branch,
      ),
    },
  });
};

const collectGraphEntries = (
  node: Node | null,
  path: GraphPath,
  depth: number,
  incomingLabel: string | null,
  result: GraphEntry[],
): void => {
  result.push({
    depth,
    incomingLabel,
    node,
    path,
  });

  if (!node?.condition) {
    return;
  }

  node.condition.branches.forEach((branch, index) => {
    collectGraphEntries(
      branch.node ?? null,
      [...path, { kind: 'branch', index }],
      depth + 1,
      formatBranchLabel(node.condition!.metric, branch),
      result,
    );
  });

  if (node.condition.default != null) {
    collectGraphEntries(
      node.condition.default,
      [...path, { kind: 'default' }],
      depth + 1,
      'Default',
      result,
    );
  }
};

const buildGraphColumns = (root: Node | null): GraphEntry[][] => {
  const entries: GraphEntry[] = [];
  collectGraphEntries(root, [], 0, null, entries);

  const columns: GraphEntry[][] = [];
  entries.forEach((entry) => {
    if (!columns[entry.depth]) {
      columns[entry.depth] = [];
    }
    columns[entry.depth]!.push(entry);
  });

  return columns;
};

const EmptyGraphNode: FC<EmptyGraphNodeProps> = ({ onAddCondition, onAddTerminal }) => (
  <div className="decision-graph-empty-node">
    <div className="empty-slot-root">
      <div className="empty-slot-action">
        <CreateButton onClick={onAddCondition} />
        <span className="empty-slot-label">Metric Node</span>
      </div>
      <div className="empty-slot-action">
        <CreateButton onClick={onAddTerminal} />
        <span className="empty-slot-label">Terminal Node</span>
      </div>
    </div>
  </div>
);

const DecisionGraphTerminalCard: FC<DecisionGraphTerminalCardProps> = ({
  node,
  onChange,
  onDelete,
}) => {
  const operator = normaliseOperatorValue(node.operator as unknown);
  const amount = normaliseAmountValue(node.amount);
  const percentage = operator === '=' ? false : node.percentage;

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
    updateNode(nextOperator, amount, nextOperator === '=' ? false : percentage);
  };

  const handleAmountChange = (nextAmountValue: string): void => {
    const nextAmount = Number.parseFloat(nextAmountValue || '0');
    const resolvedAmount = Number.isFinite(nextAmount) ? normaliseAmountValue(nextAmount) : 0;
    updateNode(operator, resolvedAmount, operator === '=' ? false : percentage);
  };

  const handlePercentageToggle = (): void => {
    if (operator === '=') {
      return;
    }

    updateNode(operator, amount, !percentage);
  };

  const operatorClassName =
    operator === '+'
      ? 'terminal-node-sign-positive'
      : operator === '-'
        ? 'terminal-node-sign-negative'
        : 'terminal-node-sign-neutral';

  const holographicHint = `{= ${operator}${amount}${percentage ? '%' : ''} }`;

  return (
    <div className="terminal-node decision-graph-terminal-card">
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
      <DeleteButton onClick={onDelete} />
    </div>
  );
};

const GraphBranchEditor: FC<GraphBranchEditorProps> = ({
  branch,
  metric,
  onChange,
  onCreateConditionChild,
  onCreateTerminalChild,
  onDelete,
  disableDelete,
}) => {
  const metricType = getMetricType(metric);
  const boundStep = getBoundStep(metricType);
  const lowerUnbounded = branch.lower === null || branch.lower === undefined;
  const upperUnbounded = branch.upper === null || branch.upper === undefined;
  const childIsEmpty = isNodeEmpty(branch.node);

  const handleBoundToggle = (bound: 'lower' | 'upper', isUnbounded: boolean): void => {
    onChange({
      ...branch,
      [bound]: isUnbounded ? null : 0,
    });
  };

  const handleBoundValueChange = (bound: 'lower' | 'upper', rawValue: string): void => {
    onChange({
      ...branch,
      [bound]: parseNumberInputValue(rawValue, metricType),
    });
  };

  return (
    <div className="decision-graph-branch-row">
      <div className="decision-graph-edge-marker">
        <span className="decision-graph-edge-line" />
        <span className="decision-graph-edge-pill">{formatBranchLabel(metric, branch)}</span>
      </div>
      <div className="condition-node-interval-controls decision-graph-branch-controls">
        <label className="condition-node-bound-toggle">
          <input
            type="checkbox"
            checked={lowerUnbounded}
            aria-label="Toggle lower bound"
            title="Toggle lower bound"
            onChange={(event) => handleBoundToggle('lower', event.target.checked)}
          />
        </label>
        <input
          type="number"
          className="condition-node-number-input condition-node-interval-input"
          value={branch.lower ?? ''}
          disabled={lowerUnbounded}
          min={0}
          step={boundStep}
          onChange={(event) => handleBoundValueChange('lower', event.target.value)}
        />
        <span>&lt;=</span>
        <span className="condition-node-metric-badge">{getMetricLabel(metric)}</span>
        <span>&lt;=</span>
        <input
          type="number"
          className="condition-node-number-input condition-node-interval-input"
          value={branch.upper ?? ''}
          disabled={upperUnbounded}
          min={0}
          step={boundStep}
          onChange={(event) => handleBoundValueChange('upper', event.target.value)}
        />
        <label className="condition-node-bound-toggle">
          <input
            type="checkbox"
            checked={upperUnbounded}
            aria-label="Toggle upper bound"
            title="Toggle upper bound"
            onChange={(event) => handleBoundToggle('upper', event.target.checked)}
          />
        </label>
      </div>
      <div className="decision-graph-branch-actions">
        {childIsEmpty ? (
          <>
            <div className="decision-graph-create-action">
              <CreateButton onClick={onCreateConditionChild} />
              <span>Metric</span>
            </div>
            <div className="decision-graph-create-action">
              <CreateButton onClick={onCreateTerminalChild} />
              <span>Terminal</span>
            </div>
          </>
        ) : (
          <span className="decision-graph-branch-status">Node in next column</span>
        )}
        <DeleteButton onClick={onDelete} disabled={disableDelete} />
      </div>
    </div>
  );
};

const DecisionGraphMetricCard: FC<DecisionGraphMetricCardProps> = ({
  depth,
  isRoot,
  node,
  onChange,
  onCreateBranchCondition,
  onCreateBranchTerminal,
  onCreateDefaultCondition,
  onCreateDefaultTerminal,
  onDelete,
}) => {
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

  const updateBranch = (branchIndex: number, nextBranch: BranchNode): void => {
    onChange({
      ...node,
      branches: node.branches.map((branch, index) => (index === branchIndex ? nextBranch : branch)),
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

  const hasDefault = node.default != null;
  const defaultIsEmpty = isNodeEmpty(node.default);

  return (
    <div className={`condition-node decision-graph-metric-card ${getDepthClassName(depth)}`}>
      <div className="condition-node-header">
        <div className="condition-node-header-row">
          <div className="condition-node-header-main">
            <span className="decision-graph-node-title">Metric</span>
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
          {!isRoot ? <DeleteButton onClick={onDelete} /> : null}
        </div>
      </div>

      <div className="decision-graph-branch-list">
        {node.branches.map((branch, branchIndex) => (
          <GraphBranchEditor
            key={`branch-${branchIndex}`}
            branch={branch}
            metric={node.metric}
            onChange={(nextBranch) => updateBranch(branchIndex, nextBranch)}
            onCreateConditionChild={() => onCreateBranchCondition(branchIndex)}
            onCreateTerminalChild={() => onCreateBranchTerminal(branchIndex)}
            onDelete={() => handleDeleteBranch(branchIndex)}
            disableDelete={node.branches.length === 1}
          />
        ))}
      </div>

      <div className="condition-node-branch-actions decision-graph-node-actions">
        <CreateButton onClick={handleAddBranch} />
        <span>Add Branch</span>
      </div>

      {hasDefault ? (
        <div className="decision-graph-default-row">
          <div className="decision-graph-edge-marker">
            <span className="decision-graph-edge-line" />
            <span className="decision-graph-edge-pill decision-graph-edge-pill-default">Default</span>
          </div>
          <div className="decision-graph-branch-actions">
            {defaultIsEmpty ? (
              <>
                <div className="decision-graph-create-action">
                  <CreateButton onClick={onCreateDefaultCondition} />
                  <span>Metric</span>
                </div>
                <div className="decision-graph-create-action">
                  <CreateButton onClick={onCreateDefaultTerminal} />
                  <span>Terminal</span>
                </div>
              </>
            ) : (
              <span className="decision-graph-branch-status">Node in next column</span>
            )}
            <DeleteButton
              onClick={() =>
                onChange({
                  ...node,
                  default: null,
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="condition-node-default-toggle decision-graph-node-actions">
          <CreateButton
            onClick={() =>
              onChange({
                ...node,
                default: createEmptyNode(),
              })
            }
          />
          <span>Add Default</span>
        </div>
      )}
    </div>
  );
};

export const DecisionGraphPolicyRules: FC<DecisionGraphPolicyRulesProps> = ({
  onSlotsFilledChange,
  onRuleChange,
  rule,
}) => {
  useEffect(() => {
    onSlotsFilledChange(areAllSlotsFilled(rule));
  }, [onSlotsFilledChange, rule]);

  const graphColumns = buildGraphColumns(rule);

  const handleSetNode = (path: GraphPath, nextNode: Node | null): void => {
    onRuleChange(replaceNodeAtPath(rule, path, nextNode));
  };

  const handleCreateNode = (path: GraphPath, type: 'condition' | 'terminal'): void => {
    handleSetNode(
      path,
      type === 'condition' ? { condition: createEmptyCondition() } : { terminal: createEmptyTerminal() },
    );
  };

  return (
    <div className="decision-graph-root">
      <div className="decision-graph-columns">
        {graphColumns.map((column, depth) => (
          <div key={`column-${depth}`} className="decision-graph-column">
            <div className="decision-graph-column-heading">
              {depth === 0 ? 'Root' : `Depth ${depth}`}
            </div>
            {column.map((entry, entryIndex) => {
              const entryKey = `${depth}-${entryIndex}`;
              const isRoot = entry.path.length === 0;

              return (
                <div key={entryKey} className="decision-graph-node-shell">
                  {entry.incomingLabel ? (
                    <div className="decision-graph-incoming-edge">
                      <span className="decision-graph-edge-line" />
                      <span className="decision-graph-edge-pill">{entry.incomingLabel}</span>
                    </div>
                  ) : null}

                  {isNodeEmpty(entry.node) ? (
                    <EmptyGraphNode
                      onAddCondition={() => handleCreateNode(entry.path, 'condition')}
                      onAddTerminal={() => handleCreateNode(entry.path, 'terminal')}
                    />
                  ) : entry.node?.condition ? (
                    <DecisionGraphMetricCard
                      depth={depth}
                      isRoot={isRoot}
                      node={entry.node.condition}
                      onChange={(nextCondition) =>
                        handleSetNode(entry.path, {
                          condition: nextCondition,
                        })
                      }
                      onCreateBranchCondition={(branchIndex) =>
                        handleCreateNode([...entry.path, { kind: 'branch', index: branchIndex }], 'condition')
                      }
                      onCreateBranchTerminal={(branchIndex) =>
                        handleCreateNode([...entry.path, { kind: 'branch', index: branchIndex }], 'terminal')
                      }
                      onCreateDefaultCondition={() =>
                        handleCreateNode([...entry.path, { kind: 'default' }], 'condition')
                      }
                      onCreateDefaultTerminal={() =>
                        handleCreateNode([...entry.path, { kind: 'default' }], 'terminal')
                      }
                      onDelete={() => onRuleChange(removeNodeAtPath(rule, entry.path))}
                    />
                  ) : entry.node?.terminal ? (
                    <DecisionGraphTerminalCard
                      node={entry.node.terminal}
                      onChange={(nextTerminal) =>
                        handleSetNode(entry.path, {
                          terminal: nextTerminal,
                        })
                      }
                      onDelete={() => onRuleChange(removeNodeAtPath(rule, entry.path))}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionGraphPolicyRules;
