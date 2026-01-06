# Premium System Implementation Plan

## Executive Summary

Transform ResumeForge from "free during launch" to a sustainable freemium model with:
- **Free Tier**: 3 resumes, 3 cover letters, 30 AI credits/month
- **Premium Tier**: €12/month for unlimited everything

**Estimated Timeline**: 1-2 weeks (Stripe deferred)
**Complexity**: Medium

### Dev Mode
- Account `catalin.ionescu1094@gmail.com` gets a plan toggle switch in Settings
- Allows instant switching between Free/Premium for testing
- Only visible in development or for admin accounts

---

## Phase 1: Data Layer & Usage Tracking (Days 1-3)

### 1.1 Database Schema Updates

**File: `lib/services/firestore.ts`**

Add to user document:
```typescript
interface UserUsage {
  aiCreditsUsed: number;
  aiCreditsResetDate: string; // ISO date of next reset
  lastCreditReset: string; // ISO date of last reset
}

interface UserSubscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// Updated user metadata
interface UserMetadata {
  plan: PlanId; // Keep for backward compat
  subscription?: UserSubscription;
  usage?: UserUsage;
  createdAt: string;
  lastLoginAt?: string;
}
```

### 1.2 AI Credits Configuration

**New File: `lib/config/credits.ts`**

```typescript
export const AI_CREDIT_COSTS = {
  // Quick operations (1 credit)
  "improve-bullet": 1,
  "suggest-skills": 1,
  "analyze-text": 1,
  "ghost-suggest": 1,

  // Medium operations (2 credits)
  "generate-bullets": 2,
  "generate-summary": 2,
  "score-resume": 2,
  "quantify-achievement": 2,

  // Heavy operations (3 credits)
  "analyze-ats": 3,
  "generate-improvement": 3,

  // Intensive operations (5 credits)
  "generate-cover-letter": 5,
  "tailor-resume": 5,
  "interview-prep-free": 5,    // 5 questions
  "batch-enhance": 5,
  "optimize-linkedin": 5,

  // Premium-only (marked as 0, checked separately)
  "interview-prep-full": 0,    // 15-20 questions, premium only
} as const;

export const FREE_TIER_LIMITS = {
  monthlyAICredits: 30,
  maxResumes: 3,
  maxCoverLetters: 3,
  interviewPrepQuestions: 5,  // Free gets 5 questions only
};

export const PREMIUM_TIER_LIMITS = {
  monthlyAICredits: Infinity,
  maxResumes: Infinity,
  maxCoverLetters: Infinity,
  interviewPrepQuestions: 20, // Full 15-20 questions
};

export type AIOperation = keyof typeof AI_CREDIT_COSTS;
```

### 1.3 Usage Tracking Hook

**New File: `hooks/use-ai-credits.ts`**

```typescript
interface UseAICreditsReturn {
  // State
  creditsUsed: number;
  creditsRemaining: number;
  resetDate: Date | null;
  isLoading: boolean;
  isPremium: boolean;

  // Actions
  canUseCredits: (operation: AIOperation) => boolean;
  useCredits: (operation: AIOperation) => Promise<boolean>;
  checkPremiumFeature: (feature: PremiumFeature) => boolean;

  // UI helpers
  getUpgradeReason: (operation: AIOperation) => string | null;
}
```

### 1.4 Backend Credit Deduction

**Update all AI route handlers** to:
1. Check credits before processing
2. Deduct credits after successful response
3. Return appropriate error if insufficient

**Pattern for each `/api/ai/*` route:**
```typescript
// At start of handler:
const creditCheck = await checkAndDeductCredits(userId, "operation-name");
if (!creditCheck.success) {
  return NextResponse.json({
    error: "insufficient_credits",
    creditsRequired: creditCheck.required,
    creditsRemaining: creditCheck.remaining,
    resetDate: creditCheck.resetDate,
  }, { status: 402 }); // Payment Required
}

// After successful AI call:
await recordCreditUsage(userId, "operation-name", creditCheck.transactionId);
```

### 1.5 Credit Reset Logic

**New File: `lib/services/credit-service.ts`**

```typescript
export async function checkAndResetCredits(userId: string): Promise<UserUsage> {
  const user = await getUser(userId);
  const usage = user.usage || { aiCreditsUsed: 0, aiCreditsResetDate: getNextResetDate() };

  // Check if reset is due
  if (new Date() >= new Date(usage.aiCreditsResetDate)) {
    const newUsage = {
      aiCreditsUsed: 0,
      aiCreditsResetDate: getNextResetDate(),
      lastCreditReset: new Date().toISOString(),
    };
    await updateUserUsage(userId, newUsage);
    return newUsage;
  }

  return usage;
}

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}
```

---

## Phase 2: Premium Feature Gating (Days 4-6)

