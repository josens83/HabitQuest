# 🔌 HabitQuest API Documentation

## Overview

HabitQuest provides a comprehensive REST API for managing all game features including quests, inventory, achievements, social features, and subscriptions.

**Base URL**: `http://localhost:3000/api` (development)
**Authentication**: Session-based (NextAuth.js)

---

## 🎯 Quests API

### Get Quests
```http
GET /api/quests?type={type}
```

**Query Parameters:**
- `type` (optional): `daily` | `weekly` | `all` (default: `all`)

**Response:**
```json
{
  "quests": [
    {
      "id": "quest-daily-complete-3",
      "title": "일일 습관 3개 완료",
      "description": "오늘 하루 동안 습관을 3개 완료하세요",
      "type": "DAILY",
      "difficulty": "EASY",
      "expReward": 50,
      "goldReward": 30,
      "gemReward": 5,
      "targetCount": 3,
      "progress": [
        {
          "currentCount": 1,
          "isCompleted": false
        }
      ]
    }
  ]
}
```

### Claim Quest Reward
```http
POST /api/quests/claim
```

**Request Body:**
```json
{
  "questId": "quest-daily-complete-3"
}
```

**Response:**
```json
{
  "success": true,
  "reward": {
    "expGained": 50,
    "goldGained": 30,
    "gemGained": 5,
    "itemsGained": []
  }
}
```

---

## 💎 Inventory API

### Get Inventory
```http
GET /api/inventory
```

**Response:**
```json
{
  "items": [
    {
      "id": "inv-1",
      "itemId": "item-energy-potion",
      "quantity": 3,
      "isEquipped": false,
      "item": {
        "name": "에너지 포션",
        "description": "에너지를 3 회복합니다",
        "rarity": "COMMON",
        "type": "CONSUMABLE"
      }
    }
  ]
}
```

### Use Item
```http
POST /api/inventory
```

**Request Body:**
```json
{
  "itemId": "item-energy-potion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully used 에너지 포션",
  "effects": [
    {
      "type": "ENERGY_RESTORE",
      "value": 3
    }
  ]
}
```

### Equip Item
```http
POST /api/inventory/equip
```

**Request Body:**
```json
{
  "itemId": "item-cool-costume"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully equipped Cool Costume"
}
```

---

## 🏪 Shop API

### Get Shop Items
```http
GET /api/shop?category={category}&type={type}
```

**Query Parameters:**
- `category` (optional): `ENERGY_RESTORE` | `STREAK_FREEZE` | `EXP_BOOST` | etc.
- `type` (optional): `CONSUMABLE` | `COSMETIC` | `BOOST` | etc.

**Response:**
```json
{
  "items": [
    {
      "id": "item-energy-potion",
      "name": "에너지 포션",
      "description": "에너지를 3 회복합니다",
      "rarity": "COMMON",
      "type": "CONSUMABLE",
      "buyPrice": 100,
      "gemPrice": 10
    }
  ]
}
```

### Purchase Item
```http
POST /api/shop
```

**Request Body:**
```json
{
  "itemId": "item-energy-potion",
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully purchased 에너지 포션 x5"
}
```

---

## 🏆 Achievements API

### Get Achievements
```http
GET /api/achievements?completed={boolean}
```

**Query Parameters:**
- `completed` (optional): `true` | `false` (default: `false`)

**Response:**
```json
{
  "achievements": [
    {
      "id": "ua-1",
      "achievementId": "achievement-first-habit",
      "currentProgress": 1,
      "isCompleted": true,
      "completedAt": "2025-01-01T00:00:00.000Z",
      "achievement": {
        "title": "첫 걸음",
        "description": "첫 번째 습관을 완료하세요",
        "tier": "BRONZE",
        "expReward": 50,
        "goldReward": 50
      }
    }
  ],
  "stats": {
    "total": 8,
    "completed": 1,
    "percentage": 12
  }
}
```

---

## 👥 Friends API

### Get Friends
```http
GET /api/social/friends?type={type}
```

**Query Parameters:**
- `type` (optional): `friends` | `pending` (default: `friends`)

**Response (friends):**
```json
{
  "friends": [
    {
      "id": "user-2",
      "name": "Friend Name",
      "character": {
        "name": "Hero",
        "level": 10,
        "avatar": "default",
        "class": "WARRIOR"
      },
      "streak": {
        "currentStreak": 7
      }
    }
  ]
}
```

