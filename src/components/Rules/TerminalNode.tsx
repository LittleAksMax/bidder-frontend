import { FC, useState } from 'react';
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
  const [isPercentage, setIsPercentage] = useState(node.op.amount.perc);
  const [isAddition, setIsAddition] = useState(node.op.type === 'add');
  const [amount, setAmount] = useState(node.op.amount.amount);

  const operationColor = isAddition ? 'green' : 'red';
  const holographicHint = `{= ${isAddition ? '+' : '-'}${amount}${isPercentage ? '%' : ''} }`;

  const dispatch = useEditorDispatch();

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
          onClick={() => setIsAddition((prev) => !prev)}
        >
          {/* ndash looks similar in width to the + */}
          {isAddition ? '+' : <span>&ndash;</span>}
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          style={{ width: 60 }}
        />
        <span
          style={{
            color: isPercentage ? 'blue' : 'gray',
            cursor: 'pointer',
          }}
          onClick={() => setIsPercentage((prev) => !prev)}
        >
          %
        </span>
        <code style={{ color: '#aaa', fontStyle: 'italic' }}>{holographicHint}</code>
      </div>
      <DeleteButton onClick={() => dispatch({ type: 'set_slot', path, value: null })} />
    </div>
  );
};