### 2.1 Feature Gate Component

**New File: `components/premium/feature-gate.tsx`**

```typescript
interface FeatureGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode; // What to show when locked
  onUpgradeClick?: () => void;
}

// Usage:
<FeatureGate feature="interview-prep-full" fallback={<LockedInterviewPrep />}>
  <FullInterviewPrep />
</FeatureGate>
```

### 2.2 Credit Check Component

**New File: `components/premium/credit-check.tsx`**

```typescript
interface CreditCheckProps {
  operation: AIOperation;
  children: React.ReactNode;
  onInsufficientCredits?: () => void;
}

// Wraps AI buttons to check credits before allowing action
<CreditCheck operation="generate-cover-letter">
  <Button onClick={generateCoverLetter}>Generate Cover Letter</Button>
</CreditCheck>
```

### 2.3 Upgrade Modal

**New File: `components/premium/upgrade-modal.tsx`**

Three variants:
1. **Credits Exhausted**: "You've used all 30 AI credits this month"
2. **Premium Feature**: "Interview Prep Full is a Premium feature"
3. **Storage Limit**: "You've reached the free limit of 3 resumes"

### 2.4 Credits Display Component

**New File: `components/premium/credits-display.tsx`**

Shows in header/sidebar:
```
AI Credits: 12/30 remaining
Resets: Jan 1, 2026
[Upgrade for unlimited]
```

### 2.5 Update Interview Prep for Tiered Access

**Modify: `app/dashboard/interview-prep/[sessionId]/interview-prep-session.tsx`**

Free tier:
- Generate only 5 questions (not 15-20)
- Show "Upgrade to unlock X more questions" UI
- Hide skill gaps section (premium only)

Premium tier:
- Full 15-20 questions
- Complete skill gap analysis
- All features unlocked

---

## Phase 3: Mock Payment & Dev Tools (Days 7-8)

### 3.1 Mock Payment System (Stripe Deferred)

Instead of real Stripe integration, implement:
- "Upgrade" button shows coming soon modal
- Dev/admin accounts can toggle plan directly
- Backend ready for Stripe when added later

### 3.2 Admin Accounts Configuration

**New File: `lib/config/admin.ts`**

```typescript
export const ADMIN_EMAILS = [
  "catalin.ionescu1094@gmail.com",
];

export function isAdminUser(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

### 3.3 Dev Plan Toggle Component

**New File: `components/settings/dev-plan-toggle.tsx`**

Only visible for admin accounts:
```typescript
// Shows toggle switch: [Free] [Premium]
// Clicking instantly updates user.plan in Firestore
// Shows current credit usage
// Has "Reset Credits" button for testing
```

### 3.4 Mock Upgrade Flow

```
User clicks "Upgrade"
  → Show modal: "Premium coming soon! €12/month"
  → Show email capture: "Notify me when available"
  → Store interest in Firestore for later outreach
```

### 3.5 Subscription Management Page

**New File: `app/settings/subscription/page.tsx`**

Shows:
- Current plan (Free/Premium)
- Credit usage this month
- Reset date
- For admins: Dev plan toggle
- For non-admins: "Premium coming soon" CTA

---

## Phase 4: UI Updates (Days 11-13)

### 4.1 Update Pricing Page

**Modify: `app/pricing/page.tsx`**

Remove "Pro" and "Ultra" tiers. Single tier:
- Free (always free, with limits)
- Premium (€12/month)

Clear feature comparison table.

### 4.2 Update Dashboard Header

Add credits display:
```
[Credits: 18/30] [Upgrade] [Settings]
```

### 4.3 Update AI Feature Buttons

All AI buttons should:
1. Show credit cost on hover/tooltip
2. Disable with message if insufficient credits
3. Show upgrade modal if premium-only

### 4.4 Update Homepage

**Modify: `app/home-content.tsx`**

Remove "Launch Offer" messaging.
Add clear free vs premium comparison.

### 4.5 Update FAQ

Add questions:
- "What happens when I run out of AI credits?"
- "How do I upgrade to Premium?"
- "Can I cancel my subscription?"

### 4.6 Upgrade Success Page

**New File: `app/upgrade-success/page.tsx`**

Shows after successful payment:
- Welcome to Premium message
- What's now unlocked
- CTA to try premium features

---

## Phase 5: Testing & QA (Days 14-15)

### 5.1 Unit Tests

**New File: `lib/services/__tests__/credit-service.test.ts`**
- Test credit deduction
- Test credit reset logic
- Test premium bypass

**New File: `hooks/__tests__/use-ai-credits.test.ts`**
- Test credit checking
- Test UI state updates

### 5.2 Integration Tests

- Full checkout flow (use Stripe test mode)
- Webhook handling
- Subscription cancellation
- Credit exhaustion flow

### 5.3 Manual QA Checklist

```
[ ] Free user can use 30 AI credits
[ ] Free user sees upgrade modal at 0 credits
[ ] Free user limited to 5 interview questions
[ ] Premium user has unlimited credits
[ ] Premium user sees full interview prep
[ ] Checkout flow works end-to-end
[ ] Webhook updates user status correctly
[ ] Subscription cancellation works
[ ] Credits reset on 1st of month
[ ] Existing users migrated correctly
```

---

## Phase 6: Migration & Launch (Days 16-17)

### 6.1 Existing User Migration

All existing users get:
- `plan: "free"` (if not already set)
- `usage: { aiCreditsUsed: 0, aiCreditsResetDate: [next month] }`
- Grandfathered existing resumes (don't delete if over limit)

**Migration Script: `scripts/migrate-users-to-freemium.ts`**

### 6.2 Feature Flags

Use feature flags for gradual rollout:
```typescript
const FEATURES = {
  creditSystem: true,        // Enable credit tracking
  premiumGating: true,       // Enable premium feature gating
  stripeCheckout: true,      // Enable payment
  upgradePrompts: true,      // Show upgrade CTAs
};
```

### 6.3 Launch Checklist

```
[ ] Stripe production keys configured
[ ] Webhook endpoint verified
[ ] Migration script run
[ ] Feature flags enabled
[ ] Monitoring set up (track conversions)
[ ] Support email ready
[ ] Terms of Service updated
[ ] Privacy Policy updated (Stripe data)
```

---

## File Structure Summary

```
lib/
  config/
    credits.ts                 # NEW: Credit costs and limits
  services/
    credit-service.ts          # NEW: Credit management
    stripe-service.ts          # NEW: Stripe helpers
    firestore.ts               # MODIFY: Add usage/subscription types

