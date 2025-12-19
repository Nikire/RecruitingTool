# Stripe Subscription Integration

This document describes the Stripe subscription integration for the BorderLess SaaS platform.

## Overview

The Stripe integration enables companies to subscribe to paid plans (Professional, Enterprise) using Stripe Checkout. The integration handles:

- Creating Stripe customers for companies
- Generating Stripe Checkout sessions for subscription purchases
- Tracking subscription status and billing periods
- Canceling subscriptions at period end
- Automatic synchronization with Stripe

## Subscription Plans

### Free Plan
- **Price**: $0
- **Features**: Basic recruiting features
- **Trial**: 14 days
- **No Stripe subscription required**

### Professional Plan
- **Price**: $79/month or $708/year ($59/mo)
- **Stripe Price ID**: Set in `STRIPE_PROFESSIONAL_PRICE_ID` environment variable
- **Features**: Advanced recruiting features, AI-powered resume parsing, interview scheduling

### Enterprise Plan
- **Price**: $299/month or $2988/year ($249/mo)
- **Stripe Price ID**: Set in `STRIPE_ENTERPRISE_PRICE_ID` environment variable
- **Features**: All Professional features + priority support, custom integrations, unlimited users

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-signing-secret
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_monthly_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id
```

### Getting Stripe Credentials

1. **Secret Key**:
   - Go to https://dashboard.stripe.com/apikeys
   - Copy the "Secret key" (starts with `sk_test_` for test mode, `sk_live_` for production)

2. **Webhook Secret**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add a new endpoint: `https://your-domain.com/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the "Signing secret" (starts with `whsec_`)

3. **Price IDs**:
   - Go to https://dashboard.stripe.com/products
   - Create products for "Professional" and "Enterprise" plans
   - Create prices (monthly recurring) for each product
   - Copy the price IDs (starts with `price_`)

## Database Schema

### Subscription Model

```prisma
model Subscription {
  id                   Int                @id @default(autoincrement())
  uid                  String             @unique @default(uuid()) @db.Uuid
  companyId            Int                @unique
  company              Company            @relation(fields: [companyId], references: [id])
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  status               SubscriptionStatus @default(TRIALING)
  plan                 SubscriptionPlan   @default(FREE)
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  trialEnd             DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum SubscriptionPlan {
  FREE
  PROFESSIONAL
  ENTERPRISE
}
```

## API Endpoints

### POST /stripe/checkout

Create a Stripe Checkout session for subscribing to a paid plan.

**Authorization**: Admin only (`ADMIN`, `SUPER_ADMIN`)

**Request Body**:
```json
{
  "plan": "PROFESSIONAL",
  "successUrl": "https://app.recruitingtool.com/subscription/success",
  "cancelUrl": "https://app.recruitingtool.com/subscription/cancel"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123..."
}
```

**Usage**:
```typescript
// Frontend redirect to Stripe Checkout
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    plan: 'PROFESSIONAL',
    successUrl: window.location.origin + '/subscription/success',
    cancelUrl: window.location.origin + '/subscription/cancel',
  }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Checkout
```

### GET /stripe/subscription

Get the current subscription details for the authenticated user's company.

**Authorization**: Admin or HR (`ADMIN`, `SUPER_ADMIN`, `HR`)

**Response**:
```json
{
  "uid": "123e4567-e89b-12d3-a456-426614174000",
  "companyUid": "123e4567-e89b-12d3-a456-426614174001",
  "plan": "PROFESSIONAL",
  "status": "ACTIVE",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "trialEnd": null,
  "cancelAtPeriodEnd": false
}
```

### POST /stripe/cancel

Cancel the subscription at the end of the current billing period.

**Authorization**: Admin only (`ADMIN`, `SUPER_ADMIN`)

**Response**:
```json
{
  "message": "Subscription will be canceled at the end of the current billing period",
  "cancelAt": "2025-02-01T00:00:00Z"
}
```

## Workflow

### 1. New Company Registration

When a new company registers:
1. A `Subscription` record is automatically created with:
   - `status`: `TRIALING`
   - `plan`: `FREE`
   - `trialEnd`: 14 days from now
   - No Stripe customer created yet

