import { VARIABLE_TYPES, VariableType } from '../api/types';
import {
  ConditionRuleNode,
  RuleNode,
  TerminalRuleNode,
  TerminalRuleNodeOperationType,
} from './ruleTypes';

export type PolicyEditorFormat = 'nested' | 'script' | 'tree';

export type ScriptPolicyProgram = {
  source: string;
};

export type DecisionTreeNode =
  | {
      id: string;
      kind: 'condition';
      variable: VariableType;
      min: number;
      max: number;
      ifId: string | null;
      elseId: string | null;
    }
  | {
      id: string;
      kind: 'terminal';
      op: TerminalRuleNodeOperationType;
    };

export type TreePolicyProgram = {
  rootId: string | null;
  nodes: DecisionTreeNode[];
};

export type PolicyFormatDataMap = {
  nested: RuleNode | null;
  script: ScriptPolicyProgram;
  tree: TreePolicyProgram;
};

interface RuleFormatTranspiler<F extends PolicyEditorFormat> {
  readonly format: F;
  fromNested(rule: RuleNode | null): PolicyFormatDataMap[F];
  toNested(data: PolicyFormatDataMap[F]): RuleNode | null;
}

const VARIABLE_VALUES = new Set<VariableType>(VARIABLE_TYPES.map((variable) => variable.value));

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTerminalOperation = (value: unknown): value is TerminalRuleNodeOperationType => {
  if (!isObjectRecord(value)) {
    return false;
  }
  const type = value.type;
  const amount = value.amount;

  if ((type !== 'add' && type !== 'mul') || !isObjectRecord(amount)) {
    return false;
  }

  return (
    typeof amount.neg === 'boolean' &&
    typeof amount.perc === 'boolean' &&
    typeof amount.amount === 'number'
  );
};

const isTerminalRule = (value: unknown): value is TerminalRuleNode => {
  if (!isObjectRecord(value)) {
    return false;
  }
  return value.type === 'terminal' && isTerminalOperation(value.op);
};

const isConditionRule = (value: unknown): value is ConditionRuleNode => {
  if (!isObjectRecord(value)) {
    return false;
  }
  if (value.type !== 'condition') {
    return false;
  }
  if (
    typeof value.min !== 'number' ||
    typeof value.max !== 'number' ||
    typeof value.variable !== 'string' ||
    !VARIABLE_VALUES.has(value.variable as VariableType)
  ) {
    return false;
  }

  const ifNode = value.if;
  const elseNode = value.else;
  const isIfValid = ifNode === null || isRuleNode(ifNode);
  const isElseValid = elseNode === null || isRuleNode(elseNode);
  return isIfValid && isElseValid;
};

const isRuleNode = (value: unknown): value is RuleNode =>
  isTerminalRule(value) || isConditionRule(value);

const cloneRuleNode = (rule: RuleNode | null): RuleNode | null => {
  if (rule === null) {
    return null;
  }
  if (rule.type === 'terminal') {
    return {
      type: 'terminal',
      op: {
        type: rule.op.type,
        amount: {
          neg: rule.op.amount.neg,
          perc: rule.op.amount.perc,
          amount: rule.op.amount.amount,
        },
      },
    };
  }

  return {
    type: 'condition',
    variable: rule.variable,
    min: rule.min,
    max: rule.max,
    if: cloneRuleNode(rule.if),
    else: cloneRuleNode(rule.else),
  };
};

const createNodeId = (path: string[]): string => (path.length === 0 ? 'root' : path.join('.'));

const nestedToTree = (rule: RuleNode | null): TreePolicyProgram => {
  const nodes: DecisionTreeNode[] = [];

  const visit = (node: RuleNode | null, path: string[]): string | null => {
    if (!node) {
      return null;
    }

    const id = createNodeId(path);
    if (node.type === 'terminal') {
      nodes.push({
        id,
        kind: 'terminal',
        op: {
          type: node.op.type,
          amount: {
            neg: node.op.amount.neg,
            perc: node.op.amount.perc,
            amount: node.op.amount.amount,
          },
        },
      });
      return id;
    }

    const ifId = visit(node.if, [...path, 'if']);
    const elseId = visit(node.else, [...path, 'else']);

    nodes.push({
      id,
      kind: 'condition',
      variable: node.variable,
      min: node.min,
      max: node.max,
      ifId,
      elseId,
    });
    return id;
  };

  const rootId = visit(rule, []);
  return { rootId, nodes };
};

