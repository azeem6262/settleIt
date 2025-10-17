"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useSession } from "next-auth/react";
import { Input } from "../components/ui/Inputs";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ExpensePieChart from "../components/expenseChart1";
import { LoaderCircle } from "lucide-react";

export default function DashboardPage() {
  type Group = {
    _id: string;
    name: string;
    members: string[];
    code: string;
  };

  const { data: session, status } = useSession();
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const router = useRouter();

  // --- MERGED NOTIFICATION STATE ---
  const [isSubscribed, setIsSubscribed] = useState(false);

  // --- MERGED: Check for existing subscription on load ---
  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  // Fetch groups on load
  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/user/groups/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched groups:", data);
          setGroups(data || []);
        })
        .catch((err) => console.error("Error fetching groups:", err));
    }
  }, [session]);

  if (status === "loading") return <div><LoaderCircle /></div>;
  if (!session) return <p>Please log in to view dashboard</p>;

  const user = session.user;

  // --- MERGED: Notification subscription logic ---
  const handleSubscribe = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error("Push notifications are not supported by your browser.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        toast.warning("Notification permission denied.");
        return;
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js');
    
    // Get the key from environment variables
    const vapidPublicKey = process.env.NEXT_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
        toast.error("Notification configuration is missing. Contact support.");
        return;
    }

    // Subscribe to the Push Service
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
    });

    // Send the subscription object to your backend to save it
    const res = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription, userId: session.user.id }),
    });

    if (res.ok) {
        toast.success("Notifications enabled!");
        setIsSubscribed(true);
    } else {
        toast.error("Failed to save subscription on server.");
    }
  };


  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter group name");

    const res = await fetch("/api/group/create", {
      method: "POST",
      body: JSON.stringify({
        name: groupName,
        userId: session.user.id,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(`Created group "${data.name}"`);
      setGroups((prev) => [...prev, data]);
      setGroupName("");
    } else {
      toast.error(data.message || "Failed to create group");
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return toast.error("Enter join code");

    const res = await fetch("/api/group/join", {
      method: "POST",
      body: JSON.stringify({
        code: joinCode,
        userId: session.user.id,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(`Joined group "${data.name}"`);
      setGroups((prev) => [...prev, data]);
      setJoinCode("");
    } else {
      toast.error(data.message || "Failed to join group");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Welcome Header */}
        <h1 className="text-2xl font-bold mb-6">
          Welcome, {user?.name || "User"}!
        </h1>
        <p className="text-xl font-medium">Here you can create or join new groups with your friends.</p>
        <p className="text-xl font-light mb-6"><a className="font-medium">settleIt</a> makes sure that you can have fun without worrying much about calculating the expenses every now and then as it will do it for you!</p>

      
        <div className="bg-white rounded shadow p-4 mb-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <h2 className="font-semibold text-lg">Enable Notifications</h2>
              <p className="text-sm text-gray-600">Get reminders for unsettled expenses even when the app is closed.</p>
            </div>
            <Button onClick={handleSubscribe} disabled={isSubscribed} className="mt-3 sm:mt-0">
              {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
            </Button>
          </div>
        </div>

        {/* Group Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Create Group */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Create a Group</h2>
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGroupName(e.target.value)
              }
              className="mb-2"
            />
            <Button onClick={handleCreateGroup}>Create</Button>
          </div>

          {/* Join Group */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Join a Group</h2>
            <Input
              placeholder="Group code"
              value={joinCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setJoinCode(e.target.value)
              }
              className="mb-2"
            />
            <Button onClick={handleJoinGroup}>Join</Button>
          </div>
        </div>

        {/* Group List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Your Groups</h2>
          {groups.length > 0 ? (
            <ul className="space-y-2">
              {groups.map((group: Group) => (
                <li
                  key={group._id}
                  className="bg-white rounded shadow p-3 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/groups/${group._id}`)}
                >
                  <span>
                    <strong>{group.name}</strong>{" "}
                    <span className="text-sm text-gray-500">
                      ({group.code})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white p-4 rounded shadow">
              <p>You are not part of any groups yet.</p>
            </div>
          )}
        </div>

     
        <div>
          <h1 className="text-2xl font-bold mb-6">Know what you&apos;re spending on</h1>
          <p className="text-xl font-light mb-6">A very well curated summary of your spendings across groups.</p>
          <ExpensePieChart />
        </div>
        
      
      </div>
    </div>
  );
}