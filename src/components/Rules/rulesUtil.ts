import { binSearchContains } from '../../util/miscalgorithms';
import { VARIABLE_TYPES } from '../../api/types';

export const gradientColors = [
  '#EAF2FF', // 0 - pastel blue
  '#E9F3FA', // 1 - blue-cyan
  '#E8F4F3', // 2 - teal-mint
  '#EAF6EC', // 3 - soft green
  '#F1F8E6', // 4 - yellow-green
  '#FFF8E3', // 5 - pale yellow
  '#FFF1E6', // 6 - peach
  '#FDE9EA', // 7 - soft coral
  '#F8E4E8', // 8 - rose
  '#F6E2E4', // 9 - pastel red
];

export const _percentageVariables = ['acos', 'cpc', 'ctr', 'roas'];
export const isPercentageVariable = (variable: string): boolean => {
  return binSearchContains(_percentageVariables, variable);
};

export const defaultVariableRanges: Record<string, { min: number; max: number }> = {
  impressions: { min: 0, max: 1000000 },
  clicks: { min: 0, max: 10000 },
  ctr: { min: 0, max: 100 },
  spend: { min: 0, max: 100000 },
  cpc: { min: 0, max: 10 },
  orders: { min: 0, max: 1000 },
  sales: { min: 0, max: 1000000 },
  acos: { min: 0, max: 100 },
  roas: { min: 0, max: 1000 },
  // Default range for unspecified variables
  default: { min: 0, max: 100 },
};
