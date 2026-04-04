import { FC } from 'react';
import { Node as ConvertNode } from '../../api/types';
import { RuleType } from '../../api/nestedpolicy.types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import ScriptPolicyRules from '../Rules/ScriptPolicyRules';
import { ScriptPolicyProgram } from '../../transpilation/policyRuleTranspiler';

interface PolicyRuleEditorProps {
  ruleType: RuleType;
  scriptProgram: ScriptPolicyProgram;
  nestedProgram: ConvertNode | null;
  errorMessage: string | null;
  onScriptChange: (program: ScriptPolicyProgram) => void;
  onNestedChange: (program: ConvertNode | null) => void;
  onNestedSlotsFilledChange: (filled: boolean) => void;
  onFocusCapture: () => void;
  onBlurCapture: () => void;
}

const getRuleEditorLabels = (ruleType: RuleType): { label: string; ariaLabel: string } => {
  if (ruleType === 'nested') {
    return {
      label: 'Nested Policy Rules',
      ariaLabel: 'Nested policy rules editor',
    };
  }

  return {
    label: 'Policy Script',
    ariaLabel: 'Policy script editor',
  };
};

const PolicyRuleEditor: FC<PolicyRuleEditorProps> = ({
  ruleType,
  scriptProgram,
  nestedProgram,
  errorMessage,
  onScriptChange,
  onNestedChange,
  onNestedSlotsFilledChange,
  onFocusCapture,
  onBlurCapture,
}) => {
  const { label, ariaLabel } = getRuleEditorLabels(ruleType);

  return (
    <div
      className="modal-body policy-editor-modal-body"
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      {ruleType === 'nested' ? (
        <div className="policy-nested-editor">
          <NestedPolicyRules
            rule={nestedProgram}
            onRuleChange={onNestedChange}
            onSlotsFilledChange={onNestedSlotsFilledChange}
          />
          {errorMessage ? <p className="transpiled-editor-error">{errorMessage}</p> : null}
        </div>
      ) : (
        <ScriptPolicyRules
          data={scriptProgram}
          onChange={onScriptChange}
          label={label}
          ariaLabel={ariaLabel}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default PolicyRuleEditor;