### 2. Subscribing to a Paid Plan

When a company wants to upgrade:
1. Admin clicks "Upgrade" button in frontend
2. Frontend calls `POST /stripe/checkout` with desired plan
3. Backend:
   - Creates Stripe customer (if not exists)
   - Creates Stripe Checkout session
   - Returns checkout URL
4. Frontend redirects user to Stripe Checkout
5. User enters payment details and confirms
6. Stripe redirects back to `successUrl`
7. Webhook handler updates subscription status (future enhancement)

### 3. Subscription Lifecycle

- **TRIALING**: Free trial period (14 days)
- **ACTIVE**: Paid subscription is active
- **PAST_DUE**: Payment failed, grace period
- **CANCELED**: Subscription canceled
- **UNPAID**: Payment permanently failed

### 4. Canceling Subscription

When a company cancels:
1. Admin calls `POST /stripe/cancel`
2. Backend marks subscription for cancellation at period end
3. Subscription remains active until `currentPeriodEnd`
4. At period end, Stripe webhook updates status to `CANCELED`
5. Company reverts to `FREE` plan

## Security

### PCI Compliance

- **Never store credit card details** - handled entirely by Stripe
- **Use Stripe Checkout** - redirect flow, no card data touches our servers
- **Webhook signature verification** - verify all webhook events using `STRIPE_WEBHOOK_SECRET`

### Authorization

- Only `ADMIN` and `SUPER_ADMIN` can create checkout sessions
- Only `ADMIN` and `SUPER_ADMIN` can cancel subscriptions
- `HR` users can view subscription details (read-only)

### Best Practices

1. Always use HTTPS in production
2. Use environment variables for API keys
3. Verify webhook signatures
4. Log all subscription changes for audit trail
5. Handle Stripe errors gracefully

## Testing

### Test Mode

Use Stripe test mode for development:
- Secret key starts with `sk_test_`
- Use test card numbers: https://stripe.com/docs/testing

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Any future expiration date and any 3-digit CVC.

### Testing Workflow

1. Create company account
2. Login as admin
3. Navigate to subscription settings
4. Click "Upgrade to Professional"
5. Use test card `4242 4242 4242 4242`
6. Verify subscription status changes to `ACTIVE`
7. Test cancellation flow

## Future Enhancements

1. **Webhook Handler**: Implement `/stripe/webhook` endpoint to handle:
   - `checkout.session.completed` - Update subscription after successful checkout
   - `customer.subscription.updated` - Sync subscription changes
   - `customer.subscription.deleted` - Handle subscription cancellation
   - `invoice.payment_failed` - Handle payment failures

2. **Subscription Management**:
   - Reactivate canceled subscriptions
   - Change plan (upgrade/downgrade)
   - Add annual billing options

3. **Usage-Based Billing**:
   - Track API usage or candidate count
   - Implement metered billing

4. **Proration**:
   - Handle plan changes mid-cycle
   - Credit remaining balance

## Troubleshooting

### Common Issues

1. **"Price ID not configured"**:
   - Ensure `STRIPE_PROFESSIONAL_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID` are set in `.env`

2. **"Stripe API key is not configured"**:
   - Ensure `STRIPE_SECRET_KEY` is set in `.env`

3. **"Company must have at least one user"**:
   - Ensure company has users before creating checkout session

4. **Checkout session expires**:
   - Stripe Checkout sessions expire after 24 hours
   - Generate a new session if expired

### Debugging

Enable Stripe request/response logging:
```typescript
// In stripe.service.ts constructor
this.stripe = new Stripe(apiKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  maxNetworkRetries: 3,
});
```

View Stripe Dashboard logs:
- https://dashboard.stripe.com/logs

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

## Stripe Webhook Handlers (Issue #121)

### Implementation Complete

Implemented webhook handlers to process Stripe events and automatically update subscription records in the database.

### Webhook Endpoint

**Endpoint**: `POST /api/stripe/webhook`

**Security**:
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Requires `stripe-signature` header
- Returns 400 Bad Request if signature verification fails
- Returns 200 OK immediately to acknowledge receipt (Stripe requirement)

