import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fiscalMonths = [
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
];

function getFiscalRange(yearBE: number) {
    const yearAD = yearBE - 543;

    return {
        startDate: new Date(yearAD - 1, 9, 1),
        endDate: new Date(
            yearAD,
            8,
            30,
            23,
            59,
            59
        ),
    };
}

function fiscalIndex(month: number) {
    return month >= 10
        ? month - 10
        : month + 2;
}

function getFiscalYear(date: Date) {
    return date.getMonth() >= 9
        ? date.getFullYear() + 544
        : date.getFullYear() + 543;
}

export async function GET(
    req: NextRequest
) {
    try {
        const currentBE =
            new Date().getMonth() >= 9
                ? new Date().getFullYear() + 544
                : new Date().getFullYear() + 543;

        const fiscalYear =
            Number(
                req.nextUrl.searchParams.get(
                    "year"
                )
            ) || currentBE;

        const {
            startDate,
            endDate,
        } = getFiscalRange(
            fiscalYear
        );

        const [
            newsRows,
            travelRows,
            vehicleRows,
            expenseRows,
        ] = await Promise.all([
            prisma.news_items.findMany({
                where: {
                    news_date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    news_date: true,
                },
            }),

            prisma.travel_requests.findMany({
                where: {
                    depart_date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    depart_date: true,
                },
            }),

            prisma.vehicle_requests.findMany({
                where: {
                    start_datetime: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    start_datetime: true,
                },
            }),

            prisma.expense_claims.findMany({
                where: {
                    claim_date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    claim_date: true,
                    total_amount: true,
                    expense_categories: {
                        select: {
                            cat_name: true,
                        },
                    },
                },
            }),
        ]);

        const newsChart =
            fiscalMonths.map(
                (month) => ({
                    month,
                    news: 0,
                })
            );

        const travelChart =
            fiscalMonths.map(
                (month) => ({
                    month,
                    travel: 0,
                })
            );

        const vehicleChart =
            fiscalMonths.map(
                (month) => ({
                    month,
                    vehicle: 0,
                })
            );

        newsRows.forEach((row) => {
            const index =
                fiscalIndex(
                    row.news_date.getMonth() +
                    1
                );

            newsChart[index].news++;
        });

        travelRows.forEach((row) => {
            const index =
                fiscalIndex(
                    row.depart_date.getMonth() +
                    1
                );

            travelChart[index]
                .travel++;
        });

        vehicleRows.forEach((row) => {
            const index =
                fiscalIndex(
                    row.start_datetime.getMonth() +
                    1
                );

            vehicleChart[index]
                .vehicle++;
        });

        const expenseMap =
            new Map<
                string,
                number
            >();

        let totalExpense = 0;

        expenseRows.forEach((row) => {
            const category =
                row.expense_categories
                    ?.cat_name ||
                "อื่นๆ";

            const amount = Number(
                row.total_amount || 0
            );

            totalExpense += amount;

            expenseMap.set(
                category,
                (expenseMap.get(
                    category
                ) || 0) + amount
            );
        });

        const expenseChart =
            Array.from(
                expenseMap.entries()
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );

        const fiscalYears =
            new Set<number>();

        newsRows.forEach((row) => {
            fiscalYears.add(
                getFiscalYear(
                    row.news_date
                )
            );
        });

        travelRows.forEach((row) => {
            fiscalYears.add(
                getFiscalYear(
                    row.depart_date
                )
            );
        });

        vehicleRows.forEach((row) => {
            fiscalYears.add(
                getFiscalYear(
                    row.start_datetime
                )
            );
        });

        expenseRows.forEach((row) => {
            fiscalYears.add(
                getFiscalYear(
                    row.claim_date
                )
            );
        });

        fiscalYears.add(
            currentBE
        );

        const availableYears =
            Array.from(
                fiscalYears
            ).sort(
                (a, b) => b - a
            );

        return NextResponse.json({
            fiscalYear,

            availableYears,

            summary: {
                news: newsRows.length,

                travel:
                    travelRows.length,

                vehicle:
                    vehicleRows.length,

                expense:
                    totalExpense,
            },

            newsChart,

            travelChart,

            vehicleChart,

            expenseChart,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message:
                    "Failed to load dashboard",
            },
            {
                status: 500,
            }
        );
    }
}

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// const fiscalMonths = [
//     "ต.ค.",
//     "พ.ย.",
//     "ธ.ค.",
//     "ม.ค.",
//     "ก.พ.",
//     "มี.ค.",
//     "เม.ย.",
//     "พ.ค.",
//     "มิ.ย.",
//     "ก.ค.",
//     "ส.ค.",
//     "ก.ย.",
// ];

