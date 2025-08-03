//group dashboard
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AddExpenseForm from "@/app/components/addExpenseForm";
import { LoaderCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";

type Member = { 
  _id: string; 
  name: string; 
  email: string 
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

  const fetchGroupData = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      setGroupData(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`);
      const data = await res.json();
      console.log("Fetched Expenses:", data); //remove
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };
  const fetchSettlements = async () => {
  const res = await fetch(`/api/groups/${groupId}/settlements`);
  const data = await res.json();
  setSettlements(data);
};
  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      fetchExpenses();
      fetchSettlements();
    }
  }, [groupId]);

  const computeBalances = () => {
  const netBalance = new Map<string, number>(); // key: userId, value: net balance (positive means others owe them)

  for (const expense of expenses) {
    if (!expense.splitAmong || expense.splitAmong.length === 0) continue;

    const amountPerPerson = expense.amount / expense.splitAmong.length;

    for (const member of expense.splitAmong) {
      const memberId = member._id;
      const payerId = expense.paidBy._id;

      if (memberId === payerId) continue;

      // Reduce member's balance
      netBalance.set(memberId, (netBalance.get(memberId) || 0) - amountPerPerson);

      // Increase payer's balance
      netBalance.set(payerId, (netBalance.get(payerId) || 0) + amountPerPerson);
    }
    console.log("Expenses", expenses);

  }
   // 🔻 Subtract settled payments
  for (const s of settlements) {
    netBalance.set(s.from, (netBalance.get(s.from) || 0) + s.amount);
    netBalance.set(s.to, (netBalance.get(s.to) || 0) - s.amount);
  }
  // Now resolve who owes whom
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, amount] of netBalance.entries()) {
    if (amount < -0.01) debtors.push({ id, amount: -amount }); // owes money
    else if (amount > 0.01) creditors.push({ id, amount }); // owed money
  }

  const finalBalances = new Map<string, number>();

  for (const debtor of debtors) {
    let amountToPay = debtor.amount;

    for (const creditor of creditors) {
      if (amountToPay === 0) break;
      if (creditor.amount === 0) continue;

      const payAmount = Math.min(amountToPay, creditor.amount);
      finalBalances.set(`${debtor.id}->${creditor.id}`, payAmount);

      amountToPay -= payAmount;
      creditor.amount -= payAmount;
    }
  }

  return finalBalances;
};

 const handleSettle = async (to: string, amount: number) => {
  if (!session?.user?.id) return;

  const res = await fetch("/api/settle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      groupId,
      from: session.user.id,
      to,
      amount,
    }),
  });

  if (res.ok) {
    alert("Payment settled!");
    fetchGroupData();
    fetchExpenses();
    fetchSettlements();
  } else {
    const err = await res.text();
    console.error("Failed to settle:", err);
  }
};


  const renderBalances = () => {
    const balances = computeBalances();

    if (groupData?.members.length === 1) {
      return <p className="text-gray-600">Add more members to calculate balances.</p>;
    }

    if (balances.size === 0) {
      return <p className="text-gray-600">No one owes anyone yet. Add expenses to get started.</p>;
    }

    return (
      <ul className="list-disc list-inside space-y-1">
        {Array.from(balances.entries()).map(([key, amount]) => {
          const [fromId, toId] = key.split("->");
          const fromUser = groupData?.members.find((m) => m._id === fromId);
          const toUser = groupData?.members.find((m) => m._id === toId);

          if (!fromUser || !toUser) return null;

          return (
            <li className = 'flex items-center whitespace-nowrap' key={key}>
              <span className="font-medium text-[12px] md:text-xl mr-2">{fromUser.name} owes</span>
              <span className="font-medium text-[12px] md:text-xl mr-2">{toUser.name} ₹{amount.toFixed(2)}</span> 
          
              <button onClick={()=>handleSettle(toId, amount)} className="p-1 md:py-1 md:px-3 hover:bg-zinc-700 ml-2 md:ml-8 bg-zinc-800 rounded-[5px] cursor-pointer text-white md:text-xl text-[12px]">Settle</button>
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading || status === "loading") return <div className="flex items-center"><LoaderCircle /></div>;
  if (!groupData || !session?.user?.id)
    return <p>Group not found or not logged in.</p>;

  return (
    <div className="flex flex-col space-y-6 w-full">
      <Navbar />
      <h1 className="text-4xl font-bold text-gray-800">{groupData.name}</h1>

      <div className="bg-white shadow-lg rounded-lg p-5">
        <AddExpenseForm
          groupId={groupData._id}
          members={groupData.members}
          currentUserId={session.user.id}
          type="Other"
          onExpenseAdded={fetchExpenses}
        />
      </div>

  <div className="bg-white shadow-lg rounded-lg p-5">
    <h2 className="text-xl font-semibold text-gray-700 mb-3">Expenses</h2>
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
              "{expense.description}"
            </p>
          </li>
        ))}
      </ul>
    )}
  </div>

  <div className="bg-white shadow-lg rounded-lg p-5">
    <h2 className="text-xl font-semibold text-gray-700 mb-3">Who Owes Whom</h2>
    {renderBalances()}
  </div>
</div>

  );
}
