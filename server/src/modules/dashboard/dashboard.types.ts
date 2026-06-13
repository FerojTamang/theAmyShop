export type DashboardStatusCount<TStatus extends string> = {
  status: TStatus;
  count: number;
};

export type DailySalesOverview = {
  date: string;
  orderCount: number;
  revenue: number;
};