export const isTreePolicyProgram = (value: unknown): value is TreePolicyProgram => {
  if (!isObjectRecord(value)) {
    return false;
  }
  const rootId = value.rootId;
  const nodes = value.nodes;

  if (!(rootId === null || typeof rootId === 'string') || !Array.isArray(nodes)) {
    return false;
  }

  return nodes.every((node) => {
    if (!isObjectRecord(node) || typeof node.id !== 'string' || typeof node.kind !== 'string') {
      return false;
    }

    if (node.kind === 'terminal') {
      return isTerminalOperation(node.op);
    }

    if (node.kind === 'condition') {
      return (
        typeof node.variable === 'string' &&
        VARIABLE_VALUES.has(node.variable as VariableType) &&
        typeof node.min === 'number' &&
        typeof node.max === 'number' &&
        (node.ifId === null || typeof node.ifId === 'string') &&
        (node.elseId === null || typeof node.elseId === 'string')
      );
    }

    return false;
  });
};

const treeToNested = (program: TreePolicyProgram): RuleNode | null => {
  const nodeMap = new Map(program.nodes.map((node) => [node.id, node]));

  const visit = (id: string | null, seen: Set<string>): RuleNode | null => {
    if (id === null) {
      return null;
    }

    if (seen.has(id)) {
      return null;
    }

    const node = nodeMap.get(id);
    if (!node) {
      return null;
    }

    const nextSeen = new Set(seen);
    nextSeen.add(id);

    if (node.kind === 'terminal') {
      return {
        type: 'terminal',
        op: {
          type: node.op.type,
          amount: {
            neg: node.op.amount.neg,
            perc: node.op.amount.perc,
            amount: node.op.amount.amount,
          },
        },
      };
    }

    return {
      type: 'condition',
      variable: node.variable,
      min: node.min,
      max: node.max,
      if: visit(node.ifId, new Set(nextSeen)),
      else: visit(node.elseId, new Set(nextSeen)),
    };
  };

  return visit(program.rootId, new Set<string>());
};

class NestedRuleTranspiler implements RuleFormatTranspiler<'nested'> {
  readonly format = 'nested' as const;

  fromNested(rule: RuleNode | null): RuleNode | null {
    return cloneRuleNode(rule);
  }

  toNested(data: RuleNode | null): RuleNode | null {
    return cloneRuleNode(data);
  }
}

class ScriptRuleTranspiler implements RuleFormatTranspiler<'script'> {
  readonly format = 'script' as const;

  fromNested(rule: RuleNode | null): ScriptPolicyProgram {
    return {
      source: JSON.stringify(rule, null, 2),
    };
  }

  toNested(data: ScriptPolicyProgram): RuleNode | null {
    const source = data.source.trim();
    if (!source) {
      return null;
    }

    try {
      const parsed = JSON.parse(source) as unknown;
      if (parsed === null) {
        return null;
      }
      return isRuleNode(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

class TreeRuleTranspiler implements RuleFormatTranspiler<'tree'> {
  readonly format = 'tree' as const;

  fromNested(rule: RuleNode | null): TreePolicyProgram {
    return nestedToTree(rule);
  }

  toNested(data: TreePolicyProgram): RuleNode | null {
    if (!isTreePolicyProgram(data)) {
      return null;
    }
    return treeToNested(data);
  }
}

export class PolicyRuleTranspilerService {
  private readonly transpilers: {
    nested: RuleFormatTranspiler<'nested'>;
    script: RuleFormatTranspiler<'script'>;
    tree: RuleFormatTranspiler<'tree'>;
  } = {
    nested: new NestedRuleTranspiler(),
    script: new ScriptRuleTranspiler(),
    tree: new TreeRuleTranspiler(),
  };

  fromNested<F extends PolicyEditorFormat>(
    format: F,
    rule: RuleNode | null,
  ): PolicyFormatDataMap[F] {
    const transpiler = this.transpilers[format] as RuleFormatTranspiler<F>;
    return transpiler.fromNested(rule);
  }

  toNested<F extends PolicyEditorFormat>(format: F, data: PolicyFormatDataMap[F]): RuleNode | null {
    const transpiler = this.transpilers[format] as RuleFormatTranspiler<F>;
    return transpiler.toNested(data);
  }

  convert<From extends PolicyEditorFormat, To extends PolicyEditorFormat>(
    fromFormat: From,
    toFormat: To,
    data: PolicyFormatDataMap[From],
  ): PolicyFormatDataMap[To] {
    const nested = this.toNested(fromFormat, data);
    return this.fromNested(toFormat, nested);
  }
}

export const policyRuleTranspiler = new PolicyRuleTranspilerService();
