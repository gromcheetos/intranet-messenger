const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/hk';


export interface User {
    userId: string;
    userNm: string;
    email: string | null;
}

export interface ChatRoom {
    roomId: string;
    title: string;
    roomType: string | null;
    createdBy: string;
    createdAt: string;
    activeYn: string;
}

export interface Message {
    messageId: string;
    roomId: string;
    senderId: string;
    content: string;
    createdAt: string;
    member?: ChannelMember;
}

export interface ChannelMember {
    userId: string;
    memberNm: string;
    joinedAt: string;
    leftAt: string;
    lastReadMessageId: string;
    avatar_url: string | null;
    memberRole: string;
}

export interface PageInfo {
    pageIndex: number;
    pageSize: number;
    totalRecordCount: number;
}

interface ApiResponse<T> {
    data: T;
    status: string;
    message?: string;
    result?: string;
}

const BASE = `${API_URL}/api`;

class ApiClient {
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `API error: ${response.status}`);
        }

        return response.json();
    }

    async login(userId: string, password: string): Promise<User> {
        const loginParams = new URLSearchParams({ userId, password });
        const response = await this.request<ApiResponse<User>>(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loginParams.toString(),
        });

        if(response.result == 'SUCCESS'){
            let returnUrl =  '${returnUrl}';
            location.href = returnUrl !== '' ? returnUrl : '/';
            console.log("logged in" +response.result);

        }
        return {
            userId: response.data.userId,
            userNm: response.data.userNm || '',
            email: response.data.email || '',
        }

    }

    async signup(userId: string, email: string, pwd: string, userNm: string): Promise<User> {
        const response = await this.request<ApiResponse<User>>(`${BASE}/auth/signup`, {
            method: 'POST',
            body: JSON.stringify({ userId, email, pwd, userNm}),
        });

        console.log('signup response:', response);

        return {
            userId: response.data.userId,
            userNm: response.data.userNm || '',
            email: response.data.email || '',
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await this.request<ApiResponse<User>>(`${BASE}/messenger/user/current`);

            if (response.status == 'SUCCESS') {
                return {
                    userId: response.data.userId,
                    userNm: response.data.userNm || '',
                    email: response.data.email || '',
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    async logout(): Promise<void> {
        return this.request<void>(`${BASE}/auth/logout`, { method: 'POST' });
    }

    async getChatRooms(searchVO?: Record<string, any>): Promise<{ data: ChatRoom[]; page: PageInfo; status: string }> {
        const params = new URLSearchParams();
        //params.append('searchValue', String("1"));

        if (searchVO) {
            Object.entries(searchVO).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        const queryString = params.toString();
        return this.request<{ data: ChatRoom[]; page: any; status: string }>(
            `${BASE}/messenger/rooms${queryString ? '?' + queryString : ''}`
        );
    }

    async getMessages(roomId: string): Promise<Message []> {
        const response = await this.request<{data: Message[] }>(`${BASE}/messenger/messages/${roomId}`);
        console.log("response.data", response.data);
        return response.data;
    }

    async sendMessage(roomId: string, content: string): Promise<Message> {
        const response = await this.request<ApiResponse<Message>>(`${BASE}/messenger/send/message`, {
            method: 'POST',
            body: JSON.stringify({ roomId, content }),
        });

        if(response.status != 'SUCCESS') throw new Error(response.message || 'Failed to send message');

        return response.data;
    }

    async createChatRoom(title: string): Promise<ChatRoom> {
        return this.request<ChatRoom>(`${BASE}/messenger/newRoom`, {
            method: 'POST',
            body: JSON.stringify({title}),
        });
    }

    async updateChatRoom(roomId: string, title: string, activeYn: string): Promise<ChatRoom> {
        const response = await this.request<ApiResponse<ChatRoom>>(`${BASE}/messenger/room/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify({ title, activeYn }),
        });

        return response.data;
    }

    async deleteChatRoom(roomId: string): Promise<void> {
        const response = await this.request<ApiResponse<any>>(`${BASE}/messenger/room/delete/${roomId}`, {
            method: 'DELETE',

        });
        if(response.status != 'SUCCESS') throw new Error(response.message || 'Failed to delete room');
        if(response.status == 'SUCCESS')
            alert("This room has been deleted by the owner.")
        return;
    }

    async getChannelMembers(roomId: string): Promise<ChannelMember[]> {
        const response = await this.request<ApiResponse<ChannelMember[]>>(
            `${BASE}/messenger/room/members/${roomId}`
        );

        if (response.status != 'SUCCESS') throw new Error(response.message || 'Failed to fetch members');
        return (response.data ?? []).map((member): ChannelMember => ({
            userId: member.userId,
            memberNm: member.memberNm || '',
            joinedAt: member.joinedAt,
            leftAt: member.leftAt ||"",
            lastReadMessageId: member.lastReadMessageId ||"",
            avatar_url: null,
            memberRole: member.memberRole ||""
        }));
    }

    async inviteUserToChannel(roomId: string, username: string): Promise<ChannelMember> {
        return this.request<ChannelMember>(`${BASE}/messenger/room/members/invite/${roomId}`, {
            method: 'POST',
            body: username,
            headers: { "Content-Type": "text/plain" }
        });
    }

    async removeUserFromChannel(roomId: string, userId: string): Promise<void> {
        return this.request<void>(`${BASE}/messenger/room/${roomId}/members/${userId}`, {
            method: 'DELETE',
        });
    }

    async getOnlineUsers(): Promise<User[]> {
        const response = await this.request<ApiResponse<User[]>>(`${BASE}/messenger/users/online`);
        if (response.status != 'SUCCESS') throw new Error(response.message || 'Failed to fetch online users');

        const onlineUserIds: User[] = response.data ?? [];

        return onlineUserIds.map((user): User => ({
            userId: user.userId,
            userNm: user.userNm ||'',
            email: user.email ||'',
        }));
    }
}

export const apiClient = new ApiClient();
