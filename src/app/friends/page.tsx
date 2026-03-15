import FriendsList from "@/components/FriendsList";
import PendingRequests from "@/components/PendingRequests";
import AddFriendForm from "@/components/AddFriendForm";

export default async function FriendsPage() {
  const currentUserId = 6; 

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Community</h1>
        <p className="text-gray-500">Connect with partners to stay accountable.</p>
      </header>

      {/* Interactive Client Component */}
      <AddFriendForm currentUserId={currentUserId} />

      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Incoming Requests</h2>
        <PendingRequests userId={currentUserId} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">My Partners</h2>
        <FriendsList userId={currentUserId} />
      </section>
    </div>
  );
}