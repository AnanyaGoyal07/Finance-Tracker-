import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "income",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTx();
  }, []);

  const fetchTx = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
      setError("");
    } catch (err) {
      setError("⚠️ Cannot connect to backend. Is it running?");
      console.error(err);
    }
  };

  const addTx = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) return;

    // ✅ convert amount: expenses become negative
    const newTx = {
      ...form,
      amount:
        form.type === "expense" ? -Math.abs(form.amount) : Math.abs(form.amount),
    };

    try {
      await api.post("/transactions", newTx);
      setForm({ title: "", amount: "", category: "", type: "income" });
      fetchTx();
    } catch (err) {
      setError("⚠️ Failed to add transaction");
      console.error(err);
    }
  };

  const deleteTx = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTx();
    } catch (err) {
      setError("⚠️ Failed to delete transaction");
      console.error(err);
    }
  };

  // ✅ summaries
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((a, b) => a + b.amount, 0);

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((a, b) => a + Math.abs(b.amount), 0);

  const savings = income - expenses;

  // ✅ category totals
  const catTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FFF9C4] flex flex-col items-center justify-center">
      {/* Title */}
      <h1 className="text-5xl font-extrabold text-center mb-10 font-['Poppins'] tracking-wide drop-shadow-lg">
        💰 Finance Tracker
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl items-start justify-items-center">
        {/* LEFT SIDE → Bigger Pie Chart */}
        <div className="rounded flex items-center justify-center w-full max-w-md h-[450px]">
          <Pie
            data={{
              labels: Object.keys(catTotals),
              datasets: [
                {
                  data: Object.values(catTotals),
                  backgroundColor: [
                    "#60a5fa",
                    "#f87171",
                    "#34d399",
                    "#fbbf24",
                    "#a78bfa",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: { size: 14 },
                  },
                },
              },
            }}
          />
        </div>

        {/* RIGHT SIDE → Form, Transactions, Summary */}
        <div className="w-full max-w-lg">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={addTx}
            className="flex flex-wrap items-center gap-2 mb-6 justify-center"
          >
            <input
              className="border p-2 rounded flex-1 min-w-[120px]"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="border p-2 rounded flex-1 min-w-[120px]"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: +e.target.value })}
            />
            <input
              className="border p-2 rounded flex-1 min-w-[120px]"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <select
              className="border p-2 rounded min-w-[120px]"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button className="bg-blue-500 text-white px-6 py-2 rounded min-w-[100px]">
              Add
            </button>
          </form>

          {/* Transaction List */}
          <ul className="mb-6 divide-y max-h-64 overflow-y-auto pr-2">
            {transactions.map((t) => (
              <li key={t._id} className="flex justify-between py-2">
                <span>
                  {t.title} ({t.category}) –{" "}
                  <span
                    className={
                      t.amount > 0
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    {t.amount}
                  </span>
                </span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteTx(t._id)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-100 rounded">
              <h2 className="font-bold">Income</h2>
              <p className="text-green-600">{income}</p>
            </div>
            <div className="p-4 bg-red-100 rounded">
              <h2 className="font-bold">Expenses</h2>
              <p className="text-red-600">{expenses}</p>
            </div>
            <div className="p-4 bg-yellow-200 rounded">
              <h2 className="font-bold">Savings</h2>
              <p className="text-yellow-600">{savings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
