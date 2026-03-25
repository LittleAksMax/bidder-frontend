import { VariableType } from '../api/types';

export type TerminalRuleNodeOperationType = {
  type: 'add' | 'mul';
  amount: {
    neg: boolean;
    amount: number;
    perc: boolean;
  };
};

export type TerminalRuleNode = {
  type: 'terminal';
  op: TerminalRuleNodeOperationType;
};

export type ConditionRuleNode = {
  type: 'condition';
  variable: VariableType;
  min: number;
  max: number;

  if: TerminalRuleNode | ConditionRuleNode | null; // NOTE: must make sure is not null
  else: TerminalRuleNode | ConditionRuleNode | null; // NOTE: must make sure is not null
};

export type RuleNode = TerminalRuleNode | ConditionRuleNode;
