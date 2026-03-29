import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/ApiClient';
import { ProfileGroup, ScheduledJob } from '../api/types';
import CreateButton from '../components/buttons/CreateButton';
import DeleteButton from '../components/buttons/DeleteButton';
import DoubleChevronButton from '../components/buttons/DoubleChevronButton';
import ViewChangeLogButton from '../components/buttons/ViewChangeLogButton';
import UserLogsModal from '../components/Lists/UserLogsModal';
import Page from './Page';
import './Schedules.css';

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

const sortSchedulesByDueAt = (jobs: ScheduledJob[]): ScheduledJob[] =>
  [...jobs].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

type UserLogsContext = {
  profileId: number;
  profileLabel: string;
};

const Schedules: FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
  const [sellerGroups, setSellerGroups] = useState<ProfileGroup[]>([]);
  const [selectedSellerName, setSelectedSellerName] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [intervalDays, setIntervalDays] = useState('');
  const [intervalHours, setIntervalHours] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState('');
  const [userLogsContext, setUserLogsContext] = useState<UserLogsContext | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSchedules = async (): Promise<void> => {
      const [scheduledJobs, sellerProfiles] = await Promise.all([
        apiClient.getScheduledJobs(),
        apiClient.getSellerProfiles(),
      ]);

      if (isMounted) {
        setSchedules(sortSchedulesByDueAt(scheduledJobs));
        setSellerGroups(sellerProfiles);
        setLoading(false);
      }
    };

    void loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const profiles = useMemo(() => sellerGroups.flatMap((seller) => seller.profiles), [sellerGroups]);
  const unscheduledProfiles = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          !schedules.some((schedule) => schedule.profile.profileId === profile.profileId),
      ),
    [profiles, schedules],
  );
  const unscheduledSellerGroups = useMemo(() => {
    const unscheduledProfileIds = new Set(unscheduledProfiles.map((profile) => profile.profileId));

    return sellerGroups
      .map((sellerGroup) => ({
        sellerName: sellerGroup.name,
        profiles: sellerGroup.profiles.filter((profile) =>
          unscheduledProfileIds.has(profile.profileId),
        ),
      }))
      .filter((sellerGroup) => sellerGroup.profiles.length > 0);
  }, [sellerGroups, unscheduledProfiles]);
  const sortedSchedules = useMemo(() => sortSchedulesByDueAt(schedules), [schedules]);

  const selectedSellerStillAvailable = unscheduledSellerGroups.some(
    (sellerGroup) => sellerGroup.sellerName === selectedSellerName,
  );
  const effectiveSelectedSellerName = selectedSellerStillAvailable
    ? selectedSellerName
    : (unscheduledSellerGroups[0]?.sellerName ?? '');
  const sellerFilteredProfiles =
    unscheduledSellerGroups.find(
      (sellerGroup) => sellerGroup.sellerName === effectiveSelectedSellerName,
    )?.profiles ?? [];

  const selectedProfileIdValue = Number.parseInt(selectedProfileId, 10);
  const selectedStillAvailable = sellerFilteredProfiles.some(
    (profile) => profile.profileId === selectedProfileIdValue,
  );
  const effectiveSelectedProfileId = selectedStillAvailable
    ? selectedProfileId
    : (sellerFilteredProfiles[0]?.profileId.toString() ?? '');

  const parsedDays = intervalDays.trim().length > 0 ? Number.parseInt(intervalDays, 10) : 0;
  const parsedHours = intervalHours.trim().length > 0 ? Number.parseInt(intervalHours, 10) : 0;
  const parsedMinutes =
    intervalMinutes.trim().length > 0 ? Number.parseInt(intervalMinutes, 10) : 0;
  const totalIntervalMinutes = parsedDays * 24 * 60 + parsedHours * 60 + parsedMinutes;
  const hasIntervalInput =
    intervalDays.trim().length > 0 ||
    intervalHours.trim().length > 0 ||
    intervalMinutes.trim().length > 0;
  const intervalIsValid =
    Number.isInteger(parsedDays) &&
    Number.isInteger(parsedHours) &&
    Number.isInteger(parsedMinutes) &&
    parsedDays >= 0 &&
    parsedHours >= 0 &&
    parsedMinutes >= 0 &&
    totalIntervalMinutes > 0;

  const canCreate =
    hasIntervalInput &&
    intervalIsValid &&
    effectiveSelectedSellerName.length > 0 &&
    effectiveSelectedProfileId.length > 0 &&
    !creating;

  const handleCreateSchedule = async (): Promise<void> => {
    if (!canCreate) {
      return;
    }

    const profileId = Number.parseInt(effectiveSelectedProfileId, 10);
    const interval = totalIntervalMinutes;

    if (Number.isNaN(profileId) || Number.isNaN(interval) || interval < 1) {
      return;
    }

    const profile =
      sellerFilteredProfiles.find((candidate) => candidate.profileId === profileId) ??
      unscheduledProfiles.find((candidate) => candidate.profileId === profileId) ??
      profiles.find((candidate) => candidate.profileId === profileId);

    if (!profile) {
      return;
    }

    const optimisticDueAt = new Date();
    optimisticDueAt.setMinutes(optimisticDueAt.getMinutes() + interval);

    const optimisticSchedule: ScheduledJob = {
      profile,
      sellerName: effectiveSelectedSellerName,
      dueAt: optimisticDueAt,
      interval,
      state: 'PROCESSING',
    };

    setSchedules((prev) => [...prev, optimisticSchedule]);
    setIntervalDays('');
    setIntervalHours('');
    setIntervalMinutes('');
    setCreating(true);

    const createdSchedule = await apiClient.createSchedule(
      profileId,
      interval,
      effectiveSelectedSellerName,
    );
    setCreating(false);

    if (!createdSchedule) {
      setSchedules((prev) => prev.filter((schedule) => schedule.profile.profileId !== profileId));
      return;
    }

    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.profile.profileId === profileId ? createdSchedule : schedule,
      ),
    );
  };

  const handleDeleteSchedule = async (profileId: number): Promise<void> => {
    const scheduleIndex = schedules.findIndex(
      (schedule) => schedule.profile.profileId === profileId,
    );
    if (scheduleIndex < 0) {
      return;
    }

    const removedSchedule = schedules[scheduleIndex]!;
    setSchedules((prev) => prev.filter((schedule) => schedule.profile.profileId !== profileId));

    const deleted = await apiClient.deleteSchedule(profileId);
    if (deleted) {
      return;
    }

    setSchedules((prev) => {
      if (prev.some((schedule) => schedule.profile.profileId === profileId)) {
        return prev;
      }
      const restored = [...prev];
      const insertIndex = Math.min(scheduleIndex, restored.length);
      restored.splice(insertIndex, 0, removedSchedule);
      return restored;
    });
  };

  const handlePrioritiseSchedule = async (profileId: number): Promise<void> => {
    setLoading(true);

    try {
      const prioritisedDueAt = await apiClient.prioritiseSchedule(profileId);

      if (!prioritisedDueAt) {
        return;
      }

      setSchedules((prev) =>
        sortSchedulesByDueAt(
          prev.map((schedule) =>
            schedule.profile.profileId === profileId
              ? { ...schedule, dueAt: prioritisedDueAt }
              : schedule,
          ),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page showSettings loading={loading}>
      <div className="w-100 d-flex justify-content-end mb-3 schedules-toolbar">
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/')} className="me-2">
          Back To Home
        </Button>
      </div>
      <Card className="schedules-card">
        <Card.Header className="bg-success text-white d-flex align-items-center schedules-header">
          <h2 className="mb-0">Schedules</h2>
        </Card.Header>
        <Card.Body className="p-0 d-flex flex-column schedules-body">
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No schedules found.
                    </td>
                  </tr>
                ) : (
                  sortedSchedules.map((schedule) => {
                    const intervalDaysValue = Math.floor(schedule.interval / (24 * 60));
                    const remainingAfterDays = schedule.interval % (24 * 60);
                    const intervalHoursValue = Math.floor(remainingAfterDays / 60);
                    const intervalMinutesValue = remainingAfterDays % 60;

                    return (
                      <tr key={`${schedule.profile.profileId}`}>
                        <td>{schedule.sellerName}</td>
                        <td>{schedule.profile.countryCode}</td>
                        <td>{formatDueAt(schedule.dueAt)}</td>
                        <td>{intervalDaysValue}</td>
                        <td>{intervalHoursValue}</td>
                        <td>{intervalMinutesValue}</td>
                        <td style={{ ...getScheduleStateStyle(schedule.state) }}>
                          <strong>{schedule.state}</strong>
                        </td>
                        <td className="schedules-delete-cell">
                          <div className="schedules-row-actions">
                            <ViewChangeLogButton
                              className="schedules-view-log-btn"
                              onClick={() =>
                                setUserLogsContext({
                                  profileId: schedule.profile.profileId,
                                  profileLabel: `${schedule.sellerName} - ${schedule.profile.countryCode}`,
                                })
                              }
                              buttonText="Schedule Logs"
                            />
                            <DoubleChevronButton
                              className="schedules-expand-btn"
                              onClick={() =>
                                void handlePrioritiseSchedule(schedule.profile.profileId)
                              }
                            />
                            <DeleteButton
                              className="schedules-delete-btn"
                              onClick={() => void handleDeleteSchedule(schedule.profile.profileId)}
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
        </Card.Body>
        <Card.Footer className="schedules-footer">
          <div className="d-flex justify-content-end align-items-center schedules-footer-actions">
            <Form
              className="d-flex align-items-center schedules-create-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateSchedule();
              }}
            >
              <div className="schedules-field-group">
                <Form.Label htmlFor="schedule-seller" className="mb-0 schedules-create-label">
                  Seller
                </Form.Label>
                <Form.Select
                  id="schedule-seller"
                  size="sm"
                  className="schedules-create-seller-select"
                  value={effectiveSelectedSellerName}
                  onChange={(event) => {
                    setSelectedSellerName(event.target.value);
                    setSelectedProfileId('');
                  }}
                  disabled={creating || unscheduledSellerGroups.length === 0}
                >
                  {unscheduledSellerGroups.length === 0 ? (
                    <option value="">No unscheduled sellers</option>
                  ) : (
                    unscheduledSellerGroups.map((sellerGroup) => (
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
                  value={effectiveSelectedProfileId}
                  onChange={(event) => setSelectedProfileId(event.target.value)}
                  disabled={creating || sellerFilteredProfiles.length === 0}
                >
                  {sellerFilteredProfiles.length === 0 ? (
                    <option value="">No unscheduled profiles</option>
                  ) : (
                    sellerFilteredProfiles.map((profile) => (
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
                  onChange={(event) => setIntervalDays(event.target.value)}
                  disabled={creating || sellerFilteredProfiles.length === 0}
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
                  onChange={(event) => setIntervalHours(event.target.value)}
                  disabled={creating || sellerFilteredProfiles.length === 0}
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
                  onChange={(event) => setIntervalMinutes(event.target.value)}
                  disabled={creating || sellerFilteredProfiles.length === 0}
                />
              </div>

              <CreateButton onClick={() => void handleCreateSchedule()} disabled={!canCreate} />
            </Form>
          </div>
        </Card.Footer>
      </Card>
      {userLogsContext ? (
        <UserLogsModal
          show
          onHide={() => setUserLogsContext(null)}
          profileId={userLogsContext.profileId}
          profileLabel={userLogsContext.profileLabel}
        />
      ) : null}
    </Page>
  );
};

export default Schedules;
