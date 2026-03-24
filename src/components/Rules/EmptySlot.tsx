import { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import CreateButton from '../buttons/CreateButton';
import { VariableType } from '../../api/types';
import './styles/RuleNodes.css';

interface EmptySlotProps {
  onAddCondition: null | (() => void);
  onAddTerminal: () => void;
  availableVars: VariableType[];
}

export const EmptySlot: FC<EmptySlotProps> = ({ onAddCondition, onAddTerminal, availableVars }) => {
  const noVars = availableVars.length === 0;

  return (
    <div className="empty-slot-root">
      {onAddCondition && !noVars && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="add-condition-tooltip">
              Add Condition ({availableVars.length} remaining)
            </Tooltip>
          }
        >
          <div className="empty-slot-action">
            <CreateButton onClick={onAddCondition} />
            <span className="empty-slot-label">Add Condition</span>
          </div>
        </OverlayTrigger>
      )}
      <div className="empty-slot-action">
        <CreateButton onClick={onAddTerminal} />
        <span className="empty-slot-label">Add Terminal</span>
      </div>
    </div>
  );
};
