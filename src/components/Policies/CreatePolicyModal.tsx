import { FC, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/ApiClient';
import { Node as ConvertNode } from '../../api/convert.types';
import Modal from '../Modal';
import { Policy, RULE_TYPES, RuleType } from '../../api/types';
import DecisionGraphPolicyRules from '../Rules/DecisionGraphPolicyRules';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import ScriptPolicyRules from '../Rules/ScriptPolicyRules';
import { ScriptPolicyProgram } from '../../transpilation/policyRuleTranspiler';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface CreatePolicyModalProps {
  show: boolean;
  handleCreate: (p: Policy) => Promise<boolean>;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, handleCreate, onClose }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [ruleType, setRuleType] = useState<RuleType>('script');
  const [marketplace, setMarketplace] = useState<string>('EU');
  const [marketplaces, setMarketplaces] = useState<string[]>(['EU']);
  const [scriptProgram, setScriptProgram] = useState<ScriptPolicyProgram>({ source: '' });
  const [treeProgram, setTreeProgram] = useState<ConvertNode | null>(null);
  const [areNestedSlotsFilled, setAreNestedSlotsFilled] = useState<boolean>(false);
  const [areTreeSlotsFilled, setAreTreeSlotsFilled] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const editorFocusedRef = useRef<boolean>(false);
  const editorBlurTimeoutRef = useRef<number | null>(null);
  const isCreateEnabled =
    Boolean(policyName.trim()) &&
    !isConverting &&
    (ruleType === 'script'
      ? Boolean(scriptProgram.source.trim())
      : ruleType === 'nested'
        ? areNestedSlotsFilled
        : areTreeSlotsFilled);

  useEffect((): (() => void) => {
    return () => {
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!show) {
      setConversionError(null);
      editorFocusedRef.current = false;
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
        editorBlurTimeoutRef.current = null;
      }
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      return;
    }

    let isMounted = true;

    void apiClient.getSellerProfiles().then((sellerProfiles) => {
      if (!isMounted) {
        return;
      }

      const nextMarketplaces = Array.from(
        new Set(
          sellerProfiles.flatMap((seller) =>
            seller.profiles.map((profile) => profile.countryCode).filter(Boolean),
          ),
        ),
      );

      if (nextMarketplaces.length === 0) {
        return;
      }

      setMarketplaces(nextMarketplaces);
      setMarketplace((currentMarketplace) =>
        nextMarketplaces.includes(currentMarketplace) ? currentMarketplace : nextMarketplaces[0]!,
      );
    });

    return () => {
      isMounted = false;
    };
  }, [show]);

  const handleScriptChange = (nextProgram: ScriptPolicyProgram): void => {
    setConversionError(null);
    setScriptProgram(nextProgram);
  };

  const handleNestedChange = (nextProgram: ConvertNode | null): void => {
    setConversionError(null);
    setTreeProgram(nextProgram);
  };

  const handleTreeChange = (nextProgram: ConvertNode | null): void => {
    setConversionError(null);
    setTreeProgram(nextProgram);
  };

  const handleRuleTypeChange = async (nextRuleType: RuleType): Promise<void> => {
    if (nextRuleType === ruleType) {
      return;
    }

    setConversionError(null);

    if (ruleType === 'script' && nextRuleType !== 'script') {
      const currentScript = scriptProgram.source.trim();

      if (!currentScript) {
        setTreeProgram(null);
        setRuleType(nextRuleType);
        return;
      }

      setIsConverting(true);

      try {
        const { result: convertedTree, errorMessage } = await apiClient.convertScriptToTree(
          scriptProgram.source,
        );

        if (!convertedTree) {
          setConversionError(errorMessage ?? 'Unable to convert the current script to JSON.');
          return;
        }

        setTreeProgram(convertedTree);
        setRuleType(nextRuleType);
      } finally {
        setIsConverting(false);
      }

      return;
    }

    if (ruleType !== 'script' && nextRuleType === 'script') {
      if (!treeProgram) {
        setScriptProgram({ source: '' });
        setRuleType(nextRuleType);
        return;
      }

      setIsConverting(true);

      try {
        const { result: convertedScript, errorMessage } =
          await apiClient.convertTreeToScript(treeProgram);

        if (convertedScript === null) {
          setConversionError(errorMessage ?? 'Unable to convert the current rule to script.');
          return;
        }

        setScriptProgram({ source: convertedScript });
        setRuleType(nextRuleType);
      } finally {
        setIsConverting(false);
      }

      return;
    }

    setRuleType(nextRuleType);
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

  const currentEditorError = conversionError;

  const handleCreatePolicy = async (): Promise<void> => {
    if (!isCreateEnabled) {
      return;
    }

    let nextScript = scriptProgram.source;

    if (ruleType !== 'script') {
      if (!treeProgram) {
        setConversionError('Complete the rule before creating the policy.');
        return;
      }

      setConversionError(null);
      setIsConverting(true);

      try {
        const { result: convertedScript, errorMessage } =
          await apiClient.convertTreeToScript(treeProgram);

        if (convertedScript === null) {
          setConversionError(errorMessage ?? 'Unable to convert the current rule to script.');
          return;
        }

        nextScript = convertedScript;
        setScriptProgram({ source: convertedScript });
      } finally {
        setIsConverting(false);
      }
    }

    await handleCreate({
      id: null!,
      name: policyName,
      marketplace,
      script: nextScript,
    });
  };

  const ruleLabel =
    ruleType === 'script'
      ? 'Policy Script'
      : ruleType === 'nested'
        ? 'Nested Policy Rules'
        : 'Decision Tree';

  const ruleAriaLabel =
    ruleType === 'script'
      ? 'Policy script editor'
      : ruleType === 'nested'
        ? 'Nested policy rules editor'
        : 'Decision tree editor';

  const ruleComponent =
    ruleType === 'nested' ? (
      <div className="policy-nested-editor">
        <NestedPolicyRules
          rule={treeProgram}
          onRuleChange={handleNestedChange}
          onSlotsFilledChange={setAreNestedSlotsFilled}
        />
        {currentEditorError ? <p className="transpiled-editor-error">{currentEditorError}</p> : null}
      </div>
    ) : ruleType === 'tree' ? (
      <div className="policy-nested-editor">
        <DecisionGraphPolicyRules
          rule={treeProgram}
          onRuleChange={handleTreeChange}
          onSlotsFilledChange={setAreTreeSlotsFilled}
        />
        {currentEditorError ? <p className="transpiled-editor-error">{currentEditorError}</p> : null}
      </div>
    ) : (
      <ScriptPolicyRules
        data={scriptProgram}
        onChange={handleScriptChange}
        label={ruleLabel}
        ariaLabel={ruleAriaLabel}
        errorMessage={currentEditorError}
      />
    );

  return (
    <Modal show={show} onClose={handleGuardedClose}>
      <div className="modal-titlebar">
        <div className="dropdown-container">
          <select
            value={ruleType}
            onChange={(event) => handleRuleTypeChange(event.target.value as RuleType)}
            className="dropdown"
            disabled={isConverting}
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
            disabled={isConverting}
          >
            {marketplaces.map((mp) => (
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
            disabled={isConverting}
          />
        </div>
        <HelpButton section={ruleType} />
        <button className="modal-close" onClick={handleGuardedClose}>
          &times;
        </button>
      </div>
      <div
        className="modal-body policy-editor-modal-body"
        onFocusCapture={handleEditorFocusCapture}
        onBlurCapture={handleEditorBlurCapture}
      >
        {ruleComponent}
      </div>
      <div className="policy-modal-footer">
        <button
          className={`policy-modal-submit-btn ${isCreateEnabled ? 'is-enabled' : 'is-disabled'}`}
          disabled={!isCreateEnabled}
          onClick={() => void handleCreatePolicy()}
        >
          Create Policy
        </button>
      </div>
    </Modal>
  );
};

export default CreatePolicyModal;
