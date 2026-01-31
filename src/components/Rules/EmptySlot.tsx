import React, { FC, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import CreateButton from '../buttons/CreateButton';
import { VARIABLE_TYPES, VariableType } from '../../api/types';

interface EmptySlotProps {
  onAddCondition: null | (() => void);
  onAddTerminal: () => void;
  availableVars: VariableType[];
}

export const EmptySlot: FC<EmptySlotProps> = ({ onAddCondition, onAddTerminal, availableVars }) => {
  const noVars = availableVars.length === 0;

  return (
    <div
      style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '0.5rem 0', width: '80%' }}
    >
      {onAddCondition && !noVars && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="add-condition-tooltip">
              Add Condition ({availableVars.length} remaining)
            </Tooltip>
          }
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <CreateButton onClick={onAddCondition} />
            <span style={{ marginLeft: 6 }}>Add Condition</span>
          </div>
        </OverlayTrigger>
      )}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <CreateButton onClick={onAddTerminal} />
        <span style={{ marginLeft: 6 }}>Add Terminal</span>
      </div>
    </div>
  );
};
