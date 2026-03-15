import db from "@/lib/db";
import { acceptFriendRequest, rejectFriendRequest } from "@/app/friends/actions";

export default async function PendingRequests({ userId }: { userId: number }) {
  const requests = await db.friendship.findMany({
    where: { 
      receiverId: userId,
      status: "PENDING" 
    },
    include: { requester: true }
  });

  if (requests.length === 0) return null;

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
      <h3 className="font-bold text-yellow-800 mb-2">Friend Requests</h3>
      {requests.map((req) => (
        <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm">
          <span>{req.requester.username} wants to add you!</span>
          <div className="flex gap-2">
            <form action={acceptFriendRequest.bind(null, req.id)}>
              <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Accept</button>
            </form>
            <form action={rejectFriendRequest.bind(null, req.id)}>
              <button className="px-3 py-1 bg-gray-300 rounded text-sm">Ignore</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}