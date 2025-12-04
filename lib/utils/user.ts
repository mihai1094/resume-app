import { User, UserPlan } from "@/hooks/use-user";

export const DEFAULT_PLAN: UserPlan = "free";

export function hasAiAccess(user: Pick<User, "aiAccess" | "plan"> | null): boolean {
  if (!user) return false;
  if (typeof user.aiAccess === "boolean") return user.aiAccess;
  return user.plan !== DEFAULT_PLAN;
}

