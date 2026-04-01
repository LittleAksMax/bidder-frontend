import { FC } from 'react';
import { ScriptPolicyProgram } from '../../transpilation/policyRuleTranspiler';
import CodeEditorWithLineNumbers from './CodeEditorWithLineNumbers';
import './styles/TranspiledRuleEditors.css';

interface ScriptPolicyRulesProps {
  data: ScriptPolicyProgram;
  onChange: (next: ScriptPolicyProgram) => void;
  label?: string;
  ariaLabel?: string;
  errorMessage?: string | null;
}

const ScriptPolicyRules: FC<ScriptPolicyRulesProps> = ({
  data,
  onChange,
  label = 'Policy Script',
  ariaLabel = 'Policy script editor',
  errorMessage = null,
}) => {
  return (
    <div className="transpiled-editor-root">
      <label htmlFor="script-policy-editor" className="transpiled-editor-label">
        {label}
      </label>
      <CodeEditorWithLineNumbers
        id="script-policy-editor"
        value={data.source}
        onChange={(nextValue) => onChange({ source: nextValue })}
        ariaLabel={ariaLabel}
      />
      {errorMessage ? <p className="transpiled-editor-error">{errorMessage}</p> : null}
    </div>
  );
};

export default ScriptPolicyRules;
