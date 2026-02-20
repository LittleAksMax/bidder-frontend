import { FC, useState, useEffect } from 'react';
import { TerminalRuleNode } from '../../api/types';
import DeleteButton from '../buttons/DeleteButton';
import { useEditorDispatch } from '../Rules/EditorContext';
import { ReadonlyPath } from '../Rules/treeUtils';

interface TerminalNodeProps {
  node: TerminalRuleNode;
  path: ReadonlyPath;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TerminalNode: FC<TerminalNodeProps> = ({ node, path, onEdit, onDelete }) => {
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

  // Future: Add operation type toggle handler
  // const handleOpTypeToggle = () => {
  //   const newOpType = opType === 'add' ? 'mul' : 'add';
  //   setOpType(newOpType);
  //   dispatch({
  //     type: 'update_node',
  //     path,
  //     patch: {
  //       op: {
  //         type: newOpType,
  //         amount: {
  //           neg: isNegative,
  //           perc: isPercentage,
  //           amount: amount,
  //         },
  //       },
  //     },
  //   });
  // };

  const operationColor = isNegative ? 'red' : 'green';
  const holographicHint = `{= ${isNegative ? '-' : '+'}${amount}${isPercentage ? '%' : ''} }`;

  return (
    <div
      style={{
        border: '1px solid #bbb',
        borderRadius: 8,
        padding: 12,
        margin: '0.5rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            color: operationColor,
            cursor: 'pointer',
            width: '0.5em',
          }}
          onClick={handleNegativeToggle}
        >
          {/* ndash looks similar in width to the + */}
          {isNegative ? <span>&ndash;</span> : '+'}
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
          style={{ width: 60 }}
        />
        <span
          style={{
            color: isPercentage ? 'blue' : 'gray',
            cursor: 'pointer',
          }}
          onClick={handlePercentageToggle}
        >
          %
        </span>
        <code style={{ color: '#aaa', fontStyle: 'italic' }}>{holographicHint}</code>
      </div>
      <DeleteButton onClick={() => dispatch({ type: 'set_slot', path, value: null })} />
    </div>
  );
};
