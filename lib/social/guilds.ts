import { prisma } from '@/lib/prisma'

export async function createGuild(userId: string, name: string, emblem: string) {
  // Check if user is already in a guild
  const existing = await prisma.guildMember.findFirst({
    where: { userId },
  })

  if (existing) {
    return {
      success: false,
      message: 'Already in a guild',
    }
  }

  const guild = await prisma.guild.create({
    data: {
      name,
      emblem,
      members: {
        create: {
          userId,
          role: 'LEADER',
        },
      },
    },
  })

  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'GUILD_JOINED',
      eventData: { guildId: guild.id, guildName: name },
    },
  })

  return {
    success: true,
    message: 'Guild created successfully',
    guildId: guild.id,
  }
}

export async function joinGuild(userId: string, guildId: string) {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: true,
    },
  })

  if (!guild) {
    return {
      success: false,
      message: 'Guild not found',
    }
  }

  if (guild.members.length >= guild.maxMembers) {
    return {
      success: false,
      message: 'Guild is full',
    }
  }

  // Check if user is already in this guild
  const existingMember = guild.members.find((m: any) => m.userId === userId)
  if (existingMember) {
    return {
      success: false,
      message: 'Already in this guild',
    }
  }

  await prisma.guildMember.create({
    data: {
      guildId,
      userId,
      role: 'MEMBER',
    },
  })

  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'GUILD_JOINED',
      eventData: { guildId, guildName: guild.name },
    },
  })

  return {
    success: true,
    message: 'Joined guild successfully',
  }
}

export async function leaveGuild(userId: string) {
  const membership = await prisma.guildMember.findFirst({
    where: { userId },
    include: {
      guild: {
        include: {
          members: true,
        },
      },
    },
  })

  if (!membership) {
    return {
      success: false,
      message: 'Not in a guild',
    }
  }

  // If leader and has other members, transfer leadership
  if (membership.role === 'LEADER' && membership.guild.members.length > 1) {
    const newLeader = membership.guild.members.find((m: any) => m.userId !== userId)
    if (newLeader) {
      await prisma.guildMember.update({
        where: { id: newLeader.id },
        data: { role: 'LEADER' },
      })
    }
  }

  // If leader and no other members, delete guild
  if (membership.role === 'LEADER' && membership.guild.members.length === 1) {
    await prisma.guild.delete({
      where: { id: membership.guildId },
    })
  } else {
    await prisma.guildMember.delete({
      where: { id: membership.id },
    })
  }

  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'GUILD_LEFT',
      eventData: { guildId: membership.guildId, guildName: membership.guild.name },
    },
  })

  return {
    success: true,
    message: 'Left guild successfully',
  }
}

export async function getGuildInfo(guildId: string) {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        include: {
          user: {
            include: {
              character: {
                select: {
                  name: true,
                  level: true,
                  avatar: true,
                  class: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            role: 'asc',
          },
          {
            joinedAt: 'asc',
          },
        ],
      },
    },
  })

  return guild
}

export async function getTopGuilds(limit = 10) {
  const guilds = await prisma.guild.findMany({
    orderBy: {
      totalPoints: 'desc',
    },
    take: limit,
    include: {
      _count: {
        select: { members: true },
      },
    },
  })

  return guilds
}

export async function contributeToGuild(userId: string, points: number) {
  const membership = await prisma.guildMember.findFirst({
    where: { userId },
  })

  if (!membership) {
    return
  }

  await prisma.guild.update({
    where: { id: membership.guildId },
    data: {
      weeklyPoints: {
        increment: points,
      },
      totalPoints: {
        increment: points,
      },
    },
  })
}
