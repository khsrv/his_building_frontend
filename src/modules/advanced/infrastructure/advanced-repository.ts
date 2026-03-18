import { apiClient } from "@/shared/lib/http/api-client";
import type {
  PricingRule,
  Broker,
  BrokerDeal,
  Invoice,
  CreatePricingRuleInput,
  CreateBrokerInput,
  AssignBrokerDealInput,
} from "@/modules/advanced/domain/advanced";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface PricingRuleDto {
  id: string;
  property_id: string;
  name: string;
  rule_type: string;
  condition_value: number | null;
  adjustment_pct: number;
  priority: number;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
}

interface BrokerDto {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  commission_pct: number | null;
  user_id: string | null;
  notes: string | null;
  created_at: string;
}

interface BrokerDealDto {
  id: string;
  broker_id: string;
  deal_id: string;
  deal_number: string;
  client_name: string;
  commission_pct: number;
  deal_amount: number;
  created_at: string;
}

interface InvoiceDto {
  id: string;
  tenant_id: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapPricingRuleDto(dto: PricingRuleDto): PricingRule {
  return {
    id: dto.id,
    propertyId: dto.property_id,
    name: dto.name,
    ruleType: dto.rule_type,
    conditionValue: dto.condition_value,
    adjustmentPct: dto.adjustment_pct,
    priority: dto.priority,
    validFrom: dto.valid_from,
    validTo: dto.valid_to,
    createdAt: dto.created_at,
  };
}

function mapBrokerDto(dto: BrokerDto): Broker {
  return {
    id: dto.id,
    fullName: dto.full_name,
    phone: dto.phone,
    email: dto.email,
    companyName: dto.company_name,
    commissionPct: dto.commission_pct,
    userId: dto.user_id,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

function mapBrokerDealDto(dto: BrokerDealDto): BrokerDeal {
  return {
    id: dto.id,
    brokerId: dto.broker_id,
    dealId: dto.deal_id,
    dealNumber: dto.deal_number,
    clientName: dto.client_name,
    commissionPct: dto.commission_pct,
    dealAmount: dto.deal_amount,
    createdAt: dto.created_at,
  };
}

function mapInvoiceDto(dto: InvoiceDto): Invoice {
  return {
    id: dto.id,
    tenantId: dto.tenant_id,
    amount: dto.amount,
    currency: dto.currency,
    status: dto.status,
    periodStart: dto.period_start,
    periodEnd: dto.period_end,
    paidAt: dto.paid_at,
    createdAt: dto.created_at,
  };
}

// ─── Pricing Rules ────────────────────────────────────────────────────────────

export async function fetchPricingRules(propertyId: string): Promise<PricingRule[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    property_id: propertyId,
  };

  const res = await apiClient.get<{ data: PricingRuleDto[] }>("/api/v1/pricing-rules", query);
  return res.data.map(mapPricingRuleDto);
}

export async function createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
  const body: Record<string, unknown> = {
    property_id: input.propertyId,
    name: input.name,
    rule_type: input.ruleType,
    adjustment_pct: input.adjustmentPct,
  };
  if (input.conditionValue !== undefined) body["condition_value"] = input.conditionValue;
  if (input.priority !== undefined) body["priority"] = input.priority;
  if (input.validFrom !== undefined) body["valid_from"] = input.validFrom;
  if (input.validTo !== undefined) body["valid_to"] = input.validTo;

  const res = await apiClient.post<{ data: PricingRuleDto }>("/api/v1/pricing-rules", body);
  return mapPricingRuleDto(res.data);
}

export async function deletePricingRule(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/pricing-rules/${id}`);
}

// ─── Brokers ──────────────────────────────────────────────────────────────────

export async function fetchBrokers(): Promise<Broker[]> {
  const res = await apiClient.get<{ data: BrokerDto[] }>("/api/v1/brokers");
  return res.data.map(mapBrokerDto);
}

export async function createBroker(input: CreateBrokerInput): Promise<Broker> {
  const body: Record<string, unknown> = {
    full_name: input.fullName,
  };
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.companyName !== undefined) body["company_name"] = input.companyName;
  if (input.commissionPct !== undefined) body["commission_pct"] = input.commissionPct;
  if (input.userId !== undefined) body["user_id"] = input.userId;
  if (input.notes !== undefined) body["notes"] = input.notes;

  const res = await apiClient.post<{ data: BrokerDto }>("/api/v1/brokers", body);
  return mapBrokerDto(res.data);
}

export async function deleteBroker(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/brokers/${id}`);
}

export async function fetchBrokerDeals(brokerId: string): Promise<BrokerDeal[]> {
  const res = await apiClient.get<{ data: BrokerDealDto[] }>(`/api/v1/brokers/${brokerId}/deals`);
  return res.data.map(mapBrokerDealDto);
}

export async function assignBrokerDeal(input: AssignBrokerDealInput): Promise<BrokerDeal> {
  const body: Record<string, unknown> = {
    broker_id: input.brokerId,
    deal_id: input.dealId,
  };
  if (input.commissionPct !== undefined) body["commission_pct"] = input.commissionPct;
  if (input.dealAmount !== undefined) body["deal_amount"] = input.dealAmount;

  const res = await apiClient.post<{ data: BrokerDealDto }>("/api/v1/broker-deals", body);
  return mapBrokerDealDto(res.data);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function fetchInvoices(status?: string): Promise<Invoice[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (status) query["status"] = status;

  const res = await apiClient.get<{ data: InvoiceDto[] }>("/api/v1/invoices", query);
  return res.data.map(mapInvoiceDto);
}

export async function markInvoicePaid(id: string): Promise<void> {
  await apiClient.post(`/api/v1/invoices/${id}/pay`, {});
}
