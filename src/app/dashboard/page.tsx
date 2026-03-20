import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MembershipStatus } from "@prisma/client";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/users/login");
  }

  const currentUserId = session.userId;

  const habits = await db.habit.findMany({
    where: {
      members: {
        some: {
          userId: currentUserId,
          status: MembershipStatus.ACCEPTED
        }
      }
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingInvitations = await db.habitMember.findMany({
    where: {
      userId: currentUserId,
      status: MembershipStatus.PENDING
    },
    include: {
      habit: true
    }
  });

  return (
    <DashboardClient
      userId={currentUserId}
      habits={habits}
      pendingInvitations={pendingInvitations}
      pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || ""}
      pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || ""}
    />
  );
}