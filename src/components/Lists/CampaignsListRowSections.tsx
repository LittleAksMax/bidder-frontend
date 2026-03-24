import { FC, ReactNode } from 'react';
import './CampaignsList.css';

interface CampaignsListRowSectionsProps {
  nameSection: ReactNode;
  policySection: ReactNode;
  buttonsSection: ReactNode;
}

const CampaignsListRowSections: FC<CampaignsListRowSectionsProps> = ({
  nameSection,
  policySection,
  buttonsSection,
}) => {
  const hasPolicySection =
    policySection !== null && policySection !== undefined && policySection !== false;

  return (
    <div className="campaign-row-sections">
      {/* Name section */}
      <div className="campaign-row-name-section">{nameSection}</div>
      {/* Policy section */}
      {hasPolicySection ? (
        <div className="campaign-row-policy-section">{policySection}</div>
      ) : null}
      {/* Buttons section (assign/delete/edit) */}
      <div className="campaign-row-buttons-section">{buttonsSection}</div>
    </div>
  );
};

export default CampaignsListRowSections;