hooks/
  use-ai-credits.ts            # NEW: Credit tracking hook
  use-subscription.ts          # NEW: Subscription state hook

components/
  premium/
    feature-gate.tsx           # NEW: Premium feature wrapper
    credit-check.tsx           # NEW: Credit requirement wrapper
    upgrade-modal.tsx          # NEW: Upgrade prompt modal
    credits-display.tsx        # NEW: Credits remaining display
    pricing-card.tsx           # NEW: Plan comparison card

app/
  api/
    stripe/
      create-checkout/route.ts # NEW: Start checkout
      webhook/route.ts         # NEW: Handle Stripe events
      create-portal/route.ts   # NEW: Subscription management
    ai/
      [all routes]             # MODIFY: Add credit checking

  pricing/
    page.tsx                   # MODIFY: New pricing structure

  settings/
    subscription/
      page.tsx                 # NEW: Subscription management

  upgrade-success/
    page.tsx                   # NEW: Post-payment success

scripts/
  migrate-users-to-freemium.ts # NEW: One-time migration
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Users angry about new limits | Generous free tier, grandfathered existing data |
| Payment failures | Graceful degradation, retry logic, clear error messages |
| Credit tracking bugs | Extensive testing, manual override capability |
| Stripe webhook failures | Idempotent handlers, webhook retry, manual reconciliation |
| Performance impact | Cache credit counts, batch updates |

---

## Success Metrics (Post-Launch)

| Metric | Week 1 Target | Month 1 Target |
|--------|---------------|----------------|
| Free → Premium conversion | 1% | 3% |
| Credit exhaustion rate | 30% | 50% |
| Checkout completion rate | 60% | 70% |
| Churn rate | - | <10% |
| MRR | €100 | €500 |

---

## Dependencies & Prerequisites

1. **Stripe Account**: Verified, with EUR enabled
2. **Firebase**: No changes needed to billing
3. **Vercel**: Environment variables for Stripe keys
4. **Legal**: Updated Terms of Service and Privacy Policy

---

## Estimated Effort

| Phase | Days | Complexity |
|-------|------|------------|
| Phase 1: Data Layer | 2-3 | Medium |
| Phase 2: Feature Gating | 2-3 | Medium |
| Phase 3: Mock Payment & Dev Tools | 1-2 | Low |
| Phase 4: UI Updates | 2-3 | Medium |
| Phase 5: Testing | 1-2 | Medium |
| Phase 6: Migration & Launch | 1 | Low |
| **Total** | **10-14 days** | |

With focused work: **1-2 weeks**

### Deferred (When Ready for Real Payments)
- Stripe account setup
- Checkout API routes
- Webhook handlers
- Customer portal integration
- ~3-4 additional days

---

## Next Steps

1. [ ] Review and approve this plan
2. [ ] Set up Stripe account and create product
3. [ ] Begin Phase 1 implementation
4. [ ] Create feature branch: `feat/premium-system`
