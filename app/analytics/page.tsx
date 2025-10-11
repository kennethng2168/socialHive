"use client";

import { AppLayout } from "@/components/app-layout";
import { AnalyticsWordCloud } from "@/components/word-cloud";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive analytics and insights for your social media performance. Track trends, analyze hashtags, and optimize your content strategy.
            </p>
          </div>

          {/* Analytics Content */}
          <AnalyticsWordCloud />
          {/* <AnalyticsDashboard /> */}
        </div>
      </div>
    </AppLayout>
  );
}
