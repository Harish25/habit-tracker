"use server";

import db from "@/lib/db"; 
import { revalidatePath } from "next/cache";

//send friend req
export async function sendFriendRequest(senderId: number, receiverEmail: string) {
  const receiver = await db.user.findUnique({ 
    where: { email: receiverEmail } 
  });
  
  if (!receiver) throw new Error("User not found");
  if (senderId === receiver.id) throw new Error("You cannot add yourself");

  //check if friendship already exists
  const existingFriendship = await db.friendship.findFirst({
    where: {
      OR: [
        { requesterId: senderId, receiverId: receiver.id },
        { requesterId: receiver.id, receiverId: senderId }
      ]
    }
  });

  if (existingFriendship) {
    throw new Error("A request or friendship already exists with this user.");
  }

  await db.friendship.create({
    data: {
      requesterId: senderId,
      receiverId: receiver.id,
      status: "PENDING", 
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/friends");
}

//accepting friend req
export async function acceptFriendRequest(requestId: number) {
  await db.friendship.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/friends");
}

//reject friend req
export async function rejectFriendRequest(requestId: number) {
  await db.friendship.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/friends");
}

//delete request
export async function removeFriend(requestId: number) {
  await db.friendship.delete({
    where: { id: requestId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/friends");
}

//friends list
export async function getFriendsList(userId: number) {
  return await db.friendship.findMany({
    where: {
      OR: [
        { requesterId: userId, status: "ACCEPTED" },
        { receiverId: userId, status: "ACCEPTED" },
      ],
    },
    include: {
      requester: true,
      receiver: true,
    },
  });
}