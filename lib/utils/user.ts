import { User, UserPlan } from "@/hooks/use-user";

export const DEFAULT_PLAN: UserPlan = "free";

export function hasAiAccess(user: Pick<User, "aiAccess" | "plan"> | null): boolean {
  // Temporarily allow AI features for all signed-in users
  return !!user;
}

