import { FC } from 'react';
import { ScriptPolicyProgram } from '../../transpilation/policyRuleTranspiler';
import CodeEditorWithLineNumbers from './CodeEditorWithLineNumbers';
import './styles/TranspiledRuleEditors.css';

interface ScriptPolicyRulesProps {
  data: ScriptPolicyProgram;
  onChange: (next: ScriptPolicyProgram) => void;
}

const ScriptPolicyRules: FC<ScriptPolicyRulesProps> = ({ data, onChange }) => {
  return (
    <div className="transpiled-editor-root">
      <label htmlFor="script-policy-editor" className="transpiled-editor-label">
        Policy Script
      </label>
      <CodeEditorWithLineNumbers
        id="script-policy-editor"
        value={data.source}
        onChange={(nextValue) => onChange({ source: nextValue })}
        ariaLabel="Policy script editor"
      />
    </div>
  );
};

export default ScriptPolicyRules;
