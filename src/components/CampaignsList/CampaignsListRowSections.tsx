import { FC, ReactNode, CSSProperties } from 'react';

interface CampaignsListRowSectionsProps {
  nameSection: ReactNode;
  policySection: ReactNode;
  buttonsSection: ReactNode;
  changeLogSection: ReactNode;
  style?: CSSProperties;
}

const CampaignsListRowSections: FC<CampaignsListRowSectionsProps> = ({
  nameSection,
  policySection,
  buttonsSection,
  changeLogSection,
  style,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', width: '100%', ...style }}>
    {/* Name section */}
    <div style={{ minWidth: 180, flex: '0 0 180px', display: 'flex', alignItems: 'center' }}>
      {nameSection}
    </div>
    {/* Policy section */}
    <div
      style={{
        minWidth: 160,
        flex: '0 0 160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {policySection}
    </div>
    {/* Buttons section (assign/delete/edit) */}
    <div
      style={{
        minWidth: 110,
        flex: '0 0 110px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
      }}
    >
      {buttonsSection}
    </div>
    {/* Change Log button section */}
    <div
      style={{
        minWidth: 180,
        flex: '0 0 180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {changeLogSection}
    </div>
  </div>
);

export default CampaignsListRowSections;
