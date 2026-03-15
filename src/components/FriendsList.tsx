import db from "@/lib/db";

export default async function FriendsList({ userId }: { userId: number }) {
  // Fetch all accepted friendships for this user
  const friends = await db.friendship.findMany({
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

  if (friends.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-xl text-gray-400">
        No accountability partners yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {friends.map((f) => {
        // Show the user that is NOT the current user
        const friend = f.requesterId === userId ? f.receiver : f.requester;
        
        return (
          <div key={f.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                {friend.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{friend.username}</p>
                <p className="text-xs text-green-600 font-semibold uppercase">Active Partner</p>
              </div>
            </div>
            {/* You can add a 'Remove' button here later */}
          </div>
        );
      })}
    </div>
  );
}