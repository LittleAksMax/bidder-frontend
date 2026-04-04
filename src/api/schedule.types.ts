import type { Profile } from './profile.types';

export type ScheduledJob = {
  profile: Profile;
  sellerName: string;
  dueAt: Date;
  interval: number;
  state: string;
};
