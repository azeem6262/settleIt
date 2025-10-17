"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AddExpenseForm from "@/app/components/addExpenseForm";
import { LoaderCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { toast } from "sonner"; // Assuming you use this for notifications

// --- UPDATED: Added upiId to Member type ---
type Member = { 
  _id: string; 
  name: string; 
  email: string;
  upiId?: string; // User's UPI ID (optional)
};

type Expense = {
  _id: string;
  groupId: string;
  paidBy: Member;
  amount: number;
  description: string;
  splitAmong: Member[];
  createdAt: string;
  type: string
};

type GroupData = {
  _id: string;
  name: string;
  code: string;
  members: Member[];
  createdBy: string;
  createdAt: string;
};

export default function GroupDashboard() {
  const { groupId } = useParams();
  const { data: session, status } = useSession();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlements, setSettlements] = useState<{ from: string; to: string; amount: number }[]>([]);

  const fetchGroupData = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      setGroupData(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    }
  }, [groupId]);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  }, [groupId]);

  const fetchSettlements = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}/settlements`);
    const data = await res.json();
    setSettlements(data);
  }, [groupId]); 

  const fetchAllData = useCallback(() => {
    if (groupId) {
      fetchGroupData();
      fetchExpenses();
      fetchSettlements();
    }
  }, [groupId, fetchGroupData, fetchExpenses, fetchSettlements]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const computeBalances = () => {
    const netBalance = new Map<string, number>();

    for (const expense of expenses) {
      if (!expense.splitAmong || expense.splitAmong.length === 0) continue;
      const amountPerPerson = expense.amount / expense.splitAmong.length;
      for (const member of expense.splitAmong) {
        const memberId = member._id;
        const payerId = expense.paidBy._id;
        if (memberId === payerId) continue;
        netBalance.set(memberId, (netBalance.get(memberId) || 0) - amountPerPerson);
        netBalance.set(payerId, (netBalance.get(payerId) || 0) + amountPerPerson);
      }
    }

    for (const s of settlements) {
      netBalance.set(s.from, (netBalance.get(s.from) || 0) + s.amount);
      netBalance.set(s.to, (netBalance.get(s.to) || 0) - s.amount);
    }

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];
    for (const [id, amount] of netBalance.entries()) {
      if (amount < -0.01) debtors.push({ id, amount: -amount });
      else if (amount > 0.01) creditors.push({ id, amount });
    }

    const finalBalances = new Map<string, { to: string, amount: number, upiId?: string, toName: string }>();

    for (const debtor of debtors) {
      let amountToPay = debtor.amount;
      for (const creditor of creditors) {
        if (amountToPay === 0) break;
        if (creditor.amount === 0) continue;

        const payAmount = Math.min(amountToPay, creditor.amount);
        
        // --- FIX: Add a null check for groupData ---
        const creditorUser = groupData?.members.find(m => m._id === creditor.id);

        finalBalances.set(`${debtor.id}->${creditor.id}`, {
          to: creditor.id,
          amount: payAmount,
          upiId: creditorUser?.upiId,
          toName: creditorUser?.name || 'Unknown'
        });

        amountToPay -= payAmount;
        creditor.amount -= payAmount;
      }
    }
    return finalBalances;
  };

  const handleSettle = async (to: string, amount: number) => {
    // --- FIX: Add a null check for session ---
    if (!session?.user?.id) {
      toast.error("You must be logged in to settle a payment.");
      return;
    }

    const promise = fetch("/api/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        from: session.user.id,
        to,
        amount,
      }),
    });

    toast.promise(promise, {
        loading: 'Settling payment...',
        success: (res) => {
            if (!res.ok) throw new Error('Failed to settle');
            fetchAllData();
            return "Payment settled successfully!";
        },
        error: (err) => `Failed to settle: ${err.message}`,
    });
  };


  const renderBalances = () => {
    const balances = computeBalances();

    // This check is safe
    if (groupData?.members.length === 1) {
      return <p className="text-gray-600">Add more members to calculate balances.</p>;
    }

    if (balances.size === 0) {
      return <p className="text-gray-600">No one owes anyone yet. Add expenses to get started.</p>;
    }

    return (
      <ul className="space-y-3">
        {Array.from(balances.entries()).map(([key, data]) => {
          const [fromId, toId] = key.split("->");
          // This check is safe
          const fromUser = groupData?.members.find((m) => m._id === fromId);
          
          if (!fromUser || !data.toName) return null;

          // --- FIX: Use optional chaining here ---
          const upiLink = data.upiId
            ? `upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(data.toName)}&am=${data.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`SettleIt: ${groupData?.name || 'Expense'}`)}`
            : null;

          // This check is safe
          if (!session || fromUser._id !== session.user.id) return null;

          return (
            <li className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border' key={key}>
              <div className="mb-2 sm:mb-0">
                <span className="font-medium text-base md:text-lg">You owe</span>
                <span className="font-semibold text-base md:text-lg text-blue-600 mx-1">{data.toName}</span>
                <span className="font-medium text-base md:text-lg">₹{data.amount.toFixed(2)}</span> 
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSettle(toId, data.amount)} 
                  className="py-1 px-3 hover:bg-zinc-700 bg-zinc-800 rounded-[5px] cursor-pointer text-white text-sm md:text-base"
                >
                  Settle
                </button>
                
                {upiLink && (
                  <a 
                    href={upiLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="py-1 px-3 hover:bg-green-600 bg-green-500 rounded-[5px] cursor-pointer text-white text-sm md:text-base no-underline flex items-center gap-1"
                  >
                    Pay Now
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Your original checks are here and are correct.
  if (loading || status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin" size={48} />
    </div>
  );
  
  // This check correctly stops render if session or groupData is null.
  if (!groupData || !session?.user?.id)
    return <p>Group not found or not logged in.</p>;

  return (
    <div className="min-h-screen bg-zinc-50 w-full">
      <Navbar />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-4xl ml-2 md:ml-5 font-bold text-gray-800">{groupData.name}</h1>

        <div className="bg-white shadow-lg rounded-lg p-5">
          <AddExpenseForm
            groupId={groupData._id}
            members={groupData.members}
            currentUserId={session.user.id}
            type="Other"
            onExpenseAdded={fetchAllData}
          />
        </div>

        <div className="bg-white shadow-lg rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Who Owes Whom</h2>
          {renderBalances()}
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-500 italic">No expenses added yet.</p>
          ) : (
            <ul className="space-y-4">
              {expenses.map((expense) => (
                <li
                  key={expense._id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="text-gray-800 font-medium">
                    {expense.paidBy.name} paid ₹{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 italic mt-1">
                    &quot;{expense.description}&quot;
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}