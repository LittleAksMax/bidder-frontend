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
import { RuleNode } from '../../transpilation/ruleTypes';
import './PolicyInputs.css';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface EditPolicyModalProps {
  show: boolean;
  onClose: () => void;
  policy: Policy | null;
  handleUpdate: (id: string, name: string, script: string) => Promise<boolean>;
}

type EditPolicyModalBodyProps = Omit<EditPolicyModalProps, 'show' | 'onClose'>;
type EditPolicyModalFocusProps = {
  onGuardedClose: () => void;
  onEditorFocusCapture: () => void;
  onEditorBlurCapture: () => void;
};

const createInitialScriptProgram = (policy: Policy | null): ScriptPolicyProgram => ({
  source: policy?.script ?? '',
});

const EditPolicyModalBody: FC<EditPolicyModalBodyProps & EditPolicyModalFocusProps> = ({
  policy,
  handleUpdate,
  onGuardedClose,
  onEditorFocusCapture,
  onEditorBlurCapture,
}) => {
  const initialScriptProgram = createInitialScriptProgram(policy);
  const initialRule = policyRuleTranspiler.toNested('script', initialScriptProgram);

  const [policyName, setPolicyName] = useState<string>(policy?.name ?? '');
  const [ruleType, setRuleType] = useState<RuleType>('script');
  const [marketplace] = useState<string>(policy?.marketplace ?? 'EU');
  const [allSlotsFilled, setAllSlotsFilled] = useState<boolean>(() => areAllSlotsFilled(initialRule));
  const [rules, setRules] = useState<RuleNode | null>(initialRule);
  const rulesRef = useRef<RuleNode | null>(initialRule);
  const [scriptProgram, setScriptProgram] = useState<ScriptPolicyProgram>(initialScriptProgram);
  const [treeProgram, setTreeProgram] = useState<TreePolicyProgram>(() =>
    policyRuleTranspiler.fromNested('tree', initialRule),
  );

  const isUpdateEnabled =
    allSlotsFilled && Boolean(policy) && Boolean(policyName.trim()) && Boolean(scriptProgram.source.trim());

  const syncDerivedFormats = useCallback((rule: RuleNode | null): void => {
    setScriptProgram(policyRuleTranspiler.fromNested('script', rule));
    setTreeProgram(policyRuleTranspiler.fromNested('tree', rule));
  }, []);

  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

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

  let ruleComponent = null;
  if (ruleType === 'nested') {
    ruleComponent = (
      <EditorProvider>
        <NestedPolicyRules
          rule={rules}
          onSlotsFilledChange={setAllSlotsFilled}
          onRuleChange={handleNestedRuleChange}
        />
      </EditorProvider>
    );
  } else if (ruleType === 'script') {
    ruleComponent = <ScriptPolicyRules data={scriptProgram} onChange={handleScriptChange} />;
  } else if (ruleType === 'tree') {
    ruleComponent = <TreePolicyRules data={treeProgram} onChange={handleTreeChange} />;
  }

  return (
    <>
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
          <select value={marketplace} className="dropdown" disabled>
            <option>{marketplace}</option>
          </select>
          <input
            type="text"
            value={policyName}
            onChange={(event) => setPolicyName(event.target.value)}
            className="input-field"
          />
        </div>
        <HelpButton section={ruleType} />
        <button className="modal-close" onClick={onGuardedClose}>
          &times;
        </button>
      </div>
      <div
        className="modal-body"
        onFocusCapture={onEditorFocusCapture}
        onBlurCapture={onEditorBlurCapture}
      >
        {ruleComponent}
      </div>
      <div className="policy-modal-footer">
        <button
          className={`policy-modal-submit-btn ${isUpdateEnabled ? 'is-enabled' : 'is-disabled'}`}
          disabled={!isUpdateEnabled}
          onClick={() => {
            if (policy) {
              handleUpdate(policy.id, policyName, scriptProgram.source);
            }
          }}
        >
          Update Policy
        </button>
      </div>
    </>
  );
};

const EditPolicyModal: FC<EditPolicyModalProps> = ({ show, onClose, policy, handleUpdate }) => {
  const editorFocusedRef = useRef<boolean>(false);
  const editorBlurTimeoutRef = useRef<number | null>(null);

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

  return (
    <Modal show={show} onClose={handleGuardedClose}>
      <EditPolicyModalBody
        key={policy?.id ?? 'no-policy-selected'}
        policy={policy}
        handleUpdate={handleUpdate}
        onGuardedClose={handleGuardedClose}
        onEditorFocusCapture={handleEditorFocusCapture}
        onEditorBlurCapture={handleEditorBlurCapture}
      />
    </Modal>
  );
};

export default EditPolicyModal;
