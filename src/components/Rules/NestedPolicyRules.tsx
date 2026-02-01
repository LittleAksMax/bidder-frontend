import { FC, useEffect } from 'react';
import { useEditorState, useEditorDispatch } from './EditorContext';
import Slot from './Slot';
import { areAllSlotsFilled } from './treeUtils';
import './styles/NestedPolicyRules.css';
import { RuleNode } from '../../api/types';

interface NestedPolicyRulesProps {
  onSlotsFilledChange: (filled: boolean) => void;
  rule: RuleNode | null;
}

export const NestedPolicyRules: FC<NestedPolicyRulesProps> = ({ onSlotsFilledChange, rule }) => {
  const { root } = useEditorState();
  const dispatch = useEditorDispatch(); // Use dispatch to update state

  // Initialize the editor state with the passed rule
  useEffect(() => {
    if (rule) {
      dispatch({ type: 'set_root', root: rule }); // Dispatch set_root action
    }
  }, [rule, dispatch]);

  useEffect(() => {
    onSlotsFilledChange(areAllSlotsFilled(root));
  }, [root, onSlotsFilledChange]);

  return (
    <div className="nested-policy-rules">
      <Slot path={[]} />
    </div>
  );
};

export default NestedPolicyRules;
