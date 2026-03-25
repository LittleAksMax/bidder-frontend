import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';
import { useEditorState, useEditorDispatch } from './EditorContext';
import Slot from './Slot';
import { areAllSlotsFilled } from './treeUtils';
import './styles/NestedPolicyRules.css';
import { RuleNode } from '../../api/types';

interface NestedPolicyRulesProps {
  onSlotsFilledChange: (filled: boolean) => void;
  onRuleChange: Dispatch<SetStateAction<RuleNode | null>>;
  rule: RuleNode | null;
}

export const NestedPolicyRules: FC<NestedPolicyRulesProps> = ({
  onSlotsFilledChange,
  onRuleChange,
  rule,
}) => {
  const { root } = useEditorState();
  const dispatch = useEditorDispatch();
  const rootRef = useRef<RuleNode | null>(root);
  const syncingFromPropRef = useRef<boolean>(false);

  useEffect(() => {
    rootRef.current = root;
  }, [root]);

  useEffect(() => {
    if (rule === rootRef.current) {
      return;
    }
    syncingFromPropRef.current = true;
    dispatch({ type: 'set_root', root: rule });
  }, [rule, dispatch]);

  useEffect(() => {
    onSlotsFilledChange(areAllSlotsFilled(root));
    if (syncingFromPropRef.current) {
      syncingFromPropRef.current = false;
      return;
    }
    onRuleChange(root);
  }, [root, onSlotsFilledChange, onRuleChange]);

  return (
    <div className="nested-policy-rules">
      <Slot path={[]} />
    </div>
  );
};

export default NestedPolicyRules;