**Behavior**:
- Processes events asynchronously to avoid blocking Stripe
- Logs all webhook events for debugging
- Gracefully handles Stripe not being configured (returns 400)

### Supported Webhook Events

#### 1. `checkout.session.completed`
- Logs successful checkout completion
- Actual subscription update handled by `customer.subscription.created`

#### 2. `customer.subscription.created`
- Creates new subscription record in database
- Determines plan from Stripe price ID
- Stores Stripe subscription ID, customer ID
- Sets subscription dates (start, end, trial)

#### 3. `customer.subscription.updated`
- Updates existing subscription record
- Syncs status, plan, dates, and cancellation flag
- Handles plan changes and renewals

#### 4. `customer.subscription.deleted`
- Marks subscription as CANCELED
- Downgrades to FREE plan
- Resets cancellation flag

#### 5. `invoice.payment_succeeded`
- Updates subscription status to ACTIVE
- Confirms successful payment received

#### 6. `invoice.payment_failed`
- Updates subscription status to PAST_DUE
- Indicates payment retry needed

### Service Methods Added

**`constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event`**
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Constructs Stripe Event object
- Throws BadRequestException if verification fails

**`handleWebhookEvent(event: Stripe.Event): Promise<void>`**
- Routes events to appropriate handlers
- Logs event processing
- Handles errors gracefully

**Private Event Handlers:**
- `handleCheckoutSessionCompleted()`
- `handleSubscriptionCreated()`
- `handleSubscriptionUpdated()`
- `handleSubscriptionDeleted()`
- `handleInvoicePaymentSucceeded()`
- `handleInvoicePaymentFailed()`

**`determinePlanFromPriceId(priceId?: string): SubscriptionPlan`**
- Maps Stripe price ID to subscription plan enum
- Supports PROFESSIONAL and ENTERPRISE plans
- Defaults to FREE for unknown price IDs

### Configuration Required

Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-signing-secret
```

Get webhook secret from Stripe Dashboard:
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for
5. Copy webhook signing secret

### Testing

**Local Testing with Stripe CLI:**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to local backend
stripe listen --forward-to http://localhost:4000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

**Verify webhook endpoint:**
```bash
# Should return 400 - Missing signature
curl -X POST http://localhost:4000/api/stripe/webhook

# Should return 400 - Stripe not configured (if not configured)
curl -X POST http://localhost:4000/api/stripe/webhook \
  -H "stripe-signature: test"
```

### Database Updates

Webhook handlers automatically update the `Subscription` table:
- `status` - TRIALING, ACTIVE, PAST_DUE, CANCELED
- `plan` - FREE, PROFESSIONAL, ENTERPRISE
- `currentPeriodStart` - Billing period start date
- `currentPeriodEnd` - Billing period end date
- `trialEnd` - Trial end date (if in trial)
- `cancelAtPeriodEnd` - Whether subscription will cancel at period end

### Error Handling

- Signature verification failures return 400 Bad Request
- Missing signature returns 400 Bad Request
- Stripe not configured returns 400 Bad Request
- All webhook processing errors are logged but don't block Stripe
- Returns 200 OK immediately to prevent Stripe retries

### Production Deployment

1. **Set environment variables:**
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)

2. **Configure webhook in Stripe Dashboard:**
   - URL: `https://your-production-domain.com/api/stripe/webhook`
   - Events: All subscription and invoice events
   - API version: 2024-11-20.acacia

3. **Monitor webhook logs:**
   ```bash
   # View recent webhook events
   docker logs recruitingtool-backend-1 | grep "Processing webhook event"
   
   # Check for errors
   docker logs recruitingtool-backend-1 | grep "Failed to process webhook"
   ```

### Related Files

- `src/modules/stripe/stripe.service.ts` - Webhook event handlers
- `src/modules/stripe/stripe.controller.ts` - Webhook endpoint
- `src/main.ts` - Raw body parsing configuration
- `.env.example` - Environment variable documentation

### Next Steps

**Issue #122**: Test webhook integration end-to-end
- Test complete subscription flow (checkout → payment → activation)
- Verify subscription updates sync correctly
- Test subscription cancellation flow
- Test payment failure scenarios

