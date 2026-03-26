"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  RefreshCw,
  Download,
  Activity,
  Clock,
  UserPlus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart
} from "lucide-react";

export default function UserCount() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [previousUserCount, setPreviousUserCount] = useState<number | null>(null);
  const [previousVisitCount, setPreviousVisitCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock historical data for graphs
  const userHistory = {
    day: [45, 52, 48, 55, 62, 58, 65],
    week: [320, 345, 368, 392, 415, 438, 462],
    month: [1250, 1320, 1380, 1450, 1520, 1580, 1650]
  };
  
  const visitHistory = {
    day: [320, 380, 350, 420, 400, 450, 480],
    week: [2450, 2580, 2720, 2890, 3010, 3150, 3320],
    month: [9850, 10200, 10750, 11300, 11850, 12400, 13000]
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Store previous values for change calculation
      if (userCount) setPreviousUserCount(userCount);
      if (visitCount) setPreviousVisitCount(visitCount);

      const [res1, res2] = await Promise.all([
        fetch("http://localhost:8000/users/count"),
        fetch("http://localhost:8000/users/usercount")
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error("Failed to fetch data");
      }

      const totalUsers = await res1.json();
      const visitData = await res2.json();

      setUserCount(totalUsers);
      setVisitCount(visitData.visit_count);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    // Create CSV data
    const csvData = `Metric,Value,Timestamp\nTotal Users,${userCount},${new Date().toISOString()}\nTotal Visits,${visitCount},${new Date().toISOString()}`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate changes
  const userChange = previousUserCount && userCount 
    ? ((userCount - previousUserCount) / previousUserCount * 100).toFixed(1)
    : '+2.5'; // Mock change

  const visitChange = previousVisitCount && visitCount
    ? ((visitCount - previousVisitCount) / previousVisitCount * 100).toFixed(1)
    : '+3.8'; // Mock change

  const currentHistory = timeRange === 'day' ? userHistory.day : 
                        timeRange === 'week' ? userHistory.week : 
                        userHistory.month;

  const maxUserValue = Math.max(...currentHistory);
  const maxVisitValue = Math.max(...visitHistory[timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-400" />
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <button
              onClick={handleRefresh}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export data"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards with Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Total Users Card with Graph */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    {isLoading ? (
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-800">{userCount?.toLocaleString() ?? '0'}</p>
                    )}
                  </div>
                </div>
                
                {/* Change Indicator */}
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  Number(userChange) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {Number(userChange) >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">{Math.abs(Number(userChange))}%</span>
                </div>
              </div>

              {/* User Growth Mini Graph */}
              <div className="mt-6 h-20 flex items-end space-x-1">
                {currentHistory.map((value, index) => {
                  const height = (value / maxUserValue) * 60;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group/bar">
                      <div className="relative w-full">
                        <div 
                          className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t hover:from-purple-600 hover:to-blue-600 transition-all duration-300 cursor-pointer"
                          style={{ height: `${height}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {value} users
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Total Visits Card with Graph */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Visits</p>
                    {isLoading ? (
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-800">{visitCount?.toLocaleString() ?? '0'}</p>
                    )}
                  </div>
                </div>
                
                {/* Change Indicator */}
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  Number(visitChange) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {Number(visitChange) >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">{Math.abs(Number(visitChange))}%</span>
                </div>
              </div>

              {/* Visit Growth Mini Graph */}
              <div className="mt-6 h-20 flex items-end space-x-1">
                {visitHistory[timeRange].map((value, index) => {
                  const height = (value / maxVisitValue) * 60;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group/bar">
                      <div className="relative w-full">
                        <div 
                          className="bg-gradient-to-t from-purple-600 to-pink-600 rounded-t hover:from-pink-600 hover:to-purple-600 transition-all duration-300 cursor-pointer"
                          style={{ height: `${height}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {value} visits
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">10</p>
            <p className="text-xs text-gray-500">Active Users Now</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">+3</p>
            <p className="text-xs text-gray-500">New Today</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">4.2</p>
            <p className="text-xs text-gray-500">Avg. Visits/User</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">68%</p>
            <p className="text-xs text-gray-500">Retention Rate</p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-gray-600"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Detailed Analytics</span>
          <TrendingUp className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {/* Detailed Analytics Section */}
        {showDetails && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Analytics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Daily Active Users</span>
                  <span className="font-medium text-gray-800">1,234 (↑12%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Weekly Active Users</span>
                  <span className="font-medium text-gray-800">8,456 (↑8%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Monthly Active Users</span>
                  <span className="font-medium text-gray-800">24,789 (↑15%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-600 to-orange-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>

            {/* Week-over-Week Comparison */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Week-over-Week Comparison</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">This Week</p>
                  <p className="text-lg font-bold text-gray-800">12.4k</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Week</p>
                  <p className="text-lg font-bold text-gray-800">11.2k</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-green-600 flex items-center">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    +10.7% increase from last week
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}