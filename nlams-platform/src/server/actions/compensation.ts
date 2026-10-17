import { db } from "../lib/drizzle";
import { acquisitions } from "../db/schema";
import { eq } from "drizzle-orm";

// Placeholder for real-world compensation logic
// In production, this would integrate with external land rate APIs
export async function calculateCompensation(parcelId: number, marketRate: number, area: number) {
  // Simple formula: (Market Rate * Area) + 20% Solatium
  const baseValue = marketRate * area;
  const solatium = baseValue * 0.20;
  const total = baseValue + solatium;

  return {
    baseValue,
    solatium,
    total
  };
}

export async function updateAcquisitionPhase(acquisitionId: number, phase: string) {
  return await db
    .update(acquisitions)
    .set({ phase })
    .where(eq(acquisitions.id, acquisitionId));
}
