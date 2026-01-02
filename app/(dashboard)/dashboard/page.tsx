"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/Overview";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { AlertCircle, BedDouble, CalendarCheck, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // FOR SHOWCASE: We skip the API call and set dummy data directly
            const dummyStats = {
                totalRevenue: 125450,
                activeBookings: 8,
                occupancyRate: 72,
                totalGuests: 142,
                chartData: [
                    { name: "Jan", total: 2400 },
                    { name: "Feb", total: 1398 },
                    { name: "Mar", total: 9800 },
                    { name: "Apr", total: 3908 },
                    { name: "May", total: 4800 },
                    { name: "Jun", total: 3800 },
                ],
                recentBookings: [
                    { id: "1", guestName: "John Doe", roomNumber: "101", status: "Confirmed", amount: 5000 },
                    { id: "2", guestName: "Jane Smith", roomNumber: "204", status: "Checked_In", amount: 3500 },
                ]
            };

            setStats(dummyStats);
            setUser({ username: "Guest Viewer" }); // Fallback for the welcome message

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [range]);

    if (loading && !stats) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 flex items-center justify-center text-red-500 gap-2">
            <AlertCircle className="w-5 h-5" />
            Error: {error}
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Welcome back, {user?.username || 'Admin'}
                    </h2>
                    <p className="text-slate-400">
                        Here's what's happening at your hotel today.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-none shadow-lg">
                    {/* ... (Cards content remains same, just need to ensure 'stats' exists before accessing) */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-white/75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ₱{Number(stats?.totalRevenue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-indigo-100">
                            Lifetime collected
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Active Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+{stats?.activeBookings || 0}</div>
                        <p className="text-xs text-slate-500">
                            Confirmed or Checked In
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Occupancy Rate</CardTitle>
                        <BedDouble className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{Math.round(stats?.occupancyRate || 0)}%</div>
                        <p className="text-xs text-slate-500">
                            Of available rooms
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total Guests</CardTitle>
                        <Users className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+{stats?.totalGuests || 0}</div>
                        <p className="text-xs text-slate-500">
                            Registered profiles
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-slate-800 text-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white">Revenue Overview</CardTitle>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            {['daily', 'monthly', 'yearly'].map((timeRange) => (
                                <button
                                    key={timeRange}
                                    onClick={() => setRange(timeRange)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${range === timeRange
                                            ? 'bg-slate-600 text-white shadow'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {timeRange}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.chartData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-slate-800 text-slate-200">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <div className="text-sm text-slate-400">
                            Latest confirmed reservations
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RecentBookings data={stats.recentBookings} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
