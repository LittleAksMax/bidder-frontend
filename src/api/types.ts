export type Product = {
  id: number;
  sku: string;
  name: string;
};

export type Adgroup = {
  id: number;
  name: string;
  products: Product[];
};

export type Campaign = {
  id: number;
  name: string;
  adgroups: Adgroup[];
  policy?: Policy; // Attach policy to campaign
};

export type ChangeLogEntry = {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  timestamp: string; // ISO string
};

export type Policy = {
  id: number;
  name: string;
};

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
  entries: ChangeLogEntry[];
  total: number;
};
