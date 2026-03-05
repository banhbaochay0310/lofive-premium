CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_sub_per_user" ON "subscriptions" ("userId") WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX IF NOT EXISTS "unique_pending_completed_payment" ON "payments" ("subscriptionId") WHERE status IN ('PENDING', 'COMPLETED');
