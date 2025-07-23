"use client";
import { useState } from "react";

interface AddExpenseFormProps {
  groupId: string;
  members: { _id: string; name: string }[]; // Passed from parent/group dashboard
  currentUserId: string;
  type: string;
  onExpenseAdded: () => void; // ✅ Added callback prop
}

export default function AddExpenseForm({
  groupId,
  members,
  currentUserId,
  onExpenseAdded,
}: AddExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Other");
  const [splitAmong, setSplitAmong] = useState<string[]>(
    members.map((m) => m._id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/expense/add", {
      method: "POST",
      body: JSON.stringify({
        groupId,
        description,
        amount: parseFloat(amount),
        paidBy: currentUserId,
        splitAmong,
        type,
      }),
    });

    if (res.ok) {
      setDescription("");
      setAmount("");
      alert("Expense added successfully!");
      setType("Other");
      onExpenseAdded(); // ✅ Trigger refresh in parent
    } else {
      const errorText = await res.text();
      console.error("Failed to add expense:", errorText);
    }
  };

  const toggleSplit = (id: string) => {
    setSplitAmong((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow w-full max-w-md"
    >
      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

      <input
        type="text"
        placeholder="Expense title (e.g., Pizza)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full mb-3 px-3 py-2 border rounded"
      />

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full mb-3 px-3 py-2 border rounded"
      />
       <div className="mb-3">
        <label className="block mb-1 font-medium">Expense Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="Meals & Dining">Meals & Dining</option>
          <option value="Stationary & Supplies">Stationary & Supplies</option>
          <option value="Academic & Work Essesntials">Academic & Work Essesntials</option>
          <option value="Group Outings & Activities">Group Outings & Activities</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="font-medium">Split between:</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {members.map((member) => (
            <label key={member._id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={splitAmong.includes(member._id)}
                onChange={() => toggleSplit(member._id)}
              />
              {member.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-zinc-900 text-white py-2 rounded hover:bg-zinc-700 cursor-pointer"
      >
        Add Expense
      </button>
    </form>
  );
}
