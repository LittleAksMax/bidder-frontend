import { FC, useMemo } from 'react';
import { useEditorState, useEditorDispatch } from './EditorContext';
import { Path, getAtPath, usedVarsAlongPath } from './treeUtils';
import { VARIABLE_TYPES, VariableType } from '../../api/types';
import { EmptySlot } from './EmptySlot';
import { ConditionNode } from './ConditionNode';
import { TerminalNode } from './TerminalNode';

interface SlotProps {
  path: Path;
}

const Slot: FC<SlotProps> = ({ path }) => {
  const { root } = useEditorState();
  const dispatch = useEditorDispatch();
  const node = useMemo(() => getAtPath(root, path), [root, path]);
  const usedVars = useMemo(() => usedVarsAlongPath(root, path), [root, path]);
  const availableVars = VARIABLE_TYPES.map((v) => v.value).filter(
    (v) => !usedVars.has(v as VariableType),
  );

  const onAddCondition =
    availableVars.length > 0
      ? () =>
          dispatch({
            type: 'set_slot',
            path,
            value: {
              type: 'condition',
              variable: availableVars[0]!,
              min: 0,
              max: 0,
              if: null,
              else: null,
            },
          })
      : null;

  const onVariableChange = (variable: VariableType) => {
    dispatch({
      type: 'update_node',
      path,
      patch: { variable },
    });
  };

  const onRangeChange = (range: { min: number; max: number }) => {
    dispatch({
      type: 'update_node',
      path,
      patch: range,
    });
  };

  if (!node) {
    return (
      <EmptySlot
        onAddCondition={onAddCondition}
        onAddTerminal={() =>
          dispatch({
            type: 'set_slot',
            path,
            value: {
              type: 'terminal',
              op: { type: 'add', amount: { neg: false, amount: 0, perc: false } },
            },
          })
        }
        availableVars={availableVars as VariableType[]}
      />
    );
  }
  if (node.type === 'condition') {
    return (
      <ConditionNode
        node={node}
        path={path}
        usedVars={usedVars}
        onVariableChange={onVariableChange}
        onRangeChange={onRangeChange}
      />
    );
  }
  if (node.type === 'terminal') {
    return <TerminalNode node={node} path={[...path, 'terminal']} />;
  }
  return null;
};

export default Slot;
