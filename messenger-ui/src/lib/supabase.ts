
export type Member = {
  userId: string;
  memberRole: string;
  avatar_url: string | null;
  lastReadMessageId: number | null;
  joinedAt: string;
  leftAt: string;
  muteYn: string;
  userNm: string;
  roomId: string;
};

/*export type Room = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};*/

export type Message = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  Member?: Member;
};

export class supabase {
}