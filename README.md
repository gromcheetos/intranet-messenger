# Intranet Messenger

A real-time messaging application built with Spring Boot and React, designed as an internal communication tool.

🔗 **Live Demo**: [https://intranet-messenger.vercel.app](https://intranet-messenger.vercel.app)

---

## Features

- 🔐 Session-based authentication (sign up / sign in / sign out)
- 💬 Real-time messaging via WebSocket (STOMP + SockJS)
- 📋 Channel (chat room) management — create, edit, delete
- 👥 Online user presence tracking
- 👤 Channel member management — invite and remove members
- 🟢 Active / inactive room toggle (owner only)
- 🗑️ Owner-only room deletion with confirmation

---

## Tech Stack

### Backend
| Technology | Details |
|---|---|
| Java | 21 |
| Spring Boot | 3.5.9 |
| Spring Security | Session-based auth |
| MyBatis | SQL mapping |
| WebSocket | STOMP + SockJS |
| PostgreSQL | Production DB (Supabase) |
| Oracle XE | Local development DB |

### Frontend
| Technology | Details |
|---|---|
| React | 18 + TypeScript |
| Vite | Build tool |
| Tailwind CSS | Styling |
| SockJS + STOMP | WebSocket client |
| Lucide React | Icons |

### Infrastructure
| Service | Purpose |
|---|---|
| Railway | Spring Boot hosting |
| Vercel | React hosting |
| Supabase | PostgreSQL database |
| Docker | Local development |

---

## Architecture

```
Browser (Vercel)
  ├── HTTPS REST  →  Spring Boot (Railway)  →  PostgreSQL (Supabase)
  └── WebSocket   →  Spring Boot (Railway)
```

---

## Getting Started

### Prerequisites

- Java 21
- Maven
- Docker (for local Oracle DB)
- Node.js 18+

### Local Development

**1. Start Oracle DB**
```bash
docker-compose --profile oracle up
```

**2. Configure environment**

Create `.env` at repo root:
```env
SPRING_PROFILES_ACTIVE=dev
DATABASE_URL=jdbc:oracle:thin:@localhost:1523/XE
DATABASE_USERNAME=system
DATABASE_PASSWORD=system123
SERVER_PORT=8085
SERVER_CONTEXT_PATH=/hk
```

**3. Run Spring Boot backend**
```bash
mvn spring-boot:run
```

**4. Configure frontend environment**

Create `messenger-ui/.env`:
```env
VITE_API_URL=http://localhost:8085/hk
```

**5. Run React frontend**
```bash
cd messenger-ui
npm install
npm run dev
```

App is available at `http://localhost:3000`

---

## Project Structure

```
intranet-messenger/
├── src/main/
│   ├── java/com/hkapp/
│   │   ├── module/
│   │   │   ├── messenger/         # Chat rooms, messages, members
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── mapper/
│   │   │   │   └── vo/
│   │   │   └── security/          # Auth, sign up, user details
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── mapper/
│   │   │       └── vo/
│   │   ├── common/                # Utilities, ID generator
│   │   ├── config/                # Security, WebSocket config
│   │   └── websocket/             # Online user registry, event listener
│   └── resources/
│       ├── mapper/                # MyBatis XML
│       ├── application.yml        # Local dev (Oracle)
│       └── application-prod.yml   # Production (PostgreSQL)
├── messenger-ui/                  # Vite React frontend
│   ├── src/
│   │   ├── components/            # UI components
│   │   ├── contexts/              # Auth context
│   │   ├── hooks/                 # Custom hooks
│   │   └── lib/                   # API client, WebSocket
│   └── package.json
├── oracle-data/                   # Oracle DDL scripts
├── Dockerfile                     # Spring Boot Docker image
├── docker-compose.yml             # Local dev setup
└── pom.xml
```

---

## Database

### Tables
| Table | Description |
|---|---|
| `user_info` | User accounts |
| `chat_room` | Chat rooms / channels |
| `chat_room_member` | Room membership and roles |
| `chat_message` | Messages |

### Roles
| Role | Permissions |
|---|---|
| `OWNER` | Create, edit, delete room, see inactive rooms, manage members |
| `MEMBER` | Send messages, view active rooms |

---

## Deployment

The app is deployed using:

- **Railway** — Spring Boot backend with Docker
- **Vercel** — React frontend
- **Supabase** — PostgreSQL database

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Sign in | Public |
| POST | `/api/auth/signup` | Sign up | Public |
| POST | `/api/auth/logout` | Sign out | Required |
| GET | `/api/messenger/user/current` | Get current user | Required |
| GET | `/api/messenger/rooms` | Get chat rooms | Required |
| POST | `/api/messenger/newRoom` | Create room | Required |
| PUT | `/api/messenger/room/{id}` | Update room | Owner |
| DELETE | `/api/messenger/room/delete/{id}` | Delete room | Owner |
| GET | `/api/messenger/messages/{roomId}` | Get messages | Required |
| POST | `/api/messenger/send/message` | Send message | Required |
| GET | `/api/messenger/users/online` | Get online users | Required |
| GET | `/api/messenger/room/members/{roomId}` | Get members | Required |
| POST | `/api/messenger/room/members/invite/{roomId}` | Invite member | Owner |

### WebSocket
| Endpoint | Description |
|---|---|
| `/ws-chat` | SockJS connection endpoint |
| `/app/chat.send` | Send message |
| `/topic/room/{roomId}` | Subscribe to room messages |
| `/topic/online-users` | Subscribe to online user updates |

---
## License

MIT License — see [LICENSE](LICENSE) for details.
