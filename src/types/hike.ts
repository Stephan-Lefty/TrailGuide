export type HikeStatus = 'active' | 'ended_normal' | 'sos' | 'ended_incident';

export interface Hike {
  id: string;
  startedAt: number;
  endedAt: number | null;
  status: HikeStatus;
  shareToken: string | null;
  shareExpiresAt: number | null;
}
