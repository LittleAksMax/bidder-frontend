import { FC, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/ApiClient';
import { Profile, ScheduledJob } from '../api/types';
import CreateButton from '../components/buttons/CreateButton';
import DeleteButton from '../components/buttons/DeleteButton';
import Page from './Page';
import './Schedules.css';

const Schedules: FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [intervalDays, setIntervalDays] = useState('');
  const [intervalHours, setIntervalHours] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState('');
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
        setSchedules(scheduledJobs);
        setProfiles(sellerProfiles.flatMap((seller) => seller.profiles));
        setLoading(false);
      }
    };

    void loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const unscheduledProfiles = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          !schedules.some((schedule) => schedule.profile.profileId === profile.profileId),
      ),
    [profiles, schedules],
  );

  const selectedProfileIdValue = Number.parseInt(selectedProfileId, 10);
  const selectedStillAvailable = unscheduledProfiles.some(
    (profile) => profile.profileId === selectedProfileIdValue,
  );
  const effectiveSelectedProfileId = selectedStillAvailable
    ? selectedProfileId
    : (unscheduledProfiles[0]?.profileId.toString() ?? '');

  const parsedDays = intervalDays.trim().length > 0 ? Number.parseInt(intervalDays, 10) : 0;
  const parsedHours = intervalHours.trim().length > 0 ? Number.parseInt(intervalHours, 10) : 0;
  const parsedMinutes = intervalMinutes.trim().length > 0 ? Number.parseInt(intervalMinutes, 10) : 0;
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
    hasIntervalInput && intervalIsValid && effectiveSelectedProfileId.length > 0 && !creating;

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
      unscheduledProfiles.find((candidate) => candidate.profileId === profileId) ??
      profiles.find((candidate) => candidate.profileId === profileId);

    if (!profile) {
      return;
    }

    const optimisticSchedule: ScheduledJob = {
      profile,
      dueAt: new Date(Date.now() + interval * 60_000),
      interval,
    };

    setSchedules((prev) => [...prev, optimisticSchedule]);
    setIntervalDays('');
    setIntervalHours('');
    setIntervalMinutes('');
    setCreating(true);

    const createdSchedule = await apiClient.createSchedule(profileId, interval);
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
    const scheduleIndex = schedules.findIndex((schedule) => schedule.profile.profileId === profileId);
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
                  <th>Profile</th>
                  <th>Due Date</th>
                  <th>Days</th>
                  <th>Hours</th>
                  <th>Minutes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No schedules found.
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => {
                    const intervalDaysValue = Math.floor(schedule.interval / (24 * 60));
                    const remainingAfterDays = schedule.interval % (24 * 60);
                    const intervalHoursValue = Math.floor(remainingAfterDays / 60);
                    const intervalMinutesValue = remainingAfterDays % 60;

                    return (
                      <tr key={`${schedule.profile.profileId}`}>
                        <td>{schedule.profile.countryCode}</td>
                        <td>{schedule.dueAt.toISOString()}</td>
                        <td>{intervalDaysValue}</td>
                        <td>{intervalHoursValue}</td>
                        <td>{intervalMinutesValue}</td>
                        <td className="schedules-delete-cell">
                          <DeleteButton
                            className="schedules-delete-btn"
                            onClick={() => void handleDeleteSchedule(schedule.profile.profileId)}
                          />
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
                <Form.Label htmlFor="schedule-profile" className="mb-0 schedules-create-label">
                  Profile
                </Form.Label>
                <Form.Select
                  id="schedule-profile"
                  size="sm"
                  className="schedules-create-select"
                  value={effectiveSelectedProfileId}
                  onChange={(event) => setSelectedProfileId(event.target.value)}
                  disabled={creating || unscheduledProfiles.length === 0}
                >
                  {unscheduledProfiles.length === 0 ? (
                    <option value="">No unscheduled profiles</option>
                  ) : (
                    unscheduledProfiles.map((profile) => (
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
                  disabled={creating || unscheduledProfiles.length === 0}
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
                  disabled={creating || unscheduledProfiles.length === 0}
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
                  disabled={creating || unscheduledProfiles.length === 0}
                />
              </div>

              <CreateButton onClick={() => void handleCreateSchedule()} disabled={!canCreate} />
            </Form>
          </div>
        </Card.Footer>
      </Card>
    </Page>
  );
};

export default Schedules;
