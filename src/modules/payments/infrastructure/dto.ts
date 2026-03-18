export interface PaymentsItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface PaymentsListResponseDto {
  data: PaymentsItemDto[];
}

// ─── Upcoming Payments DTOs ───────────────────────────────────────────────────

export interface UpcomingPaymentDto {
  id: string;
  due_date: string;
  client_name: string;
  client_phone: string;
  unit_number: string;
  property_name: string;
  deal_id: string;
  deal_number: string;
  planned_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  currency: string;
}

export interface UpcomingPaymentsResponseDto {
  data: {
    items: UpcomingPaymentDto[];
  };
}

// ─── Overdue Payments DTOs ────────────────────────────────────────────────────

export interface OverduePaymentDto {
  id: string;
  due_date: string;
  days_overdue: number;
  client_name: string;
  client_phone: string;
  unit_number: string;
  property_name: string;
  deal_id: string;
  deal_number: string;
  planned_amount: number;
  paid_amount: number;
  remaining_amount: number;
  currency: string;
}

export interface OverduePaymentsResponseDto {
  data: {
    items: OverduePaymentDto[];
  };
}

// ─── Properties DTOs ─────────────────────────────────────────────────────────

export interface PropertyDto {
  id: string;
  name: string;
}

export interface PropertiesListResponseDto {
  data: {
    items: PropertyDto[];
  };
}

// ─── Profile DTOs ─────────────────────────────────────────────────────────────

export interface UserProfileDto {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id: string;
}

export interface UserProfileResponseDto {
  data: UserProfileDto;
}

export interface SessionDto {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
}

export interface SessionsResponseDto {
  data: SessionDto[];
}
