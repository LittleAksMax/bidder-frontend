import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import Modal from '../Modal';
import { Policy, RULE_TYPES, RuleType } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { EditorProvider } from '../Rules/EditorContext';
import ScriptPolicyRules from '../Rules/ScriptPolicyRules';
import TreePolicyRules from '../Rules/TreePolicyRules';
import { areAllSlotsFilled } from '../Rules/treeUtils';
import {
  policyRuleTranspiler,
  ScriptPolicyProgram,
  TreePolicyProgram,
} from '../../transpilation/policyRuleTranspiler';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';
import { RuleNode } from '../../transpilation/ruleTypes';

interface CreatePolicyModalProps {
  show: boolean;
  handleCreate: (p: Policy) => Promise<boolean>;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, handleCreate, onClose }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [ruleType, setRuleType] = useState<RuleType>('script');
  const [marketplace, setMarketplace] = useState<string>('EU');
  const [allSlotsFilled, setAllSlotsFilled] = useState<boolean>(false);
  const [rules, setRules] = useState<RuleNode | null>(null);
  const rulesRef = useRef<RuleNode | null>(null);
  const editorFocusedRef = useRef<boolean>(false);
  const editorBlurTimeoutRef = useRef<number | null>(null);
  const [scriptProgram, setScriptProgram] = useState<ScriptPolicyProgram>(() =>
    policyRuleTranspiler.fromNested('script', null),
  );
  const [treeProgram, setTreeProgram] = useState<TreePolicyProgram>(() =>
    policyRuleTranspiler.fromNested('tree', null),
  );

  const isCreateEnabled = allSlotsFilled && Boolean(rules) && Boolean(policyName.trim());

  const syncDerivedFormats = useCallback((rule: RuleNode | null): void => {
    setScriptProgram(policyRuleTranspiler.fromNested('script', rule));
    setTreeProgram(policyRuleTranspiler.fromNested('tree', rule));
  }, []);

  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  useEffect((): (() => void) => {
    return () => {
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!show) {
      editorFocusedRef.current = false;
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
        editorBlurTimeoutRef.current = null;
      }
    }
  }, [show]);

  const handleNestedRuleChange = useCallback<Dispatch<SetStateAction<RuleNode | null>>>(
    (nextRule) => {
      const resolvedRule = typeof nextRule === 'function' ? nextRule(rulesRef.current) : nextRule;
      rulesRef.current = resolvedRule;
      setRules(resolvedRule);
      setAllSlotsFilled(areAllSlotsFilled(resolvedRule));
      syncDerivedFormats(resolvedRule);
    },
    [syncDerivedFormats],
  );

  const handleScriptChange = (nextProgram: ScriptPolicyProgram): void => {
    setScriptProgram(nextProgram);
    const nextRule = policyRuleTranspiler.toNested('script', nextProgram);
    setRules(nextRule);
    setAllSlotsFilled(areAllSlotsFilled(nextRule));
    setTreeProgram(policyRuleTranspiler.fromNested('tree', nextRule));
  };

  const handleTreeChange = (nextProgram: TreePolicyProgram | null): void => {
    if (!nextProgram) {
      setRules(null);
      setAllSlotsFilled(false);
      return;
    }

    setTreeProgram(nextProgram);
    const nextRule = policyRuleTranspiler.toNested('tree', nextProgram);
    setRules(nextRule);
    setAllSlotsFilled(areAllSlotsFilled(nextRule));
    setScriptProgram(policyRuleTranspiler.fromNested('script', nextRule));
  };

  const handleRuleTypeChange = (nextRuleType: RuleType): void => {
    let nextRule = rules;
    if (ruleType === 'script') {
      nextRule = policyRuleTranspiler.toNested('script', scriptProgram);
    } else if (ruleType === 'tree') {
      nextRule = policyRuleTranspiler.toNested('tree', treeProgram);
    }

    setRuleType(nextRuleType);
    setRules(nextRule);
    setAllSlotsFilled(areAllSlotsFilled(nextRule));

    if (nextRuleType === 'script') {
      setScriptProgram(policyRuleTranspiler.fromNested('script', nextRule));
    } else if (nextRuleType === 'tree') {
      setTreeProgram(policyRuleTranspiler.fromNested('tree', nextRule));
    }
  };

  const handleEditorFocusCapture = (): void => {
    if (editorBlurTimeoutRef.current !== null) {
      window.clearTimeout(editorBlurTimeoutRef.current);
      editorBlurTimeoutRef.current = null;
    }
    editorFocusedRef.current = true;
  };

  const handleEditorBlurCapture = (): void => {
    if (editorBlurTimeoutRef.current !== null) {
      window.clearTimeout(editorBlurTimeoutRef.current);
    }
    editorBlurTimeoutRef.current = window.setTimeout(() => {
      editorFocusedRef.current = false;
      editorBlurTimeoutRef.current = null;
    }, 0);
  };

  const handleGuardedClose = (): void => {
    if (editorFocusedRef.current) {
      return;
    }
    onClose();
  };

  let RuleComponent = null;
  if (ruleType === 'nested') {
    RuleComponent = (
      <EditorProvider>
        <NestedPolicyRules
          onSlotsFilledChange={setAllSlotsFilled}
          onRuleChange={handleNestedRuleChange}
          rule={rules}
        />
      </EditorProvider>
    );
  } else if (ruleType === 'script') {
    RuleComponent = <ScriptPolicyRules data={scriptProgram} onChange={handleScriptChange} />;
  } else if (ruleType === 'tree') {
    RuleComponent = <TreePolicyRules data={treeProgram} onChange={handleTreeChange} />;
  }

  return (
    <Modal show={show} onClose={handleGuardedClose}>
      <div className="modal-titlebar">
        <div className="dropdown-container">
          <select
            value={ruleType}
            onChange={(event) => handleRuleTypeChange(event.target.value as RuleType)}
            className="dropdown"
          >
            {RULE_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </select>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="dropdown"
          >
            {['EU'].map((mp) => (
              <option key={mp} value={mp}>
                {mp}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            placeholder="Enter policy name"
            className="input-field"
          />
        </div>
        <HelpButton section={ruleType} />
        <button className="modal-close" onClick={handleGuardedClose}>
          &times;
        </button>
      </div>
      <div
        className="modal-body"
        onFocusCapture={handleEditorFocusCapture}
        onBlurCapture={handleEditorBlurCapture}
      >
        {RuleComponent}
      </div>
      <div className="policy-modal-footer">
        <button
          className={`policy-modal-submit-btn ${isCreateEnabled ? 'is-enabled' : 'is-disabled'}`}
          disabled={!isCreateEnabled}
          onClick={() =>
            handleCreate({
              id: null!,
              name: policyName,
              marketplace,
              script: scriptProgram.source,
            })
          }
        >
          Create Policy
        </button>
      </div>
    </Modal>
  );
};

export default CreatePolicyModal;
