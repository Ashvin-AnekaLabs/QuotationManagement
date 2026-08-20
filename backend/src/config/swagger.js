const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Quotation Management System API',
    version: '1.0.0',
    description: '.',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Default Base Server',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your JWT access token directly here (without Bearer prefix)',
      },
    },
    schemas: {
      ClientInput: {
        type: 'object',
        required: ['email'],
        properties: {
          company_name: { type: 'string', example: 'TechNova Solutions Pvt. Ltd.' },
          contact_person: { type: 'string', example: 'Mr. Rahul Verma' },
          email: { type: 'string', example: 'rahul.verma@technova.com' },
          phone: { type: 'string', example: '+91 98765 43210' },
          address: { type: 'string', example: '12, Software Park, Sector 62, Noida, UP 201301' },
          website: { type: 'string', example: 'www.technova.com' },
          pan_number: { type: 'string', example: 'AABCT1234Q' },
          gst_number: { type: 'string', example: '09AABCT1234Q1Z5' },
          currency: { type: 'string', example: 'INR' },
          country: { type: 'string', example: 'India' },
          state: { type: 'string', example: 'Uttar Pradesh' },
          city: { type: 'string', example: 'Noida' },
          district: { type: 'string', example: 'Noida' },
          status: { type: 'string', example: 'ACTIVE' },
        },
      },
      ClientResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          company_name: { type: 'string', example: 'TechNova Solutions Pvt. Ltd.' },
          contact_person: { type: 'string', example: 'Mr. Rahul Verma' },
          name: { type: 'string', example: 'Mr. Rahul Verma' },
          email: { type: 'string', example: 'rahul.verma@technova.com' },
          phone: { type: 'string', example: '+91 98765 43210' },
          address: { type: 'string', example: '12, Software Park, Sector 62, Noida, UP 201301' },
          website: { type: 'string', example: 'www.technova.com' },
          pan_number: { type: 'string', example: 'AABCT1234Q' },
          gst_number: { type: 'string', example: '09AABCT1234Q1Z5' },
          currency: { type: 'string', example: 'INR' },
          country: { type: 'string', example: 'India' },
          state: { type: 'string', example: 'Uttar Pradesh' },
          city: { type: 'string', example: 'Noida' },
          district: { type: 'string', example: 'Noida' },
          status: { type: 'string', example: 'ACTIVE' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      EmployeeInput: {
        type: 'object',
        required: ['name', 'email', 'hourly_rate'],
        properties: {
          name: { type: 'string', example: 'Rahul Sharma' },
          employee_code: { type: 'string', example: 'EMP001' },
          email: { type: 'string', example: 'rahul.sharma@quotemaster.com' },
          phone: { type: 'string', example: '+91 98765 00001' },
          role: { type: 'string', example: 'Project Manager' },
          designation: { type: 'string', example: 'Project Manager' },
          department: { type: 'string', example: 'Engineering' },
          hourly_rate: { type: 'number', example: 1500.0 },
          assigned_project: { type: 'string', example: 'Enterprise System' },
        },
      },
      EmployeeResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          employee_code: { type: 'string', example: 'EMP001' },
          name: { type: 'string', example: 'Rahul Sharma' },
          email: { type: 'string', example: 'rahul.sharma@quotemaster.com' },
          phone: { type: 'string', example: '+91 98765 00001' },
          role: { type: 'string', example: 'Project Manager' },
          designation: { type: 'string', example: 'Project Manager' },
          department: { type: 'string', example: 'Engineering' },
          hourly_rate: { type: 'number', example: 1500.0 },
          hourly_rate_formatted: { type: 'string', example: '₹ 1,500.00' },
          assigned_project: { type: 'string', example: 'Enterprise System' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      QuotationInput: {
        type: 'object',
        properties: {
          client_id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Enterprise Management System Development' },
          description: { type: 'string', example: 'Custom ERP system for TechNova Solutions' },
          opportunity_name: { type: 'string', example: 'ERP Implementation - TechNova' },
          proposal_date: { type: 'string', format: 'date', example: '2026-08-06' },
          valid_till: { type: 'string', format: 'date', example: '2026-09-06' },
          revision_version: { type: 'string', example: '1.0' },
          prepared_by_id: { type: 'integer', example: 1 },
          prepared_by_designation: { type: 'string', example: 'Sales Executive' },
          prepared_by_department: { type: 'string', example: 'Sales' },
          engagement_type: { type: 'string', example: 'Fixed Price' },
          pricing_currency: { type: 'string', example: 'INR' },
          exchange_rate: { type: 'number', example: 1.0 },
          logo: { type: 'string', description: 'Base64 encoded logo image data URI', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          billing_address: { type: 'string', example: '123 Business Park, Tech Zone, Sector 62, Noida, UP 201301' },
          shipping_address: { type: 'string', example: '123 Business Park, Tech Zone, Sector 62, Noida, UP 201301' },
          pincode: { type: 'string', example: '201301' },
          wizard_step: { type: 'integer', example: 1 },
        },
      },
      QuotationResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          quotation_number: { type: 'string', example: 'QTN-202608-0001' },
          client_id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Enterprise Management System Development' },
          opportunity_name: { type: 'string', example: 'ERP Implementation - TechNova' },
          proposal_date: { type: 'string', example: '2026-08-06' },
          valid_till: { type: 'string', example: '2026-09-06' },
          revision_version: { type: 'string', example: '1.0' },
          logo: { type: 'string', description: 'Base64 encoded logo image data URI', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          billing_address: { type: 'string', example: '123 Business Park, Tech Zone, Sector 62, Noida, UP 201301' },
          shipping_address: { type: 'string', example: '123 Business Park, Tech Zone, Sector 62, Noida, UP 201301' },
          pincode: { type: 'string', example: '201301' },
          wizard_step: { type: 'integer', example: 1 },
          total_effort_hours: { type: 'number', example: 304 },
          total_timeline_days: { type: 'integer', example: 40 },
          total_outstanding_pricing_excl_gst: { type: 'number', example: 640217.00 },
          gst_amount: { type: 'number', example: 115238.06 },
          discount_amount: { type: 'number', example: 32010.85 },
          final_outstanding_amount: { type: 'number', example: 723444.21 },
          grand_total: { type: 'number', example: 723444.21 },
          grand_total_formatted: { type: 'string', example: '₹ 7,23,444.21' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ScopeInput: {
        type: 'object',
        properties: {
          module: { type: 'string', example: 'User Management' },
          title: { type: 'string', example: 'User Management' },
          subtext: { type: 'string', example: 'Manage users, roles and permissions' },
          description: { type: 'string', example: 'Create, update, delete users, roles, permissions and access control.' },
          category: { type: 'string', example: 'Core' },
          priority: { type: 'string', example: 'High' },
          est_hours: { type: 'number', example: 40 },
          est_days: { type: 'number', example: 5 },
          timeline_days: { type: 'integer', example: 5 },
          rate_per_hour: { type: 'number', example: 1200 },
          effort_cost: { type: 'number', example: 48000 },
          complexity: { type: 'string', example: 'Medium' },
          sort_order: { type: 'integer', example: 1 },
        },
      },
      FunctionalityInput: {
        type: 'object',
        properties: {
          module: { type: 'string', example: 'User Management' },
          title: { type: 'string', example: 'User Management' },
          subtext: { type: 'string', example: 'Manage users, roles and permissions' },
          description: { type: 'string', example: 'Create, update, delete users, roles, permissions and access control.' },
          category: { type: 'string', example: 'Core' },
          priority: { type: 'string', example: 'High' },
          est_hours: { type: 'number', example: 40 },
          est_days: { type: 'number', example: 5 },
          timeline_days: { type: 'integer', example: 5 },
          rate_per_hour: { type: 'number', example: 1200 },
          effort_cost: { type: 'number', example: 48000 },
          complexity: { type: 'string', example: 'Medium' },
          sort_order: { type: 'integer', example: 1 },
        },
      },
      TeamAssignmentInput: {
        type: 'object',
        properties: {
          employee_id: { type: 'integer', example: 1 },
          role_designation: { type: 'string', example: 'Project Manager' },
          technology_skill: { type: 'string', example: 'Project Management' },
          hours: { type: 'number', example: 40 },
          days: { type: 'number', example: 5 },
          hourly_rate: { type: 'number', example: 1500 },
        },
      },
      CostingBasisInput: {
        type: 'object',
        properties: {
          working_days_per_month: { type: 'integer', example: 22 },
          working_hours_per_day: { type: 'integer', example: 8 },
          team_contingency_percentage: { type: 'number', example: 5 },
          team_profit_margin_percentage: { type: 'number', example: 15 },
          travel_expenses: { type: 'number', example: 15000 },
          third_party_tools_cost: { type: 'number', example: 12000 },
          infrastructure_hosting_cost: { type: 'number', example: 10000 },
        },
      },
      CommercialInput: {
        type: 'object',
        properties: {
          gst_percentage: { type: 'number', example: 18 },
          discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' },
          discount_value: { type: 'number', example: 5 },
        },
      },
      MilestoneInput: {
        type: 'object',
        required: ['milestone_name'],
        properties: {
          milestone_name: { type: 'string', example: 'Project Kickoff' },
          milestone_subtext: { type: 'string', example: 'Initiation & Planning' },
          start_date: { type: 'string', format: 'date', example: '2025-06-01' },
          end_date: { type: 'string', format: 'date', example: '2025-06-07' },
          duration_days: { type: 'integer', example: 7 },
          sort_order: { type: 'integer', example: 1 },
        },
      },
      QuotationSummaryResponse: {
        type: 'object',
        properties: {
          quotation: { $ref: '#/components/schemas/QuotationResponse' },
          client: { $ref: '#/components/schemas/ClientResponse' },
          scopes: {
            type: 'array',
            items: {

              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                title: { type: 'string', example: 'Frontend UI/UX' },
                description: { type: 'string' },
                functionalities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer', example: 1 },
                      title: { type: 'string', example: 'Cart Integration' },
                      description: { type: 'string' },
                      timeline_days: { type: 'integer', example: 5 },
                    },
                  },
                },
              },
            },
          },
          team: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                employee_id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Jane Doe' },
                email: { type: 'string', example: 'jane.doe@company.com' },
                designation: { type: 'string', example: 'Senior Dev' },
                hours_per_day: { type: 'number', example: 8 },
                working_days: { type: 'integer', example: 15 },
                hourly_rate: { type: 'number', example: 75 },
                total_cost: { type: 'number', example: 9000 },
              },
            },
          },
        },
      },
      ScopesSyncInput: {
        type: 'object',
        required: ['modules'],
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'm123' },
                name: { type: 'string', example: 'Phase 1: Setup' },
                description: { type: 'string', example: 'Initial setup module' },
                durationDays: { type: 'integer', example: 10 },
                functionalities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'f1' },
                      name: { type: 'string', example: 'Auth Module' },
                      description: { type: 'string', example: 'Login and signup logic' },
                      effort: { type: 'number', example: 40 },
                      duration: { type: 'number', example: 5 }
                    }
                  }
                },
                teamAllocations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 't1' },
                      employeeId: { type: 'integer', example: 1 },
                      name: { type: 'string', example: 'John Doe' },
                      role: { type: 'string', example: 'Developer' },
                      effort: { type: 'number', example: 40 },
                      rate: { type: 'number', example: 500 }
                    }
                  }
                }
              }
            }
          }
        }
      },
      ScopesTreeResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Phase 1: Setup' },
          description: { type: 'string' },
          durationDays: { type: 'integer', example: 10 },
          functionalities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Auth Module' },
                description: { type: 'string' },
                effort: { type: 'number', example: 40 },
                duration: { type: 'number', example: 5 }
              }
            }
          },
          teamAllocations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                employeeId: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                role: { type: 'string', example: 'Developer' },
                effort: { type: 'number', example: 40 },
                rate: { type: 'number', example: 500 }
              }
            }
          }
        }
      },
      DashboardReportResponse: {
        type: 'object',
        properties: {
          overview: {
            type: 'object',
            properties: {
              total_clients: { type: 'integer', example: 154 },
              total_employees: { type: 'integer', example: 42 },
              total_quotations: { type: 'integer', example: 1245 },
              approved_quotations: { type: 'integer', example: 892 },
              pending_quotations: { type: 'integer', example: 120 },
              total_revenue: { type: 'number', example: 452000 },
              total_revenue_formatted: { type: 'string', example: '₹4,52,000.00' },
            },
          },
          quotationsTrend: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string', example: 'Feb' },
                value: { type: 'integer', example: 150 },
              },
            },
          },
          revenueTrend: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string', example: 'Feb' },
                value: { type: 'number', example: 52000 },
              },
            },
          },
          topClientsPie: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Global Tech' },
                value: { type: 'number', example: 145000 },
                color: { type: 'string', example: '#3B82F6' },
                percent: { type: 'string', example: '27.9%' },
              },
            },
          },
          recentQuotations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'QTN-202605-0056' },
                client: { type: 'string', example: 'Acme Corp' },
                amount: { type: 'string', example: '₹78,450.00' },
                date: { type: 'string', example: '31/05/2026' },
              },
            },
          },
          topClientsTable: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                client: { type: 'string', example: 'Global Tech' },
                quotations: { type: 'integer', example: 12 },
                revenue: { type: 'string', example: '₹3,48,560.00' },
              },
            },
          },
          employeesTable: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Rahul Verma' },
                role: { type: 'string', example: 'Senior Developer' },
                quotations: { type: 'integer', example: 14 },
                revenue: { type: 'string', example: '₹2,45,600.00' },
                avatar: { type: 'string', example: 'https://ui-avatars.com/api/?name=Rahul+Verma' },
              },
            },
          },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          metrics: {
            type: 'object',
            properties: {
              total_quotations: { type: 'integer', example: 1245 },
              total_clients: { type: 'integer', example: 154 },
              total_employees: { type: 'integer', example: 42 },
              total_revenue: { type: 'number', example: 452000 },
              total_revenue_formatted: { type: 'string', example: 'Rs. 452000.00' },
            },
          },
          monthly_quotations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string', example: 'Jan' },
                year_month: { type: 'string', example: '2026-01' },
                count: { type: 'integer', example: 65 },
              },
            },
          },
          recent_activity: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'quotation' },
                id: { type: 'integer', example: 1 },
                description: { type: 'string', example: 'Quotation QT-2023-001 approved by Acme Corp' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
          recent_quotations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                quotation_number: { type: 'string', example: 'QT-2023-001' },
                client: { type: 'string', example: 'Acme Corp' },
                date: { type: 'string', format: 'date-time' },
                amount: { type: 'number', example: 5400 },
                amount_formatted: { type: 'string', example: '$5,400.00' },
                status: { type: 'string', example: 'APPROVED' },
              },
            },
          },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 400 },
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation Error' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email format' },
              },
            },
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'employee@example.com' },
          password: { type: 'string', example: 'Password@123' },
        },
      },
      ForgotPasswordInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', example: 'employee@example.com' },
        },
      },
      ResetPasswordInput: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0' },
          newPassword: { type: 'string', example: 'NewPassword@123' },
        },
      },
      ChangePasswordInput: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'OldPassword@123' },
          newPassword: { type: 'string', example: 'NewPassword@123' },
        },
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJ...' },
        },
      },
      TaxMasterInput: {
        type: 'object',
        required: ['taxName', 'taxType', 'taxRate'],
        properties: {
          taxName: { type: 'string', example: 'GST' },
          taxType: { type: 'string', enum: ['GST', 'IGST'], example: 'GST' },
          taxRate: { type: 'number', example: 18.00 },
          description: { type: 'string', example: 'Goods and Services Tax' },
          status: { type: 'boolean', example: true },
        },
      },
      TaxMasterResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          taxName: { type: 'string', example: 'GST' },
          taxType: { type: 'string', example: 'GST' },
          taxRate: { type: 'number', example: 18.00 },
          description: { type: 'string', example: 'Goods and Services Tax' },
          status: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DropdownOptionInput: {
        type: 'object',
        required: ['optionLabel', 'optionValue'],
        properties: {
          optionLabel: { type: 'string', example: '15 Days' },
          optionValue: { type: 'string', example: '15_days' },
          displayOrder: { type: 'integer', example: 1 },
          status: { type: 'boolean', example: true },
        },
      },
      DropdownMasterInput: {
        type: 'object',
        required: ['dropdownName', 'options'],
        properties: {
          dropdownName: { type: 'string', example: 'Payment Terms' },
          description: { type: 'string', example: 'Payment term options' },
          status: { type: 'boolean', example: true },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/DropdownOptionInput' },
          },
        },
      },
      DropdownMasterResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          dropdownName: { type: 'string', example: 'Payment Terms' },
          description: { type: 'string' },
          status: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                optionLabel: { type: 'string', example: '15 Days' },
                optionValue: { type: 'string', example: '15_days' },
                displayOrder: { type: 'integer', example: 1 },
                status: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      CompanyInput: {
        type: 'object',
        required: ['companyName'],
        properties: {
          companyName: { type: 'string', example: 'TechCorp Solutions' },
          pan: { type: 'string', example: 'ABCDE1234F' },
          gstin: { type: 'string', example: '27ABCDE1234F1Z5' },
          email: { type: 'string', example: 'contact@techcorp.com' },
          phone: { type: 'string', example: '9876543210' },
          website: { type: 'string', example: 'https://techcorp.com' },
          isActive: { type: 'boolean', example: true },
        },
      },
      CompanyResponse: {
        type: 'object',
        properties: {
          companyId: { type: 'integer', example: 1 },
          companyName: { type: 'string', example: 'TechCorp Solutions' },
          pan: { type: 'string', example: 'ABCDE1234F' },
          gstin: { type: 'string', example: '27ABCDE1234F1Z5' },
          email: { type: 'string', example: 'contact@techcorp.com' },
          phone: { type: 'string', example: '9876543210' },
          website: { type: 'string', example: 'https://techcorp.com' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BranchInput: {
        type: 'object',
        required: ['companyId', 'branchName'],
        properties: {
          companyId: { type: 'integer', example: 1 },
          branchName: { type: 'string', example: 'Headquarters' },
          addressLine1: { type: 'string', example: '123 Tech Lane' },
          addressLine2: { type: 'string', example: 'Suite 400' },
          city: { type: 'string', example: 'Mumbai' },
          state: { type: 'string', example: 'Maharashtra' },
          country: { type: 'string', example: 'India' },
          pincode: { type: 'string', example: '400001' },
          email: { type: 'string', example: 'mumbai@techcorp.com' },
          phone: { type: 'string', example: '9876543211' },
          isDefault: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
        },
      },
      BranchResponse: {
        type: 'object',
        properties: {
          branchId: { type: 'integer', example: 1 },
          companyId: { type: 'integer', example: 1 },
          branchName: { type: 'string', example: 'Headquarters' },
          addressLine1: { type: 'string', example: '123 Tech Lane' },
          addressLine2: { type: 'string', example: 'Suite 400' },
          city: { type: 'string', example: 'Mumbai' },
          state: { type: 'string', example: 'Maharashtra' },
          country: { type: 'string', example: 'India' },
          pincode: { type: 'string', example: '400001' },
          email: { type: 'string', example: 'mumbai@techcorp.com' },
          phone: { type: 'string', example: '9876543211' },
          isDefault: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password to receive access and refresh tokens',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Generate a new access token using a valid refresh token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } },
        },
        responses: {
          200: {
            description: 'Access token refreshed successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate active refresh token session',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } },
        },
        responses: {
          200: {
            description: 'Logged out successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request a password reset link sent to email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordInput' } } },
        },
        responses: {
          200: {
            description: 'Reset request received',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password using temporary reset token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordInput' } } },
        },
        responses: {
          200: {
            description: 'Password reset successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change password (authenticated)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordInput' } } },
        },
        responses: {
          200: {
            description: 'Password changed successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/v1/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get main Dashboard metrics (cards, monthly quotations chart, recent activities, recent 10 quotations)',
        responses: {
          200: {
            description: 'Full Dashboard Payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardResponse' } } },
          },
        },
      },
    },

    '/api/v1/reports/dashboard': {
      get: {
        tags: ['Reports & Analytics'],
        summary: 'Get complete dashboard reports & analytics (Overview cards, charts, tables) with optional filters',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter start date (YYYY-MM-DD)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter end date (YYYY-MM-DD)' },
          { name: 'clientId', in: 'query', schema: { type: 'integer' }, description: 'Filter by Client ID' },
          { name: 'employeeId', in: 'query', schema: { type: 'integer' }, description: 'Filter by Employee ID' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['APPROVED', 'DRAFT', 'SENT', 'REJECTED'] }, description: 'Filter by Quotation Status' },
        ],
        responses: {
          200: {
            description: 'Full Dashboard Reports Payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardReportResponse' } } },
          },
        },
      },
    },

    '/api/v1/reports/export': {
      get: {
        tags: ['Reports & Analytics'],
        summary: 'Export Reports & Analytics data in PDF or Excel format with optional filters',
        parameters: [
          { name: 'format', in: 'query', required: true, schema: { type: 'string', enum: ['excel', 'pdf'] }, description: 'Export format: "excel" or "pdf"' },
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter start date (YYYY-MM-DD)' },
          { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter end date (YYYY-MM-DD)' },
        ],
        responses: {
          200: {
            description: 'Downloadable PDF or Excel file stream',
            content: {
              '*/*': { schema: { type: 'string', format: 'binary' } },
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { schema: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    },

    '/api/v1/clients': {
      post: {
        tags: ['Clients'],
        summary: 'Create a new client',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientInput' } } },
        },
        responses: {
          201: { description: 'Client created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/v1/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Get client(s) - Pass id = 0 to fetch all, or id > 0 for specific client',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all, or ID > 0 for specific client' }],
        responses: {
          200: { description: 'Client(s) details' },
          404: { description: 'Client not found' },
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Update client details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientInput' } } },
        },
        responses: { 200: { description: 'Client updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Clients'],
        summary: 'Delete a client',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Client deleted' } },
      },
    },
    '/api/v1/employees': {
      post: {
        tags: ['Employees'],
        summary: 'Create a new employee',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeInput' } } },
        },
        responses: { 201: { description: 'Employee created' } },
      },
    },
    '/api/v1/employees/roles': {
      get: {
        tags: ['Employees'],
        summary: 'Get all unique employee roles',
        responses: { 
          200: { 
            description: 'Employee roles fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'integer', example: 200 },
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee roles fetched successfully' },
                    data: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ["Administrator", "Backend Developer", "Database Admin"]
                    }
                  }
                }
              }
            }
          } 
        },
      },
    },
    '/api/v1/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee(s) - Pass id = 0 to fetch all, or id > 0 for specific employee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all, or ID > 0 for specific employee' }],
        responses: { 200: { description: 'Employee(s) details' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeInput' } } },
        },
        responses: { 200: { description: 'Employee updated' } },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Delete employee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Employee deleted' } },
      },
    },
    '/api/v1/quotations': {
      post: {
        tags: ['Quotations'],
        summary: 'Create a new quotation (Auto-generates quotation_number)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/QuotationInput' } } },
        },
        responses: { 201: { description: 'Quotation created' } },
      },
    },
    '/api/v1/quotations/{id}': {
      get: {
        tags: ['Quotations'],
        summary: 'Get quotation(s) - Pass id = 0 to fetch all, or id > 0 for specific quotation',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all, or ID > 0 for specific quotation' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by created date (from) e.g., 2026-06-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by created date (to) e.g., 2026-06-30' }
        ],
        responses: { 200: { description: 'Quotation(s) details' } },
      },
      put: {
        tags: ['Quotations'],
        summary: 'Update quotation',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/QuotationInput' } } },
        },
        responses: { 200: { description: 'Quotation updated' } },
      },
      delete: {
        tags: ['Quotations'],
        summary: 'Delete quotation',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Quotation deleted' } },
      },
    },
    '/api/v1/quotations/{id}/summary': {
      get: {
        tags: ['Quotations'],
        summary: 'Get complete quotation summary (Client, Scopes, Features, Team, Total Timeline, Grand Total)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Full Quotation Summary',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/QuotationSummaryResponse' } } },
          },
        },
      },
    },
    '/api/v1/quotations/{id}/costing': {
      get: {
        tags: ['Quotations'],
        summary: 'Get complete Team & Costing data (Team Members, Cost Summary Breakdown, Costing Basis)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Team costing summary details' } },
      },
    },
    '/api/v1/quotations/{id}/costing-basis': {
      put: {
        tags: ['Quotations'],
        summary: 'Update costing basis & project expenses (working days/hours, margins, travel, tools, hosting)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CostingBasisInput' } } },
        },
        responses: { 200: { description: 'Costing basis updated successfully' } },
      },
    },
    '/api/v1/quotations/{id}/commercial': {
      get: {
        tags: ['Quotations'],
        summary: 'Get Step 6 Commercial details (Total pricing excl. GST, GST amount, Discount, Final Net Amount)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Commercial details' } },
      },
      put: {
        tags: ['Quotations'],
        summary: 'Update Step 6 Commercial details (GST percentage, Discount type, Discount value)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CommercialInput' } } },
        },
        responses: { 200: { description: 'Commercial details updated successfully' } },
      },
    },
    '/api/v1/quotations/{id}/download': {
      get: {
        tags: ['Quotations'],
        summary: 'Download complete quotation summary & preview as PDF document',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Quotation ID' }],
        responses: {
          200: {
            description: 'Downloadable PDF Document',
            content: {
              '*/*': { schema: { type: 'string', format: 'binary' } },
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    },
    '/api/v1/quotations/{id}/timeline/excel': {
      get: {
        tags: ['Quotations'],
        summary: 'Download quotation timeline & milestones schedule as Excel spreadsheet (.xlsx)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Quotation ID' }],
        responses: {
          200: {
            description: 'Downloadable Excel Spreadsheet (.xlsx)',
            content: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: { type: 'string', format: 'binary' }
              },
            },
          },
        },
      },
    },
    '/api/v1/scopes/{id}': {
      get: {
        tags: ['Scopes'],
        summary: 'Get scope(s) - Pass id = 0 to fetch all, or id > 0 for specific scope',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all, or ID > 0 for specific scope' }],
        responses: { 200: { description: 'Scope(s) details' } },
      },
      put: {
        tags: ['Scopes'],
        summary: 'Update scope',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ScopeInput' } } },
        },
        responses: { 200: { description: 'Scope updated' } },
      },
      delete: {
        tags: ['Scopes'],
        summary: 'Delete scope and recalculate quotation timeline',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Scope deleted' } },
      },
    },
    '/api/v1/quotations/{quotationId}/scopes/tree': {
      get: {
        tags: ['Scopes'],
        summary: 'Get full module management tree structure for a quotation (Step 3)',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 
          200: { 
            description: 'Scopes tree retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ScopesTreeResponse' }
                }
              }
            }
          } 
        },
      },
    },
    '/api/v1/quotations/{quotationId}/scopes/sync': {
      put: {
        tags: ['Scopes'],
        summary: 'Bulk replace module management tree structure for a quotation (Step 3 Save & Next)',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ScopesSyncInput' } } },
        },
        responses: { 200: { description: 'Scopes successfully synced' } },
      },
    },
    '/api/v1/quotations/{quotationId}/scopes': {
      post: {
        tags: ['Scopes'],
        summary: 'Add scope to a quotation',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ScopeInput' } } },
        },
        responses: { 201: { description: 'Scope created' } },
      },
    },
    '/api/v1/functionalities/{id}': {
      get: {
        tags: ['Functionalities'],
        summary: 'Get functionality(ies) - Pass id = 0 to fetch all, or id > 0 for specific item',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all, or ID > 0 for specific functionality' }],
        responses: { 200: { description: 'Functionality(ies) details' } },
      },
      put: {
        tags: ['Functionalities'],
        summary: 'Update functionality (Recalculates total timeline)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FunctionalityInput' } } },
        },
        responses: { 200: { description: 'Functionality updated' } },
      },
      delete: {
        tags: ['Functionalities'],
        summary: 'Delete functionality (Recalculates total timeline)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Functionality deleted' } },
      },
    },
    '/api/v1/scopes/{scopeId}/functionalities': {
      post: {
        tags: ['Functionalities'],
        summary: 'Add feature functionality to scope (Recalculates total timeline)',
        parameters: [{ name: 'scopeId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FunctionalityInput' } } },
        },
        responses: { 201: { description: 'Functionality created' } },
      },
    },
    '/api/v1/quotations/{quotationId}/team': {
      post: {
        tags: ['Team Allocation'],
        summary: 'Assign employee to quotation (Calculates cost & updates grand total)',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TeamAssignmentInput' } } },
        },
        responses: { 201: { description: 'Team member assigned' } },
      },
    },
    '/api/v1/quotations/{quotationId}/team/{teamId}': {
      get: {
        tags: ['Team Allocation'],
        summary: 'Get team member(s) - Pass teamId = 0 to fetch all, or teamId > 0 for specific member',
        parameters: [
          { name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' }, description: '0 to fetch all team members, or teamId > 0 for specific assignment' },
        ],
        responses: { 200: { description: 'Assignment details' } },
      },
      put: {
        tags: ['Team Allocation'],
        summary: 'Update team member allocation (Recalculates grand total)',
        parameters: [
          { name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TeamAssignmentInput' } } },
        },
        responses: { 200: { description: 'Assignment updated' } },
      },
      delete: {
        tags: ['Team Allocation'],
        summary: 'Remove team member from quotation (Recalculates grand total)',
        parameters: [
          { name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Team member removed' } },
      },
    },
    '/api/v1/quotations/{quotationId}/milestones': {
      get: {
        tags: ['Timeline Milestones'],
        summary: 'Get all timeline milestones for a quotation (Step 7)',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'List of milestones' } },
      },
      post: {
        tags: ['Timeline Milestones'],
        summary: 'Create a milestone for a quotation',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MilestoneInput' } } },
        },
        responses: { 201: { description: 'Milestone created' } },
      },
    },
    '/api/v1/quotations/{quotationId}/milestones/bulk': {
      post: {
        tags: ['Timeline Milestones'],
        summary: 'Bulk save/replace all timeline milestones for a quotation (Step 7 Save & Next)',
        parameters: [{ name: 'quotationId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  milestones: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MilestoneInput' },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Milestones bulk saved' } },
      },
    },
    '/api/v1/milestones/{id}': {
      put: {
        tags: ['Timeline Milestones'],
        summary: 'Update milestone by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MilestoneInput' } } },
        },
        responses: { 200: { description: 'Milestone updated' } },
      },
      delete: {
        tags: ['Timeline Milestones'],
        summary: 'Delete milestone by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Milestone deleted' } },
      },
    },

    '/api/tax-masters': {
      post: {
        tags: ['Tax Master'],
        summary: 'Create a new tax master record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaxMasterInput' } } },
        },
        responses: { 201: { description: 'Tax master created' } },
      },
      get: {
        tags: ['Tax Master'],
        summary: 'Get all tax master records',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'taxType', in: 'query', schema: { type: 'string', enum: ['GST', 'IGST'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: { 200: { description: 'Tax records list' } },
      },
    },
    '/api/tax-masters/{id}': {
      get: {
        tags: ['Tax Master'],
        summary: 'Get single tax master details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Tax details' } },
      },
      put: {
        tags: ['Tax Master'],
        summary: 'Update tax master record',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaxMasterInput' } } },
        },
        responses: { 200: { description: 'Tax updated' } },
      },
      delete: {
        tags: ['Tax Master'],
        summary: 'Deactivate tax master record',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Tax deactivated' } },
      },
    },

    '/api/dropdown-masters': {
      post: {
        tags: ['Dropdown Master'],
        summary: 'Create a new dropdown master with options',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DropdownMasterInput' } } },
        },
        responses: { 201: { description: 'Dropdown master created' } },
      },
      get: {
        tags: ['Dropdown Master'],
        summary: 'Get all dropdown master records',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: { 200: { description: 'Dropdown list' } },
      },
    },
    '/api/dropdown-masters/{id}': {
      get: {
        tags: ['Dropdown Master'],
        summary: 'Get single dropdown master with options',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Dropdown details' } },
      },
      put: {
        tags: ['Dropdown Master'],
        summary: 'Update dropdown master with options',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DropdownMasterInput' } } },
        },
        responses: { 200: { description: 'Dropdown updated' } },
      },
      delete: {
        tags: ['Dropdown Master'],
        summary: 'Deactivate dropdown master',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Dropdown deactivated' } },
      },
    },

    '/api/dropdown-masters/{dropdownMasterId}/options': {
      post: {
        tags: ['Dropdown Option'],
        summary: 'Add a new option to a dropdown',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'dropdownMasterId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DropdownOptionInput' } } },
        },
        responses: { 201: { description: 'Dropdown option created' } },
      },
      get: {
        tags: ['Dropdown Option'],
        summary: 'Get all options of a dropdown master',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'dropdownMasterId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Dropdown options list' } },
      },
    },
    '/api/dropdown-options/{optionId}': {
      put: {
        tags: ['Dropdown Option'],
        summary: 'Update a single option',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'optionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DropdownOptionInput' } } },
        },
        responses: { 200: { description: 'Dropdown option updated' } },
      },
      delete: {
        tags: ['Dropdown Option'],
        summary: 'Deactivate a single option',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'optionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Dropdown option deactivated' } },
      },
    },

    '/api/v1/companies': {
      post: {
        tags: ['Company Master'],
        summary: 'Create a new company',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyInput' } } },
        },
        responses: { 201: { description: 'Company created successfully' } },
      },
    },
    '/api/v1/companies/{id}': {
      get: {
        tags: ['Company Master'],
        summary: 'Get company by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Company details fetched successfully' } },
      },
      put: {
        tags: ['Company Master'],
        summary: 'Update a company',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyInput' } } },
        },
        responses: { 200: { description: 'Company updated successfully' } },
      },
      delete: {
        tags: ['Company Master'],
        summary: 'Soft delete a company',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Company deleted successfully' } },
      },
    },
    '/api/v1/branches': {
      post: {
        tags: ['Branch Master'],
        summary: 'Create a new branch',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BranchInput' } } },
        },
        responses: { 201: { description: 'Branch created successfully' } },
      },
    },
    '/api/v1/branches/{id}': {
      get: {
        tags: ['Branch Master'],
        summary: 'Get branch by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Branch details fetched successfully' } },
      },
      put: {
        tags: ['Branch Master'],
        summary: 'Update a branch',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BranchInput' } } },
        },
        responses: { 200: { description: 'Branch updated successfully' } },
      },
      delete: {
        tags: ['Branch Master'],
        summary: 'Soft delete a branch',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Branch deleted successfully' } },
      },
    },
    '/api/v1/branches/company/{companyId}': {
      get: {
        tags: ['Branch Master'],
        summary: 'Get branches of a company',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Company branches fetched successfully' } },
      },
    },
  },
};


const options = {
  swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
