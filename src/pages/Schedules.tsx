import { FC, useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { apiClient } from '../api/ApiClient';
import { ProfileGroup } from '../api/profile.types';
import { ScheduledJob } from '../api/schedule.types';
import BackToHomeButton from '../components/buttons/BackToHomeButton';
import UserLogsModal from '../components/Lists/UserLogsModal';
import PageToolbar from '../components/PageToolbar';
import ScheduleCreateForm, {
  ScheduleSellerGroup,
} from '../components/Schedules/ScheduleCreateForm';
import SchedulesTable from '../components/Schedules/SchedulesTable';
import Page from './Page';
import './Schedules.css';

const sortSchedulesByDueAt = (jobs: ScheduledJob[]): ScheduledJob[] =>
  [...jobs].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

type UserLogsContext = {
  profileId: number;
  profileLabel: string;
};

const Schedules: FC = () => {
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
  const unscheduledSellerGroups = useMemo<ScheduleSellerGroup[]>(() => {
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
      <PageToolbar right={<BackToHomeButton className="me-2" />} className="schedules-toolbar" />
      <Card className="schedules-card">
        <Card.Header className="bg-success text-white d-flex align-items-center schedules-header">
          <h2 className="mb-0">Schedules</h2>
        </Card.Header>
        <Card.Body className="p-0 d-flex flex-column schedules-body">
          <SchedulesTable
            schedules={sortedSchedules}
            onOpenLogs={(schedule) =>
              setUserLogsContext({
                profileId: schedule.profile.profileId,
                profileLabel: `${schedule.sellerName} - ${schedule.profile.countryCode}`,
              })
            }
            onPrioritise={(profileId) => void handlePrioritiseSchedule(profileId)}
            onDelete={(profileId) => void handleDeleteSchedule(profileId)}
          />
        </Card.Body>
        <Card.Footer className="schedules-footer">
          <div className="d-flex justify-content-end align-items-center schedules-footer-actions">
            <ScheduleCreateForm
              creating={creating}
              canCreate={canCreate}
              sellerGroups={unscheduledSellerGroups}
              selectedSellerName={effectiveSelectedSellerName}
              selectedProfileId={effectiveSelectedProfileId}
              profiles={sellerFilteredProfiles}
              intervalDays={intervalDays}
              intervalHours={intervalHours}
              intervalMinutes={intervalMinutes}
              onSellerNameChange={(sellerName) => {
                setSelectedSellerName(sellerName);
                setSelectedProfileId('');
              }}
              onProfileIdChange={setSelectedProfileId}
              onIntervalDaysChange={setIntervalDays}
              onIntervalHoursChange={setIntervalHours}
              onIntervalMinutesChange={setIntervalMinutes}
              onSubmit={() => void handleCreateSchedule()}
            />
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
