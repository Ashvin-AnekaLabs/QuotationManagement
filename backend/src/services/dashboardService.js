const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
  /**
   * Fetch all dashboard datasets concurrently
   */
  async getDashboardData() {
    const [
      metrics,
      monthlyQuotations,
      recentActivity,
      recentQuotations,
    ] = await Promise.all([
      dashboardRepository.getMetrics(),
      dashboardRepository.getMonthlyQuotations(),
      dashboardRepository.getRecentActivity(),
      dashboardRepository.getRecentQuotations(),
    ]);

    return {
      metrics,
      monthly_quotations: monthlyQuotations,
      recent_activity: recentActivity,
      recent_quotations: recentQuotations,
    };
  }
}

module.exports = new DashboardService();