// function getFiscalRange(yearBE: number) {
//     const yearAD = yearBE - 543;

//     return {
//         startDate: new Date(yearAD - 1, 9, 1),
//         endDate: new Date(yearAD, 8, 30, 23, 59, 59),
//     };
// }

// function fiscalIndex(month: number) {
//     return month >= 10
//         ? month - 10
//         : month + 2;
// }

// export async function GET(
//     req: NextRequest
// ) {
//     try {
//         const currentBE =
//             new Date().getMonth() >= 9
//                 ? new Date().getFullYear() + 544
//                 : new Date().getFullYear() + 543;

//         const fiscalYear =
//             Number(
//                 req.nextUrl.searchParams.get(
//                     "year"
//                 )
//             ) || currentBE;

//         const {
//             startDate,
//             endDate,
//         } = getFiscalRange(fiscalYear);

//         const [
//             newsRows,
//             travelRows,
//             vehicleRows,
//             expenseRows,
//         ] = await Promise.all([
//             prisma.news_items.findMany({
//                 where: {
//                     news_date: {
//                         gte: startDate,
//                         lte: endDate,
//                     },
//                 },
//                 select: {
//                     news_date: true,
//                 },
//             }),

//             prisma.travel_requests.findMany({
//                 where: {
//                     depart_date: {
//                         gte: startDate,
//                         lte: endDate,
//                     },
//                 },
//                 select: {
//                     depart_date: true,
//                 },
//             }),

//             prisma.vehicle_requests.findMany({
//                 where: {
//                     start_datetime: {
//                         gte: startDate,
//                         lte: endDate,
//                     },
//                 },
//                 select: {
//                     start_datetime: true,
//                 },
//             }),

//             prisma.expense_claims.findMany({
//                 where: {
//                     claim_date: {
//                         gte: startDate,
//                         lte: endDate,
//                     },
//                 },
//                 select: {
//                     claim_date: true,
//                     total_amount: true,
//                     expense_categories: {
//                         select: {
//                             cat_name: true,
//                         },
//                     },
//                 },
//             }),
//         ]);

//         const newsChart = fiscalMonths.map(
//             (month) => ({
//                 month,
//                 news: 0,
//             })
//         );

//         const travelChart =
//             fiscalMonths.map((month) => ({
//                 month,
//                 travel: 0,
//             }));

//         const vehicleChart =
//             fiscalMonths.map((month) => ({
//                 month,
//                 vehicle: 0,
//             }));

//         newsRows.forEach((row) => {
//             const index =
//                 fiscalIndex(
//                     row.news_date.getMonth() + 1
//                 );

//             newsChart[index].news++;
//         });

//         travelRows.forEach((row) => {
//             const index =
//                 fiscalIndex(
//                     row.depart_date.getMonth() +
//                     1
//                 );

//             travelChart[index].travel++;
//         });

//         vehicleRows.forEach((row) => {
//             const index =
//                 fiscalIndex(
//                     row.start_datetime.getMonth() +
//                     1
//                 );

//             vehicleChart[index].vehicle++;
//         });

//         const expenseMap =
//             new Map<string, number>();

//         let totalExpense = 0;

//         expenseRows.forEach((row) => {
//             const category =
//                 row.expense_categories
//                     ?.cat_name || "อื่นๆ";

//             const amount = Number(
//                 row.total_amount
//             );

//             totalExpense += amount;

//             expenseMap.set(
//                 category,
//                 (expenseMap.get(category) || 0) +
//                 amount
//             );
//         });

//         const expenseChart =
//             Array.from(
//                 expenseMap.entries()
//             ).map(([name, value]) => ({
//                 name,
//                 value,
//             }));

//         return NextResponse.json({
//             fiscalYear,

//             summary: {
//                 news: newsRows.length,
//                 travel: travelRows.length,
//                 vehicle: vehicleRows.length,
//                 expense: totalExpense,
//             },

//             newsChart,
//             travelChart,
//             vehicleChart,
//             expenseChart,
//         });
//     } catch (error) {
//         console.error(error);

//         return NextResponse.json(
//             {
//                 message:
//                     "Failed to load dashboard",
//             },
//             {
//                 status: 500,
//             }
//         );
//     }
// }