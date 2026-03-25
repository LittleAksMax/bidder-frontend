import { FC, useState } from 'react';
import { isTreePolicyProgram, TreePolicyProgram } from '../../transpilation/policyRuleTranspiler';
import CodeEditorWithLineNumbers from './CodeEditorWithLineNumbers';
import './styles/TranspiledRuleEditors.css';

interface TreePolicyRulesProps {
  data: TreePolicyProgram;
  onChange: (next: TreePolicyProgram | null) => void;
}

const formatTreeProgram = (data: TreePolicyProgram): string => JSON.stringify(data, null, 2);

const TreePolicyRules: FC<TreePolicyRulesProps> = ({ data, onChange }) => {
  const [rawText, setRawText] = useState<string>(() => formatTreeProgram(data));
  const [hasParseError, setHasParseError] = useState<boolean>(false);

  const handleChange = (nextText: string): void => {
    setRawText(nextText);

    try {
      const parsed = JSON.parse(nextText) as unknown;
      if (isTreePolicyProgram(parsed)) {
        setHasParseError(false);
        onChange(parsed);
        return;
      }
      setHasParseError(true);
      onChange(null);
    } catch {
      setHasParseError(true);
      onChange(null);
    }
  };

  return (
    <div className="transpiled-editor-root">
      <label htmlFor="tree-policy-editor" className="transpiled-editor-label">
        Decision Tree
      </label>
      <CodeEditorWithLineNumbers
        id="tree-policy-editor"
        value={rawText}
        onChange={handleChange}
        ariaLabel="Decision tree editor"
      />
      {hasParseError ? (
        <p className="transpiled-editor-error">Invalid decision-tree JSON.</p>
      ) : null}
    </div>
  );
};

export default TreePolicyRules;
