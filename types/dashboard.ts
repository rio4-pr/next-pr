export interface MonthlyData {
    month: string;
    count: number;
}

export interface ExpenseData {
    name: string;
    amount: number;
}

export interface DashboardResponse {
    fiscalYear: number;

    summary: {
        news: number;
        travel: number;
        vehicle: number;
        expense: number;
    };

    newsChart: MonthlyData[];

    travelChart: MonthlyData[];

    vehicleChart: MonthlyData[];

    expenseChart: ExpenseData[];
}