import { ReactNode, createContext, useContext, useReducer, Dispatch, FC } from 'react';
import { RuleNode } from '../../api/types';
import { ReadonlyPath } from './treeUtils';
import { setAtPath, updateAtPath } from './treeUtils';

export type EditorAction =
  | { type: 'set_slot'; path: ReadonlyPath; value: RuleNode | null }
  | { type: 'update_node'; path: ReadonlyPath; patch: Partial<RuleNode> }
  | { type: 'delete_subtree'; path: ReadonlyPath }
  | { type: 'set_root'; root: RuleNode | null }; // Added set_root action

interface EditorState {
  root: RuleNode | null;
}

const StateContext = createContext<EditorState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<EditorAction> | undefined>(undefined);

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'set_slot':
      const updatedRoot = setAtPath(state.root, action.path, action.value);
      return { ...state, root: updatedRoot };
    case 'update_node':
      const updatedNodeRoot = updateAtPath(state.root, action.path, (node: RuleNode | null) => {
        if (!node) return node; // If node is null, return as is

        if (node.type === 'condition') {
          return {
            ...node,
            ...action.patch,
            type: 'condition', // Explicitly set the type to 'condition'
            if: node.if, // Ensure child nodes are preserved
            else: node.else,
          };
        }

        if (node.type === 'terminal') {
          return {
            ...node,
            ...action.patch,
            type: 'terminal', // Explicitly set the type to 'terminal'
          };
        }

        return node; // Fallback for unexpected cases
      });

      return {
        ...state,
        root: updatedNodeRoot,
      };
    case 'delete_subtree':
      const rootAfterDelete = setAtPath(state.root, action.path, null);
      return { ...state, root: rootAfterDelete };
    case 'set_root':
      return { ...state, root: action.root }; // Handle set_root action
    default:
      console.warn('Unknown action type:', action.type); // Warn for unknown actions
      return state;
  }
};

export const EditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, { root: null });

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useEditorState = (): EditorState => {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useEditorState must be used within EditorProvider');
  return ctx;
};

export const useEditorDispatch = (): Dispatch<EditorAction> => {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useEditorDispatch must be used within EditorProvider');
  return ctx;
};
