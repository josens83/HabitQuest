import { prisma } from '@/lib/prisma'

type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  // Check if already friends or request exists
  const existing = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: {
        requesterId,
        addresseeId,
      },
    },
  })

  if (existing) {
    return {
      success: false,
      message: 'Friend request already exists',
    }
  }

  // Check reverse relationship
  const reverse = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: {
        requesterId: addresseeId,
        addresseeId: requesterId,
      },
    },
  })

  if (reverse) {
    return {
      success: false,
      message: 'Friend request already exists from this user',
    }
  }

  await prisma.friendship.create({
    data: {
      requesterId,
      addresseeId,
      status: 'PENDING',
    },
  })

  return {
    success: true,
    message: 'Friend request sent',
  }
}

export async function acceptFriendRequest(requesterId: string, addresseeId: string) {
  const friendship = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: {
        requesterId,
        addresseeId,
      },
    },
  })

  if (!friendship || friendship.status !== 'PENDING') {
    return {
      success: false,
      message: 'Friend request not found',
    }
  }

  await prisma.friendship.update({
    where: { id: friendship.id },
    data: {
      status: 'ACCEPTED',
    },
  })

  // Log activities
  await prisma.activityLog.createMany({
    data: [
      {
        userId: requesterId,
        eventType: 'FRIEND_ADDED',
        eventData: { friendId: addresseeId },
      },
      {
        userId: addresseeId,
        eventType: 'FRIEND_ADDED',
        eventData: { friendId: requesterId },
      },
    ],
  })

  return {
    success: true,
    message: 'Friend request accepted',
  }
}

export async function declineFriendRequest(requesterId: string, addresseeId: string) {
  await prisma.friendship.updateMany({
    where: {
      requesterId,
      addresseeId,
      status: 'PENDING',
    },
    data: {
      status: 'DECLINED',
    },
  })

  return {
    success: true,
    message: 'Friend request declined',
  }
}

export async function removeFriend(userId: string, friendId: string) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { requesterId: userId, addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId },
      ],
    },
  })

  return {
    success: true,
    message: 'Friend removed',
  }
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
      status: 'ACCEPTED',
    },
  })

  const friendIds = friendships.map((f: any) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  )

  const friends = await prisma.user.findMany({
    where: {
      id: {
        in: friendIds,
      },
    },
    include: {
      character: {
        select: {
          name: true,
          level: true,
          avatar: true,
          class: true,
        },
      },
      streak: {
        select: {
          currentStreak: true,
        },
      },
    },
  })

  return friends
}

export async function getPendingRequests(userId: string) {
  const requests = await prisma.friendship.findMany({
    where: {
      addresseeId: userId,
      status: 'PENDING',
    },
    include: {
      requester: {
        include: {
          character: {
            select: {
              name: true,
              level: true,
              avatar: true,
            },
          },
        },
      },
    },
  })

  return requests
}