**Response (pending):**
```json
{
  "requests": [
    {
      "id": "fr-1",
      "requesterId": "user-3",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "requester": {
        "name": "Pending Friend",
        "character": {
          "name": "Warrior",
          "level": 5,
          "avatar": "default"
        }
      }
    }
  ]
}
```

### Friend Actions
```http
POST /api/social/friends
```

**Request Body (Send Request):**
```json
{
  "action": "send",
  "userId": "user-123"
}
```

**Request Body (Accept Request):**
```json
{
  "action": "accept",
  "userId": "user-123"
}
```

**Request Body (Decline Request):**
```json
{
  "action": "decline",
  "userId": "user-123"
}
```

**Request Body (Remove Friend):**
```json
{
  "action": "remove",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

---

## 🏰 Guilds API

### Get Guild Info
```http
GET /api/social/guilds?type={type}
```

**Query Parameters:**
- `type` (optional): `my` | `top` (default: `my`)

**Response (my guild):**
```json
{
  "guild": {
    "id": "guild-1",
    "name": "Epic Warriors",
    "emblem": "⚔️",
    "weeklyPoints": 1500,
    "totalPoints": 5000,
    "members": [
      {
        "userId": "user-1",
        "role": "LEADER",
        "user": {
          "name": "Leader Name",
          "character": {
            "name": "Hero",
            "level": 20
          }
        }
      }
    ]
  }
}
```

**Response (top guilds):**
```json
{
  "guilds": [
    {
      "id": "guild-1",
      "name": "Top Guild",
      "totalPoints": 10000,
      "_count": {
        "members": 10
      }
    }
  ]
}
```

### Guild Actions
```http
POST /api/social/guilds
```

**Request Body (Create):**
```json
{
  "action": "create",
  "name": "My Awesome Guild",
  "emblem": "🛡️"
}
```

**Request Body (Join):**
```json
{
  "action": "join",
  "guildId": "guild-123"
}
```

**Request Body (Leave):**
```json
{
  "action": "leave"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guild created successfully",
  "guildId": "guild-123"
}
```

---

## 🏅 Leaderboard API

### Get Leaderboard
```http
GET /api/leaderboard?type={type}&period={period}
```

**Query Parameters:**
- `type` (optional): `LEVEL` | `STREAK` | `TOTAL_EXP` | `WEEKLY_POINTS` | `GUILD_POINTS` (default: `LEVEL`)
- `period` (optional): `DAILY` | `WEEKLY` | `MONTHLY` | `ALL_TIME` (default: `ALL_TIME`)

**Response:**
```json
{
  "rankings": [
    {
      "userId": "user-1",
      "userName": "Top Player",
      "characterName": "Legend",
      "avatar": "epic-avatar",
      "value": 50,
      "rank": 1
    }
  ],
  "userRank": {
    "rank": 42,
    "value": 10
  }
}
```

---

## 💳 Subscription API

See [subscription endpoints documentation](./FEATURES.md#payment-system) for details on:
- `GET /api/subscription/plans`
- `POST /api/subscription/create`
- `POST /api/subscription/verify`
- `POST /api/subscription/cancel`
- `POST /api/subscription/webhook`

---

## 🔒 Authentication

All endpoints (except `/api/leaderboard` GET) require authentication via NextAuth.js session.

**Unauthenticated Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code:** `401`

---

## ❌ Error Responses

### Validation Error
```json
{
  "error": [
    {
      "path": ["itemId"],
      "message": "Required"
    }
  ]
}
```
**Status Code:** `400`

### Not Found
```json
{
  "error": "Quest not completed or reward already claimed"
}
```
**Status Code:** `400`

### Server Error
```json
{
  "error": "Failed to fetch quests"
}
```
**Status Code:** `500`

---

## 📊 Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

---

## 🔄 Versioning

API Version: `v1` (implicit in current routes)

Future versions will use explicit versioning: `/api/v2/...`

---

## 🧪 Testing

Use tools like:
- **curl**: `curl -X GET http://localhost:3000/api/quests`
- **Postman**: Import OpenAPI spec (coming soon)
- **Thunder Client** (VS Code extension)

**Example:**
```bash
# Get daily quests
curl -X GET "http://localhost:3000/api/quests?type=daily" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

For more details, see [FEATURES.md](./FEATURES.md)
