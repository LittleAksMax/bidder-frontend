import { useState } from 'react';
import { apiClient } from '../../api/ApiClient';
import { RuleType } from '../../api/nestedpolicy.types';
import { Node as ConvertNode } from '../../api/types';
import { ScriptPolicyProgram } from '../../transpilation/policyRuleTranspiler';

interface UsePolicyRuleEditorOptions {
  initialScript: string;
}

interface UsePolicyRuleEditorResult {
  ruleType: RuleType;
  scriptProgram: ScriptPolicyProgram;
  nestedProgram: ConvertNode | null;
  isConverting: boolean;
  conversionError: string | null;
  isRuleComplete: boolean;
  clearConversionError: () => void;
  setNestedSlotsFilled: (filled: boolean) => void;
  handleScriptChange: (program: ScriptPolicyProgram) => void;
  handleNestedChange: (program: ConvertNode | null) => void;
  handleRuleTypeChange: (ruleType: RuleType) => Promise<void>;
  ensureScriptProgram: (missingRuleMessage: string) => Promise<string | null>;
}

const usePolicyRuleEditor = ({
  initialScript,
}: UsePolicyRuleEditorOptions): UsePolicyRuleEditorResult => {
  const [ruleType, setRuleType] = useState<RuleType>('script');
  const [scriptProgram, setScriptProgram] = useState<ScriptPolicyProgram>({
    source: initialScript,
  });
  const [nestedProgram, setNestedProgram] = useState<ConvertNode | null>(null);
  const [areNestedSlotsFilled, setAreNestedSlotsFilled] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const clearConversionError = (): void => {
    setConversionError(null);
  };

  const isRuleComplete =
    ruleType === 'script' ? Boolean(scriptProgram.source.trim()) : areNestedSlotsFilled;

  const handleScriptChange = (nextProgram: ScriptPolicyProgram): void => {
    setConversionError(null);
    setScriptProgram(nextProgram);
  };

  const handleNestedChange = (nextProgram: ConvertNode | null): void => {
    setConversionError(null);
    setNestedProgram(nextProgram);
  };

  const handleRuleTypeChange = async (nextRuleType: RuleType): Promise<void> => {
    if (nextRuleType === ruleType) {
      return;
    }

    setConversionError(null);

    if (ruleType === 'script' && nextRuleType !== 'script') {
      const currentScript = scriptProgram.source.trim();

      if (!currentScript) {
        setNestedProgram(null);
        setRuleType(nextRuleType);
        return;
      }

      setIsConverting(true);

      try {
        const { result: convertedNestedRule, errorMessage } = await apiClient.convertScriptToTree(
          scriptProgram.source,
        );

        if (!convertedNestedRule) {
          setConversionError(
            errorMessage ?? 'Unable to convert the current script to nested rules.',
          );
          return;
        }

        setNestedProgram(convertedNestedRule);
        setRuleType(nextRuleType);
      } finally {
        setIsConverting(false);
      }

      return;
    }

    if (ruleType === 'nested' && nextRuleType === 'script') {
      if (!nestedProgram) {
        setScriptProgram({ source: '' });
        setRuleType(nextRuleType);
        return;
      }

      setIsConverting(true);

      try {
        const { result: convertedScript, errorMessage } =
          await apiClient.convertTreeToScript(nestedProgram);

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

  const ensureScriptProgram = async (missingRuleMessage: string): Promise<string | null> => {
    if (ruleType === 'script') {
      return scriptProgram.source;
    }

    if (!nestedProgram) {
      setConversionError(missingRuleMessage);
      return null;
    }

    setConversionError(null);
    setIsConverting(true);

    try {
      const { result: convertedScript, errorMessage } =
        await apiClient.convertTreeToScript(nestedProgram);

      if (convertedScript === null) {
        setConversionError(errorMessage ?? 'Unable to convert the current rule to script.');
        return null;
      }

      setScriptProgram({ source: convertedScript });
      return convertedScript;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    ruleType,
    scriptProgram,
    nestedProgram,
    isConverting,
    conversionError,
    isRuleComplete,
    clearConversionError,
    setNestedSlotsFilled: setAreNestedSlotsFilled,
    handleScriptChange,
    handleNestedChange,
    handleRuleTypeChange,
    ensureScriptProgram,
  };
};

export default usePolicyRuleEditor;
