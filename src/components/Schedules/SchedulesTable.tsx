import { CSSProperties, FC } from 'react';
import { Table } from 'react-bootstrap';
import { ScheduledJob } from '../../api/schedule.types';
import DeleteButton from '../buttons/DeleteButton';
import DoubleChevronButton from '../buttons/DoubleChevronButton';
import ViewChangeLogButton from '../buttons/ViewChangeLogButton';
import RefreshButton from '../buttons/RefreshButton';

const getScheduleStateStyle = (state: string): CSSProperties => {
  if (state === 'FAILED') {
    return { color: '#dc3545' };
  }

  if (state === 'PROCESSING') {
    return { color: '#f0ad4e' };
  }

  return { color: 'black' };
};

const formatDueAt = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const getIntervalParts = (interval: number): { days: number; hours: number; minutes: number } => {
  const days = Math.floor(interval / (24 * 60));
  const remainingAfterDays = interval % (24 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;

  return { days, hours, minutes };
};

interface SchedulesTableProps {
  schedules: ScheduledJob[];
  onRefresh: () => void;
  onOpenLogs: (schedule: ScheduledJob) => void;
  onPrioritise: (profileId: number) => void;
  onDelete: (profileId: number) => void;
}

const SchedulesTable: FC<SchedulesTableProps> = ({
  schedules,
  onRefresh,
  onOpenLogs,
  onPrioritise,
  onDelete,
}) => (
  <div className="schedules-table-scroll">
    <Table striped hover responsive className="mb-0 schedules-table">
      <thead>
        <tr>
          <th>Seller Name</th>
          <th>Profile</th>
          <th>Due Date</th>
          <th>Days</th>
          <th>Hours</th>
          <th>Minutes</th>
          <th>State</th>
          <th className="text-end">
            <RefreshButton onClick={onRefresh} />
          </th>
        </tr>
      </thead>
      <tbody>
        {schedules.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-4 text-muted">
              No schedules found.
            </td>
          </tr>
        ) : (
          schedules.map((schedule) => {
            const interval = getIntervalParts(schedule.interval);

            return (
              <tr key={`${schedule.profile.profileId}`}>
                <td>{schedule.sellerName}</td>
                <td>{schedule.profile.countryCode}</td>
                <td>{formatDueAt(schedule.dueAt)}</td>
                <td>{interval.days}</td>
                <td>{interval.hours}</td>
                <td>{interval.minutes}</td>
                <td style={getScheduleStateStyle(schedule.state)}>
                  <strong>{schedule.state}</strong>
                </td>
                <td className="schedules-delete-cell">
                  <div className="schedules-row-actions">
                    <ViewChangeLogButton
                      className="schedules-view-log-btn"
                      onClick={() => onOpenLogs(schedule)}
                      buttonText="Schedule Logs"
                    />
                    <DoubleChevronButton
                      className="schedules-expand-btn"
                      onClick={() => onPrioritise(schedule.profile.profileId)}
                      disabled={
                        schedule.dueAt.getTime() <= Date.now() || schedule.state === 'PROCESSING'
                      }
                    />
                    <DeleteButton
                      className="schedules-delete-btn"
                      onClick={() => onDelete(schedule.profile.profileId)}
                      confirmation={{
                        title: 'Delete schedule?',
                        body: `This will remove the schedule for ${schedule.sellerName} - ${schedule.profile.countryCode}.`,
                        confirmLabel: 'Delete Schedule',
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  </div>
);

export default SchedulesTable;
