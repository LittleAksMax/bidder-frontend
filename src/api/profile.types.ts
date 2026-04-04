export type Profile = {
  profileId: number;
  countryCode: string;
  region: string;
  accountId: string;
  accountName: string;
  accountType: string;
};

export type ProfileGroup = {
  id: string;
  name: string;
  profiles: Profile[];
};
