import { RuleNode, ConditionRuleNode, TerminalRuleNode, VariableType } from '../../api/types';

export type Path = Array<'if' | 'else' | 'terminal'>;
export type ReadonlyPath = ReadonlyArray<'if' | 'else' | 'terminal'>;

export const getAtPath = (root: RuleNode | null, path: ReadonlyPath): RuleNode | null => {
  let node: RuleNode | null = root;
  for (let i = 0; i < path.length; i++) {
    const dir = path[i];

    // Ensure 'terminal' only appears as the final element in the path
    if (dir === 'terminal' && i !== path.length - 1) {
      console.error("'terminal' can only appear as the final element in a path.");
      return null;
    }

    // Explicitly check that dir is not 'terminal' before indexing
    if (dir !== 'if' && dir !== 'else') {
      console.error(`Invalid path segment: ${dir}`);
      return null;
    }

    if (!node || node.type !== 'condition') return null;
    node = node[dir] ?? null; // Ensure undefined is treated as null
  }
  return node;
};

export const setAtPath = (
  root: RuleNode | null,
  path: ReadonlyPath,
  value: RuleNode | null,
): RuleNode | null => {
  if (path.length === 0) return value;

  const [head, ...rest] = path;

  // Ensure 'terminal' only appears as the final element in the path
  if (head === 'terminal' && rest.length > 0) {
    console.error("'terminal' can only appear as the final element in a path.");
    return root;
  }

  // Handle terminal node case
  if (root && root.type === 'terminal') {
    if (path.length === 1 && head === 'terminal') {
      return value; // Replace the terminal node
    }
    throw new Error('Invalid path for terminal node');
  }

  if (!root || root.type !== 'condition') throw new Error('Invalid path');

  if (head !== 'if' && head !== 'else') {
    console.error(`Invalid path segment: ${head}`);
    throw new Error('Invalid path segment');
  }

  return {
    ...root,
    [head]: setAtPath(root[head], rest, value),
  };
};

export const updateAtPath = (
  root: RuleNode | null,
  path: ReadonlyPath,
  updater: (node: RuleNode | null) => RuleNode | null,
): RuleNode | null => {
  if (path.length === 0) return updater(root);
  if (!root || root.type !== 'condition') throw new Error('Invalid path');
  const [head, ...rest] = path;
  if (head !== 'if' && head !== 'else') throw new Error('Invalid path segment');
  return {
    ...root,
    [head]: updateAtPath(root[head], rest, updater),
  };
};

export const usedVarsAlongPath = (root: RuleNode | null, path: ReadonlyPath): Set<VariableType> => {
  const used = new Set<VariableType>();
  let node = root;
  for (let i = 0; i < path.length; i++) {
    const dir = path[i];

    // Ensure 'terminal' only appears as the final element in the path
    if (dir === 'terminal' && i !== path.length - 1) {
      console.error("'terminal' can only appear as the final element in a path.");
      break;
    }

    // Explicitly check that dir is not 'terminal' before indexing
    if (dir !== 'if' && dir !== 'else') {
      console.error(`Invalid path segment: ${dir}`);
      break;
    }

    if (!node || node.type !== 'condition') break;
    if (node.variable) used.add(node.variable as VariableType);
    node = node[dir] ?? null;
  }
  return used;
};

export const areAllSlotsFilled = (node: RuleNode | null): boolean => {
  if (!node) return false;
  if (node.type === 'terminal') return true;
  if (node.type === 'condition') {
    return areAllSlotsFilled(node.if) && areAllSlotsFilled(node.else);
  }
  return false;
};
