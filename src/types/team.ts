export interface Team {
  id: string
  name: string
  admin_user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  seat_count: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  email: string
  full_name: string | null
  plan: string
  created_at: string
}
