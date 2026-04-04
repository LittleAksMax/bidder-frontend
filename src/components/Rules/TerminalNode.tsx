import { FC, useState, useEffect } from 'react';
import { TerminalRuleNode } from '../../api/nestedpolicy.types';
import DeleteButton from '../buttons/DeleteButton';
import { useEditorDispatch } from '../Rules/EditorContext';
import { ReadonlyPath } from '../Rules/treeUtils';
import './styles/RuleNodes.css';

interface TerminalNodeProps {
  node: TerminalRuleNode;
  path: ReadonlyPath;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TerminalNode: FC<TerminalNodeProps> = ({ node, path }) => {
  const [opType, setOpType] = useState<'add' | 'mul'>(node.op.type as 'add' | 'mul');
  const [isPercentage, setIsPercentage] = useState(node.op.amount.perc);
  const [isNegative, setIsNegative] = useState(node.op.amount.neg);
  const [amount, setAmount] = useState(node.op.amount.amount);

  const dispatch = useEditorDispatch();

  // Sync state when node changes (for editing existing policies)
  useEffect(() => {
    setOpType(node.op.type as 'add' | 'mul');
    setIsPercentage(node.op.amount.perc);
    setIsNegative(node.op.amount.neg);
    setAmount(node.op.amount.amount);
  }, [node]);

  const handlePercentageToggle = () => {
    const newIsPercentage = !isPercentage;
    setIsPercentage(newIsPercentage);
    dispatch({
      type: 'update_node',
      path,
      patch: {
        op: {
          type: opType,
          amount: {
            neg: isNegative,
            perc: newIsPercentage,
            amount: amount,
          },
        },
      },
    });
  };

  const handleNegativeToggle = () => {
    const newIsNegative = !isNegative;
    setIsNegative(newIsNegative);
    dispatch({
      type: 'update_node',
      path,
      patch: {
        op: {
          type: opType,
          amount: {
            neg: newIsNegative,
            perc: isPercentage,
            amount: amount,
          },
        },
      },
    });
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    dispatch({
      type: 'update_node',
      path,
      patch: {
        op: {
          type: opType,
          amount: {
            neg: isNegative,
            perc: isPercentage,
            amount: newAmount,
          },
        },
      },
    });
  };

  const holographicHint = `{= ${isNegative ? '-' : '+'}${amount}${isPercentage ? '%' : ''} }`;

  return (
    <div className="terminal-node">
      <div className="terminal-node-controls">
        <span
          className={`terminal-node-sign ${isNegative ? 'terminal-node-sign-negative' : 'terminal-node-sign-positive'}`}
          onClick={handleNegativeToggle}
        >
          {isNegative ? <span>&ndash;</span> : '+'}
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
          className="terminal-node-amount-input"
        />
        <span
          className={`terminal-node-percent ${isPercentage ? 'terminal-node-percent-on' : 'terminal-node-percent-off'}`}
          onClick={handlePercentageToggle}
        >
          %
        </span>
        <code className="terminal-node-hint">{holographicHint}</code>
      </div>
      <DeleteButton
        onClick={() => dispatch({ type: 'set_slot', path, value: null })}
        confirmation={{
          title: 'Delete terminal action?',
          body: 'This will remove this terminal action.',
        }}
      />
    </div>
  );
};
