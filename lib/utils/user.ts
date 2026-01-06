import { User, UserPlan } from "@/hooks/use-user";

export const DEFAULT_PLAN: UserPlan = "free";

export function hasAiAccess(user: Pick<User, "plan"> | null): boolean {
  // All signed-in users have AI access (credits are tracked separately)
  return !!user;
}

export function isPremium(user: Pick<User, "plan"> | null): boolean {
  return user?.plan === "premium";
}

