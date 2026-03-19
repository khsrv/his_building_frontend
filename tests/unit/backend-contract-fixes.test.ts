import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/http/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/lib/http/api-client";
import {
  addClientInteraction,
  assignManager,
  createClient,
  fetchPipelineBoard,
  updateClient,
} from "@/modules/clients/infrastructure/clients-repository";
import {
  createTransaction,
  fetchCurrencies,
  fetchPayableReminders,
  fetchPropertyCostReport,
  markPayableReminderPaid,
} from "@/modules/finance/infrastructure/finance-repository";
import { fetchLandPlots } from "@/modules/land/infrastructure/land-repository";
import { fetchMastersList } from "@/modules/masters/infrastructure/masters-repository";
import {
  createStockMovement,
  fetchAllSupplierBalances,
  fetchSupplierStatement,
  fetchStockMovementsList,
} from "@/modules/warehouse/infrastructure/warehouse-repository";
import {
  generateContract,
  listContractTemplates,
  sendSms,
} from "@/modules/contracts/infrastructure/contracts-repository";
import {
  fetchPricingRules,
  fetchUnitPriceHistory,
} from "@/modules/advanced/infrastructure/advanced-repository";
import {
  listSettings,
  updateUserRole,
} from "@/modules/admin/infrastructure/admin-repository";
import {
  mapOverduePaymentDto,
  mapUpcomingPaymentDto,
} from "@/modules/payments/infrastructure/mappers";
import {
  bulkCreateUnits,
  createBlock,
  fetchPropertiesList,
} from "@/modules/properties/infrastructure/properties-repository";
import {
  fetchDealPayments,
  fetchDealsList,
} from "@/modules/deals/infrastructure/repository";
import { mapPropertyAnalyticsDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("backend contract fixes", () => {
  it("uses manager endpoint and new client payload keys", async () => {
    mockPatch.mockResolvedValue({
      data: {
        id: "client-1",
        full_name: "John Doe",
        phone: "+992111111111",
        source: "website",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    });
    mockPost.mockResolvedValue({
      data: {
        id: "client-1",
        full_name: "John Doe",
        phone: "+992111111111",
        source: "website",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    });

    await assignManager("client-1", "manager-1");
    expect(mockPatch).toHaveBeenCalledWith(
      "/api/v1/clients/client-1/manager",
      { manager_id: "manager-1" },
    );

    await createClient({
      fullName: "John Doe",
      phone: "+992111111111",
      source: "website",
      extraPhone: "+992222222222",
      managerId: "manager-1",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/clients",
      expect.objectContaining({
        phone_additional: "+992222222222",
        assigned_manager_id: "manager-1",
      }),
    );

    await updateClient("client-1", {
      extraPhone: "+992333333333",
      managerId: "manager-2",
    });
    expect(mockPatch).toHaveBeenCalledWith(
      "/api/v1/clients/client-1",
      expect.objectContaining({
        phone_additional: "+992333333333",
        assigned_manager_id: "manager-2",
      }),
    );
  });

  it("sends client interaction as interaction_type + description", async () => {
    mockPost.mockResolvedValue({
      data: {
        id: "interaction-1",
        client_id: "client-1",
        interaction_type: "call",
        description: "Discussed schedule",
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    await addClientInteraction("client-1", {
      type: "call",
      notes: "Discussed schedule",
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/clients/client-1/interactions",
      expect.objectContaining({
        interaction_type: "call",
        description: "Discussed schedule",
      }),
    );
  });

  it("parses pipeline board from data.columns with nested stage", async () => {
    mockGet.mockResolvedValue({
      data: {
        Columns: [
          {
            Stage: {
              ID: "stage-1",
              Name: "Новый лид",
              Color: "#2563eb",
              SortOrder: 1,
            },
            Clients: [
              {
                ID: "client-1",
                FullName: "Alice",
                Phone: "+992111111111",
                Source: "website",
                PipelineStageID: "stage-1",
                CreatedAt: "2026-01-01T00:00:00Z",
                UpdatedAt: "2026-01-01T00:00:00Z",
              },
            ],
            Count: 1,
          },
        ],
      },
    });

    const board = await fetchPipelineBoard();
    expect(board).toHaveLength(1);
    expect(board[0]?.id).toBe("stage-1");
    expect(board[0]?.clients[0]?.fullName).toBe("Alice");
  });

  it("handles payments mappers for remaining and nested schedule_item", () => {
    const upcoming = mapUpcomingPaymentDto({
      id: "u1",
      due_date: "2026-03-01",
      client_name: "Client",
      client_phone: "+992",
      unit_number: "12",
      property_name: "Tower",
      deal_id: "d1",
      deal_number: "D-001",
      planned_amount: 1000,
      paid_amount: 200,
      remaining: 800,
      status: "upcoming",
      currency: "USD",
    });
    expect(upcoming.remainingAmount).toBe(800);

    const overdue = mapOverduePaymentDto({
      deal_number: "D-002",
      client_name: "Overdue Client",
      client_phone: "+992",
      unit_number: "9",
      schedule_item: {
        id: "s1",
        deal_id: "d2",
        due_date: "2026-01-10",
        planned_amount: 500,
        paid_amount: 100,
        remaining: 400,
      },
    });
    expect(overdue.id).toBe("s1");
    expect(overdue.remainingAmount).toBe(400);
  });

  it("formats transaction date and mark-paid payload for finance endpoints", async () => {
    mockPost.mockResolvedValue({
      data: {
        id: "tx-1",
        transaction_type: "income",
        amount: 10,
        currency: "USD",
        account_id: "acc-1",
        description: "desc",
        transaction_date: "2026-03-02",
        created_at: "2026-03-02T00:00:00Z",
        created_by: "user-1",
      },
    });

    await createTransaction({
      type: "income",
      amount: 10,
      currency: "USD",
      accountId: "acc-1",
      description: "desc",
      transactionDate: "2026-03-02T10:20:30Z",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/transactions",
      expect.objectContaining({ transaction_date: "2026-03-02" }),
    );

    await markPayableReminderPaid({ id: "rem-1", amount: 250 });
    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/payable-reminders/rem-1/mark-paid",
      { amount: 250 },
    );
  });

  it("parses finance/land/masters PascalCase responses", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              ID: "cur-1",
              Code: "USD",
              Name: "US Dollar",
              Symbol: "$",
              IsPrimary: true,
              CreatedAt: "2026-01-01T00:00:00Z",
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              ID: "plot-1",
              Address: "Main st",
              CadastralNumber: "CD-1",
              AreaSqm: 123,
              PropertyID: null,
              Status: "negotiation",
              Notes: "",
              CreatedAt: "2026-01-01T00:00:00Z",
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              ID: "master-1",
              FullName: "Master One",
              Phone: "+992",
              Specialization: "electrician",
              CompanyName: "",
              Notes: "",
              IsActive: true,
              CreatedAt: "2026-01-01T00:00:00Z",
              UpdatedAt: "2026-01-01T00:00:00Z",
            },
          ],
        },
      });

    const currencies = await fetchCurrencies();
    expect(currencies[0]?.code).toBe("USD");

    const plots = await fetchLandPlots();
    expect(plots[0]?.address).toBe("Main st");

    const masters = await fetchMastersList();
    expect(masters.items[0]?.name).toBe("Master One");
  });

  it("uses price_per_unit and parses stock movement payloads", async () => {
    mockPost.mockResolvedValue({
      data: {
        ID: "mv-1",
        MaterialID: "mat-1",
        MovementType: "income",
        Quantity: 10,
        PricePerUnit: 5,
        TotalAmount: 50,
        CreatedBy: "user-1",
        CreatedAt: "2026-01-01T00:00:00Z",
      },
    });

    await createStockMovement({
      materialId: "mat-1",
      type: "income",
      quantity: 10,
      unitPrice: 5,
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/stock-movements",
      expect.objectContaining({ price_per_unit: 5 }),
    );

    mockGet.mockResolvedValue({
      data: {
        Items: [
          {
            ID: "mv-1",
            MaterialID: "mat-1",
            MovementType: "income",
            Quantity: 10,
            PricePerUnit: 5,
            TotalAmount: 50,
            CreatedBy: "user-1",
            CreatedAt: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });

    const result = await fetchStockMovementsList();
    expect(result.items[0]?.type).toBe("income");
    expect(result.items[0]?.unitPrice).toBe(5);
  });

  it("parses warehouse supplier statement and supplier-balances endpoints", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              Date: "2026-03-10T00:00:00Z",
              Type: "payment",
              Description: "Оплата по счету",
              Amount: 3000,
              RunningDebt: 12000,
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              SupplierID: "sup-1",
              SupplierName: "ООО Бетон",
              TotalPurchased: 50000,
              TotalPaid: 38000,
              Balance: 12000,
            },
          ],
        },
      });

    const statement = await fetchSupplierStatement("sup-1");
    expect(statement[0]?.description).toBe("Оплата по счету");
    expect(statement[0]?.runningDebt).toBe(12000);

    const balances = await fetchAllSupplierBalances();
    expect(balances[0]?.supplierName).toBe("ООО Бетон");
    expect(balances[0]?.balance).toBe(12000);
  });

  it("parses contracts module and handles sms send response envelopes", async () => {
    mockGet.mockResolvedValue({
      data: {
        Items: [
          {
            ID: "tmpl-1",
            Name: "Sale",
            TemplateType: "sale",
            Body: "<p>Hi</p>",
            IsActive: true,
            CreatedAt: "2026-01-01T00:00:00Z",
            UpdatedAt: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });
    const templates = await listContractTemplates();
    expect(templates[0]?.templateType).toBe("sale");

    mockPost.mockResolvedValue({ data: { ID: "sms-1" } });
    const sendResult = await sendSms({ phone: "+992", message: "hello" });
    expect(sendResult.status).toBe("ok");

    mockPost.mockResolvedValue({ data: { html: "<h1>Contract</h1>" } });
    await generateContract("deal-1");
    expect(mockPost).toHaveBeenCalledWith("/api/v1/deals/deal-1/generate-contract", {});
  });

  it("parses templates/reminders from alternative containers and fallback fields", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          data: {
            templates: [
              {
                template_id: "tmpl-2",
                title: "Alt Sale",
                type: "sale",
                content: "<p>Alt</p>",
                active: true,
                created_at: "2026-03-10T00:00:00Z",
                updated_at: "2026-03-11T00:00:00Z",
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          reminders: [
            {
              reminder_id: "rem-2",
              type: "supplier",
              name: "ООО Бетон",
              total_amount: 1200,
              currency: "USD",
              date: "2026-04-01",
              note: "Оплата по счету",
              status: "pending",
              created: "2026-03-20T00:00:00Z",
            },
          ],
        },
      });

    const templates = await listContractTemplates();
    expect(templates[0]?.id).toBe("tmpl-2");
    expect(templates[0]?.templateType).toBe("sale");
    expect(templates[0]?.body).toBe("<p>Alt</p>");

    const reminders = await fetchPayableReminders();
    expect(reminders[0]?.id).toBe("rem-2");
    expect(reminders[0]?.payeeType).toBe("supplier");
    expect(reminders[0]?.payeeName).toBe("ООО Бетон");
    expect(reminders[0]?.amount).toBe(1200);
    expect(reminders[0]?.dueDate).toBe("2026-04-01");
  });

  it("uses pricing-rules property route and parses advanced responses", async () => {
    mockGet.mockResolvedValue({
      data: {
        Items: [
          {
            ID: "rule-1",
            PropertyID: "prop-1",
            Name: "Rule A",
            RuleType: "manual",
            ConditionValue: null,
            AdjustmentPct: 3,
            Priority: 1,
            ValidFrom: null,
            ValidTo: null,
            CreatedAt: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });

    const rules = await fetchPricingRules("prop-1");
    expect(mockGet).toHaveBeenCalledWith("/api/v1/pricing-rules/property/prop-1");
    expect(rules[0]?.propertyId).toBe("prop-1");
  });

  it("parses unit price history response from advanced endpoint", async () => {
    mockGet.mockResolvedValue({
      data: {
        Items: [
          {
            ID: "log-1",
            UnitID: "unit-1",
            OldPrice: 90000,
            NewPrice: 95000,
            Reason: "manual update",
            CreatedAt: "2026-03-11T00:00:00Z",
          },
        ],
      },
    });

    const history = await fetchUnitPriceHistory("unit-1");
    expect(history[0]?.id).toBe("log-1");
    expect(history[0]?.oldPrice).toBe(90000);
    expect(history[0]?.newPrice).toBe(95000);
  });

  it("parses property cost report response shape", async () => {
    mockGet.mockResolvedValue({
      data: {
        Items: [
          { CategoryName: "Материалы", TotalAmount: 150000 },
          { CategoryName: "Работы", TotalAmount: 50000 },
        ],
      },
    });

    const report = await fetchPropertyCostReport("prop-1");
    expect(report.items[0]?.categoryName).toBe("Материалы");
    expect(report.totalAmount).toBe(200000);
  });

  it("reads settings as map and status from data.status", async () => {
    mockGet.mockResolvedValue({
      data: {
        booking_days: "7",
        primary_currency: "USD",
      },
    });
    const settings = await listSettings();
    expect(settings).toContainEqual({ key: "booking_days", value: "7" });

    mockPatch.mockResolvedValue({
      data: { status: "updated", role: "manager" },
    });
    const result = await updateUserRole("user-1", { role: "manager" });
    expect(result.status).toBe("updated");
  });

  it("parses properties runtime shapes for list/create block/bulk create", async () => {
    mockGet.mockResolvedValue({
      Data: {
        Items: [
          {
            ID: "prop-1",
            Name: "Tower A",
            Address: "Main street",
            City: "Dushanbe",
            Status: "construction",
            Currency: "USD",
            TotalUnits: 120,
            SoldUnits: 40,
            RealizationPercent: 33.3,
            CreatedAt: "2026-01-01T00:00:00Z",
          },
        ],
        Pagination: { Page: 2, Limit: 10, Total: 31 },
      },
    });

    const list = await fetchPropertiesList({ page: 2, limit: 10 });
    expect(list.items[0]?.name).toBe("Tower A");
    expect(list.total).toBe(31);

    mockPost.mockResolvedValueOnce({
      data: {
        block: {
          id: "block-1",
          property_id: "prop-1",
          name: "A",
          floors_count: 12,
        },
        floors: [],
      },
    });
    const block = await createBlock("prop-1", { name: "A", floorsCount: 12 });
    expect(block.id).toBe("block-1");
    expect(block.floorsCount).toBe(12);

    mockPost.mockResolvedValueOnce({
      data: {
        created: 3,
        items: [{ id: "u1" }, { id: "u2" }, { id: "u3" }],
      },
    });
    const created = await bulkCreateUnits({
      propertyId: "prop-1",
      blockId: "block-1",
      floorId: "floor-1",
      floorNumber: 2,
      unitType: "apartment",
      numberFrom: 1,
      numberTo: 3,
    });
    expect(created.count).toBe(3);
  });

  it("parses deals and payments from mixed response formats", async () => {
    mockGet
      .mockResolvedValueOnce({
        Data: {
          Items: [
            {
              ID: "deal-1",
              DealNumber: "D-1",
              Status: "draft",
              PaymentType: "full_payment",
              TotalAmount: 1000,
              Currency: "USD",
              DiscountAmount: 0,
              DiscountReason: "",
              SurchargeAmount: 0,
              FinalAmount: 1000,
              DownPayment: 0,
              InstallmentMonths: null,
              InstallmentFrequency: "",
              ClientID: "client-1",
              UnitID: "unit-1",
              ManagerID: "manager-1",
              ContractNumber: "",
              Notes: "",
              SignedAt: null,
              CompletedAt: null,
              CancelledAt: null,
              CancellationReason: "",
              CreatedAt: "2026-01-01T00:00:00Z",
              UpdatedAt: "2026-01-01T00:00:00Z",
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          Items: [
            {
              ID: "pay-1",
              DealID: "deal-1",
              ScheduleItemID: null,
              Amount: 500,
              Currency: "USD",
              PaymentMethod: "cash",
              Status: "pending",
              Notes: null,
              CreatedAt: "2026-01-01T00:00:00Z",
              ConfirmedAt: null,
            },
          ],
        },
      });

    const deals = await fetchDealsList();
    expect(deals[0]?.id).toBe("deal-1");

    const payments = await fetchDealPayments("deal-1");
    expect(payments[0]?.id).toBe("pay-1");
    expect(payments[0]?.paymentMethod).toBe("cash");
  });

  it("maps dashboard property analytics from flat backend shape", () => {
    const mapped = mapPropertyAnalyticsDtoToDomain({
      property_id: "prop-1",
      property_name: "Tower A",
      total_units: 120,
      available_units: 60,
      booked_units: 20,
      sold_units: 40,
      total_revenue: 1200000,
      overdue_count: 5,
      overdue_amount: 25000,
      by_payment_type: [{ payment_type: "full_payment", count: 4, total_amount: 400000 }],
      monthly_sales: [{ month: "2026-03", count: 2, total_amount: 200000 }],
    });

    expect(mapped.units.total).toBe(120);
    expect(mapped.units.sold).toBe(40);
    expect(mapped.revenue.total).toBe(1200000);
    expect(mapped.payments.overdueCount).toBe(5);
    expect(mapped.dealsByPaymentType[0]?.paymentType).toBe("full_payment");
    expect(mapped.salesByMonth[0]?.month).toBe("2026-03");
  });
});
