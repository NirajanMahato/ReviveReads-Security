import { createColumnHelper } from "@tanstack/react-table";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format } from "date-fns";
import React, { useContext, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaEye,
  FaNetworkWired,
  FaShieldAlt,
  FaUserLock,
  FaUserShield,
} from "react-icons/fa";
import { GrRefresh } from "react-icons/gr";
import { UserContext } from "../../../context/UserContext";
import useSecurityMetrics from "../../../hooks/useSecurityMetrics";
import useSecurityMonitoring from "../../../hooks/useSecurityMonitoring";
import DataTable from "../../../shared/DataTable/DataTable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SecurityDashboard = () => {
  const { userInfo } = useContext(UserContext);
  const {
    securityMetrics,
    userActivityStats,
    bookListingsStats,
    loading,
    error,
    refreshData,
  } = useSecurityMonitoring();

  const {
    securityMetrics: metricsData,
    loading: metricsLoading,
    error: metricsError,
    refreshMetrics,
  } = useSecurityMetrics();

  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    action: "",
    userEmail: "",
  });

  // Mock data for DataTable components since the current hook doesn't provide detailed logs
  const [securityEvents] = useState([
    {
      id: 1,
      createdAt: new Date().toISOString(),
      action: "LOGIN_FAILED",
      severity: "medium",
      userEmail: "user@example.com",
      ipAddress: "192.168.1.1",
      details: "Multiple failed login attempts",
    },
    {
      id: 2,
      createdAt: new Date().toISOString(),
      action: "SUSPICIOUS_ACTIVITY",
      severity: "high",
      userEmail: "admin@example.com",
      ipAddress: "10.0.0.1",
      details: "Unusual access pattern detected",
    },
  ]);

  const [activityLogs] = useState({
    logs: [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        action: "USER_LOGIN",
        severity: "low",
        status: "success",
        userEmail: "user@example.com",
        ipAddress: "192.168.1.1",
        details: "Successful login",
      },
      {
        id: 2,
        createdAt: new Date().toISOString(),
        action: "BOOK_CREATED",
        severity: "low",
        status: "success",
        userEmail: "seller@example.com",
        ipAddress: "10.0.0.2",
        details: "New book listing created",
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
    },
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // In a real implementation, this would call fetchActivityLogs(newFilters)
  };

  const handleRefresh = () => {
    refreshData();
    refreshMetrics();
  };

  const exportLogs = async () => {
    try {
      const response = await fetch("/api/activity-logs/export?format=csv", {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
        credentials: "include",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security-logs-${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  // Security Summary Cards - using metricsData instead of securityStats
  const securityCards = [
    {
      id: 1,
      title: "Total Users",
      value: metricsData?.totalUsers || 0,
      icon: <FaEye className="text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: 2,
      title: "Security Events (1h)",
      value: metricsData?.recentSecurityEvents || 0,
      icon: <FaExclamationTriangle className="text-red-500" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      id: 3,
      title: "Failed Logins (1h)",
      value: metricsData?.failedLogins || 0,
      icon: <FaShieldAlt className="text-orange-500" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: 4,
      title: "Suspicious Activities (1h)",
      value: metricsData?.suspiciousActivities || 0,
      icon: <FaUserShield className="text-purple-500" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  // Real-time Security Metrics Cards
  const realTimeCards = [
    {
      id: 1,
      title: "Failed Logins (1h)",
      value: metricsData?.failedLogins || 0,
      icon: <FaUserLock className="text-red-500" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      alert: (metricsData?.failedLogins || 0) > 5,
    },
    {
      id: 2,
      title: "Suspicious Activities (1h)",
      value: metricsData?.suspiciousActivities || 0,
      icon: <FaExclamationTriangle className="text-orange-500" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      alert: (metricsData?.suspiciousActivities || 0) > 0,
    },
    {
      id: 3,
      title: "Rate Limit Violations (1h)",
      value: metricsData?.rateLimitViolations || 0,
      icon: <FaNetworkWired className="text-yellow-500" />,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      alert: (metricsData?.rateLimitViolations || 0) > 10,
    },
    {
      id: 4,
      title: "Locked Accounts",
      value: metricsData?.lockedAccounts || 0,
      icon: <FaUserLock className="text-gray-500" />,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      alert: (metricsData?.lockedAccounts || 0) > 0,
    },
  ];

  // System Health Cards
  const systemHealthCards = [
    {
      id: 1,
      title: "Total Users",
      value: metricsData?.totalUsers || 0,
      icon: <FaEye className="text-green-500" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: 2,
      title: "Active Users",
      value: metricsData?.activeUsers || 0,
      icon: <FaUserShield className="text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: 3,
      title: "Active Rate",
      value:
        (metricsData?.totalUsers || 0) > 0
          ? `${Math.round(
              ((metricsData?.activeUsers || 0) /
                (metricsData?.totalUsers || 1)) *
                100
            )}%`
          : "0%",
      icon: <FaClock className="text-purple-500" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  // Chart Data - using available data or fallback
  const hourlyActivityData = {
    labels: userActivityStats?.map((stat) => stat._id) || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        label: "User Registrations",
        data: userActivityStats?.map((stat) => stat.count) || [
          0, 0, 0, 0, 0, 0, 0,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const severityDistributionData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        data: [10, 5, 3, 1], // Fallback data
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green for low
          "rgba(59, 130, 246, 0.8)", // Blue for medium
          "rgba(249, 115, 22, 0.8)", // Orange for high
          "rgba(239, 68, 68, 0.8)", // Red for critical
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const topActionsData = {
    labels: metricsData?.topActions?.map((action) =>
      action._id.replace(/_/g, " ")
    ),
    datasets: [
      {
        label: "Action Count",
        data: metricsData?.topActions?.map((action) => action.count),
        backgroundColor: "rgba(147, 51, 234, 0.6)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 1,
      },
    ],
  };

  const securityEventTrendsData = {
    labels: metricsData?.securityEventTrends?.map((trend) => trend._id) || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        label: "Security Events",
        data: metricsData?.securityEventTrends?.map((trend) => trend.count) || [
          0, 0, 0, 0, 0, 0, 0,
        ],
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Table Columns for Security Events
  const columnHelper = createColumnHelper();
  const securityEventColumns = [
    columnHelper.accessor("createdAt", {
      header: "Timestamp",
      cell: (info) => {
        const dateValue = info.getValue();
        if (!dateValue) return "N/A";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return "Invalid Date";
          return format(date, "dd MMM yyyy, HH:mm:ss");
        } catch (error) {
          return "Invalid Date";
        }
      },
    }),
    columnHelper.accessor("userEmail", {
      header: "User",
      cell: (info) => info.getValue() || "Anonymous",
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => {
        const action = info.getValue();
        return action ? action.replace(/_/g, " ") : "N/A";
      },
    }),
    columnHelper.accessor("severity", {
      header: "Severity",
      cell: (info) => {
        const severity = info.getValue();
        if (!severity) return "N/A";
        const colors = {
          low: "text-green-700 bg-green-100",
          medium: "text-blue-700 bg-blue-100",
          high: "text-orange-700 bg-orange-100",
          critical: "text-red-700 bg-red-100",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              colors[severity] || "text-gray-700 bg-gray-100"
            }`}
          >
            {severity.toUpperCase()}
          </span>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("details", {
      header: "Details",
      cell: (info) => {
        const details = info.getValue();
        if (typeof details === "object" && details !== null) {
          return details?.reason || details?.method || "N/A";
        }
        return details || "N/A";
      },
    }),
  ];

  // Table Columns for Activity Logs
  const activityLogColumns = [
    columnHelper.accessor("createdAt", {
      header: "Timestamp",
      cell: (info) => {
        const dateValue = info.getValue();
        if (!dateValue) return "N/A";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return "Invalid Date";
          return format(date, "dd MMM yyyy, HH:mm:ss");
        } catch (error) {
          return "Invalid Date";
        }
      },
    }),
    columnHelper.accessor("userEmail", {
      header: "User",
      cell: (info) => info.getValue() || "Anonymous",
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => {
        const action = info.getValue();
        return action ? action.replace(/_/g, " ") : "N/A";
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        if (!status) return "N/A";
        const colors = {
          success: "text-green-700 bg-green-100",
          failed: "text-red-700 bg-red-100",
          warning: "text-yellow-700 bg-yellow-100",
          info: "text-blue-700 bg-blue-100",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              colors[status] || "text-gray-700 bg-gray-100"
            }`}
          >
            {status.toUpperCase()}
          </span>
        );
      },
    }),
    columnHelper.accessor("severity", {
      header: "Severity",
      cell: (info) => {
        const severity = info.getValue();
        if (!severity) return "N/A";
        const colors = {
          low: "text-green-700 bg-green-100",
          medium: "text-blue-700 bg-blue-100",
          high: "text-orange-700 bg-orange-100",
          critical: "text-red-700 bg-red-100",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              colors[severity] || "text-gray-700 bg-gray-100"
            }`}
          >
            {severity.toUpperCase()}
          </span>
        );
      },
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: (info) => info.getValue() || "N/A",
    }),
  ];

  // Table Columns for Suspicious IPs
  const suspiciousIPColumns = [
    columnHelper.accessor("_id", {
      header: "IP Address",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("count", {
      header: "Event Count",
      cell: (info) => info.getValue() || 0,
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        const actions = info.getValue();
        if (!Array.isArray(actions)) return "N/A";
        return (
          actions.slice(0, 3).join(", ") + (actions.length > 3 ? "..." : "")
        );
      },
    }),
  ];

  if (loading || metricsLoading) {
    return (
      <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || metricsError) {
    return (
      <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Error loading security data:{" "}
            {error?.message || metricsError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Security Monitoring Dashboard
          </h1>
          {securityMetrics?.lastUpdated && (
            <p className="text-sm text-gray-600 mt-1">
              Last updated:{" "}
              {(() => {
                try {
                  const date = new Date(securityMetrics.lastUpdated);
                  if (isNaN(date.getTime())) return "Invalid Date";
                  return format(date, "dd MMM yyyy, HH:mm:ss");
                } catch (error) {
                  return "Invalid Date";
                }
              })()}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <GrRefresh className="mr-2" />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Real-time Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {realTimeCards.map((card) => (
          <div
            key={card.id}
            className={`${card.bgColor} border ${
              card.borderColor
            } rounded-lg p-6 shadow-sm relative ${
              card.alert ? "ring-2 ring-red-200" : ""
            }`}
          >
            {card.alert && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {systemHealthCards.map((card) => (
          <div
            key={card.id}
            className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {securityCards.map((card) => (
          <div
            key={card.id}
            className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">24-Hour Activity Trend</h3>
          <Line
            data={hourlyActivityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Security Event Trends (7 Days)
          </h3>
          <Line
            data={securityEventTrendsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
          <Doughnut
            data={severityDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Actions</h3>
          <Bar
            data={topActionsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Suspicious IP Addresses */}
      {securityMetrics?.topSuspiciousIPs?.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Suspicious IP Addresses (24h)
            </h3>
          </div>
          <div className="p-6">
            <DataTable
              data={securityMetrics?.topSuspiciousIPs}
              columns={suspiciousIPColumns}
              pagination={false}
            />
          </div>
        </div>
      )}

      {/* Security Events Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Security Events
          </h3>
        </div>
        <div className="p-6">
          <DataTable
            data={securityEvents}
            columns={securityEventColumns}
            pagination={false}
          />
        </div>
      </div>

      {/* Activity Logs with Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Logs
            </h3>
            <div className="flex space-x-2">
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange("severity", e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.userEmail}
                onChange={(e) =>
                  handleFilterChange("userEmail", e.target.value)
                }
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            data={activityLogs?.logs || []}
            columns={activityLogColumns}
            pagination={activityLogs?.pagination}
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
