import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useState } from "react";
import { FaDownload, FaEye } from "react-icons/fa";
import { GrRefresh } from "react-icons/gr";
import useSecurityMonitoring from "../../../hooks/useSecurityMonitoring";
import DataTable from "../../../shared/DataTable/DataTable";

const SecurityDashboard = () => {
  const {
    securityStats,
    activityLogs,
    loading,
    error,
    refreshData,
    fetchActivityLogs,
  } = useSecurityMonitoring();

  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    action: "",
    userEmail: "",
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchActivityLogs(newFilters);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const exportLogs = async () => {
    try {
      const response = await fetch("/api/activity-logs/export?format=csv", {
        withCredentials: true,
      });
      const blob = await response.blob();
      console.log(blob, "blob");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security-logs-${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  // Only keep Total Activities card
  const securityCards = [
    {
      id: 1,
      title: "Total Activities",
      value: securityStats?.totalActivities || 0,
      icon: <FaEye className="text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  const columnHelper = createColumnHelper();

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

  if (loading) {
    return (
      <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Error loading security data: {error?.message}
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
          {securityStats?.lastUpdated && (
            <p className="text-sm text-gray-600 mt-1">
              Last updated:{" "}
              {(() => {
                try {
                  const date = new Date(securityStats.lastUpdated);
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

      {/* Only show Total Activities card */}
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

      {/* Only show Activity Logs table */}
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
