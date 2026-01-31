import { FC, useEffect } from 'react';
import { useEditorState } from './EditorContext';
import Slot from './Slot';
import { areAllSlotsFilled } from './treeUtils';

interface NestedPolicyRulesProps {
  onSlotsFilledChange: (filled: boolean) => void;
}

export const NestedPolicyRules: FC<NestedPolicyRulesProps> = ({ onSlotsFilledChange }) => {
  const { root } = useEditorState();

  useEffect(() => {
    onSlotsFilledChange(areAllSlotsFilled(root));
  }, [root, onSlotsFilledChange]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Slot path={[]} />
    </div>
  );
};

export default NestedPolicyRules;
