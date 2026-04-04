export type UserLogResponse = {
  log: string;
  timestamp: Date;
};

export type UserLogsPageResponse = {
  logs: UserLogResponse[];
  totalPages: number;
};

export type BidResponse = {
  adgroupId: string;
  oldPrice: number;
  newPrice: number;
  changeDate: Date;
  isLive: boolean;
};

export type ChangeLogEntry = BidResponse;

export type ChangeLogFilter = {
  startTime: string;
  endTime: string;
};

export type Pagination = {
  page?: number;
  pageSize?: number;
};

export type ChangeLogQuery = ChangeLogFilter & Pagination;

export type ChangeLogResult = {
  entries: BidResponse[];
  total: number;
};
