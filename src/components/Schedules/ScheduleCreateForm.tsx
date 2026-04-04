import { FC, FormEvent } from 'react';
import { Form } from 'react-bootstrap';
import { Profile } from '../../api/profile.types';
import CreateButton from '../buttons/CreateButton';

export interface ScheduleSellerGroup {
  sellerName: string;
  profiles: Profile[];
}

interface ScheduleCreateFormProps {
  creating: boolean;
  canCreate: boolean;
  sellerGroups: ScheduleSellerGroup[];
  selectedSellerName: string;
  selectedProfileId: string;
  profiles: Profile[];
  intervalDays: string;
  intervalHours: string;
  intervalMinutes: string;
  onSellerNameChange: (sellerName: string) => void;
  onProfileIdChange: (profileId: string) => void;
  onIntervalDaysChange: (value: string) => void;
  onIntervalHoursChange: (value: string) => void;
  onIntervalMinutesChange: (value: string) => void;
  onSubmit: () => void;
}

const ScheduleCreateForm: FC<ScheduleCreateFormProps> = ({
  creating,
  canCreate,
  sellerGroups,
  selectedSellerName,
  selectedProfileId,
  profiles,
  intervalDays,
  intervalHours,
  intervalMinutes,
  onSellerNameChange,
  onProfileIdChange,
  onIntervalDaysChange,
  onIntervalHoursChange,
  onIntervalMinutesChange,
  onSubmit,
}) => {
  const sellerDisabled = creating || sellerGroups.length === 0;
  const profileDisabled = creating || profiles.length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Form className="d-flex align-items-center schedules-create-form" onSubmit={handleSubmit}>
      <div className="schedules-field-group">
        <Form.Label htmlFor="schedule-seller" className="mb-0 schedules-create-label">
          Seller
        </Form.Label>
        <Form.Select
          id="schedule-seller"
          size="sm"
          className="schedules-create-seller-select"
          value={selectedSellerName}
          onChange={(event) => onSellerNameChange(event.target.value)}
          disabled={sellerDisabled}
        >
          {sellerGroups.length === 0 ? (
            <option value="">No unscheduled sellers</option>
          ) : (
            sellerGroups.map((sellerGroup) => (
              <option key={sellerGroup.sellerName} value={sellerGroup.sellerName}>
                {sellerGroup.sellerName}
              </option>
            ))
          )}
        </Form.Select>
      </div>

      <div className="schedules-field-group">
        <Form.Label htmlFor="schedule-profile" className="mb-0 schedules-create-label">
          Profile
        </Form.Label>
        <Form.Select
          id="schedule-profile"
          size="sm"
          className="schedules-create-select"
          value={selectedProfileId}
          onChange={(event) => onProfileIdChange(event.target.value)}
          disabled={profileDisabled}
        >
          {profiles.length === 0 ? (
            <option value="">No unscheduled profiles</option>
          ) : (
            profiles.map((profile) => (
              <option key={profile.profileId} value={profile.profileId}>
                {profile.countryCode}
              </option>
            ))
          )}
        </Form.Select>
      </div>

      <div className="schedules-field-group">
        <Form.Label htmlFor="schedule-days" className="mb-0 schedules-create-label">
          Days
        </Form.Label>
        <Form.Control
          id="schedule-days"
          type="number"
          size="sm"
          min={0}
          step={1}
          className="schedules-create-duration"
          placeholder="0"
          value={intervalDays}
          onChange={(event) => onIntervalDaysChange(event.target.value)}
          disabled={profileDisabled}
        />
      </div>

      <div className="schedules-field-group">
        <Form.Label htmlFor="schedule-hours" className="mb-0 schedules-create-label">
          Hours
        </Form.Label>
        <Form.Control
          id="schedule-hours"
          type="number"
          size="sm"
          min={0}
          step={1}
          className="schedules-create-duration"
          placeholder="0"
          value={intervalHours}
          onChange={(event) => onIntervalHoursChange(event.target.value)}
          disabled={profileDisabled}
        />
      </div>

      <div className="schedules-field-group">
        <Form.Label htmlFor="schedule-minutes" className="mb-0 schedules-create-label">
          Minutes
        </Form.Label>
        <Form.Control
          id="schedule-minutes"
          type="number"
          size="sm"
          min={0}
          step={1}
          className="schedules-create-duration"
          placeholder="0"
          value={intervalMinutes}
          onChange={(event) => onIntervalMinutesChange(event.target.value)}
          disabled={profileDisabled}
        />
      </div>

      <CreateButton onClick={() => onSubmit()} disabled={!canCreate} />
    </Form>
  );
};

export default ScheduleCreateForm;
