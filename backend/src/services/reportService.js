const reportRepository = require('../repositories/reportRepository');
const { generateExcelReport, generatePdfReport } = require('../utils/exportHelper');
const { formatDate } = require('../helpers/quotationHelper');
const ApiError = require('../utils/ApiError');

class ReportService {
  /**
   * Get full dashboard reports & analytics payload in a single response
   */
  async getDashboardReport(filters = {}) {
    const [
      overview,
      statusDistribution,
      monthlyData,
      recentQuotationsRaw,
      topClientsRaw,
      employeeAssignmentsRaw,
    ] = await Promise.all([
      reportRepository.getOverviewMetrics(filters),
      reportRepository.getStatusDistribution(filters),
      reportRepository.getMonthlyAnalytics(filters),
      reportRepository.getRecentQuotations(filters),
      reportRepository.getTopClients(filters),
      reportRepository.getEmployeeUtilization(filters),
    ]);

    // Format top clients for pie chart
    const colors = ['#3B82F6', '#8B5CF6', '#0EA5E9', '#EF4444', '#10B981'];
    let topClientsPie = [];
    if (topClientsRaw.length > 5) {
      const top5 = topClientsRaw.slice(0, 5);
      const others = topClientsRaw.slice(5);
      const othersValue = others.reduce((sum, c) => sum + c.revenue, 0);
      const totalRevenue = topClientsRaw.reduce((sum, c) => sum + c.revenue, 0);
      
      topClientsPie = top5.map((c, i) => ({
        name: c.client_name,
        value: c.revenue,
        color: colors[i],
        percent: ((c.revenue / totalRevenue) * 100).toFixed(1) + '%'
      }));
      
      if (othersValue > 0) {
        topClientsPie.push({
          name: 'Others',
          value: othersValue,
          color: '#D1D5DB',
          percent: ((othersValue / totalRevenue) * 100).toFixed(1) + '%'
        });
      }
    } else {
      const totalRevenue = topClientsRaw.reduce((sum, c) => sum + c.revenue, 0);
      topClientsPie = topClientsRaw.map((c, i) => ({
        name: c.client_name,
        value: c.revenue,
        color: colors[i % colors.length],
        percent: totalRevenue > 0 ? ((c.revenue / totalRevenue) * 100).toFixed(1) + '%' : '0%'
      }));
    }

    const employeesTable = employeeAssignmentsRaw.map(e => ({
      name: e.employee_name,
      role: e.role,
      quotations: e.total_projects,
      revenue: e.total_cost_formatted,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(e.employee_name)}&background=f3f4f6&color=374151`
    }));

    const topClientsTable = topClientsRaw.map(c => ({
      client: c.client_name,
      quotations: c.projects,
      revenue: c.revenue_formatted
    }));

    const recentQuotations = recentQuotationsRaw.map(q => ({
      id: q.quotation_number,
      client: q.client,
      amount: q.amount_formatted,
      date: new Date(q.created_at).toLocaleDateString('en-GB')
    }));

    return {
      overview,
      quotationsTrend: monthlyData.monthly_quotations.map(m => ({ month: m.month, value: m.count })),
      revenueTrend: monthlyData.monthly_revenue.map(m => ({ month: m.month, value: m.revenue })),
      topClientsPie,
      recentQuotations,
      topClientsTable,
      employeesTable,
      // Restore old keys for exportHelper to prevent Excel/PDF from breaking
      quotation_status: statusDistribution,
      monthly_quotations: monthlyData.monthly_quotations,
      monthly_revenue: monthlyData.monthly_revenue,
      recent_quotations: recentQuotationsRaw,
      top_clients: topClientsRaw,
      employee_assignments: employeeAssignmentsRaw,
    };
  }

  /**
   * Export reports & analytics data in PDF or Excel format using shared data-fetching logic
   */
  async exportReport(filters = {}, res) {
    const format = (filters.format || 'excel').toLowerCase();
    const reportData = await this.getDashboardReport(filters);
    const filename = `Reports_Analytics_${formatDate(new Date())}`;

    if (format === 'excel' || format === 'xlsx') {
      const buffer = await generateExcelReport(reportData);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(buffer);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      return await generatePdfReport(reportData, filters, res);
    } else {
      throw ApiError.badRequest('Invalid export format. Must be "pdf" or "excel".');
    }
  }
}

module.exports = new ReportService();
