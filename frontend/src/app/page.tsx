"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchJobsFiltered,
  createJob,
  runJob,
  deleteJob,
} from "@/utils/api";

import {
  Play,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  X,
  Trash2,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");

  // Payload builder
  const [kvPairs, setKvPairs] = useState<{ key: string; value: string }[]>([]);
  const [currKey, setCurrKey] = useState("");
  const [currValue, setCurrValue] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const loadJobs = async () => {
    const data = await fetchJobsFiltered(statusFilter, priorityFilter);
    setJobs(data);
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 4000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter]);

  // Add payload pair
  const addPair = () => {
    if (!currKey.trim() || !currValue.trim()) return;
    setKvPairs([...kvPairs, { key: currKey, value: currValue }]);
    setCurrKey("");
    setCurrValue("");
  };

  const removePair = (i: number) =>
    setKvPairs(kvPairs.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!taskName) return alert("Task Name is required");

    const finalPairs = [...kvPairs];
    if (currKey && currValue) finalPairs.push({ key: currKey, value: currValue });

    const payloadObject = finalPairs.reduce((acc, pair) => {
      acc[pair.key] = pair.value;
      return acc;
    }, {} as Record<string, string>);

    await createJob({ taskName, priority, payload: payloadObject });

    setTaskName("");
    setKvPairs([]);
    setCurrKey("");
    setCurrValue("");
    loadJobs();
  };

  const handleRun = async (id: number) => {
    await runJob(id);
    loadJobs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job?")) return;
    await deleteJob(id);
    loadJobs();
  };

  const renderPayload = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString || "{}");
      const entries = Object.entries(obj);
      if (!entries.length)
        return <span className="text-gray-400 text-xs italic">No data</span>;

      return (
        <div className="flex flex-wrap gap-1">
          {entries.map(([key, val], i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded bg-slate-100 border border-slate-200"
            >
              <span className="opacity-60">{key}:</span> {String(val)}
            </span>
          ))}
        </div>
      );
    } catch {
      return <span className="text-red-500 text-xs">Bad JSON</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Job Scheduler & Automation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= LEFT PANEL: CREATE ================= */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Plus className="text-blue-600" size={20} /> Create Job
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Task Name
                </label>
                <input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg bg-gray-50"
                  placeholder="Generate Invoice"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg bg-gray-50"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Payload Data
                </label>

                <div className="flex flex-col gap-2 mt-2">
                  <input
                    value={currKey}
                    onChange={(e) => setCurrKey(e.target.value)}
                    placeholder="Key"
                    className="p-2 border rounded"
                  />
                  <input
                    value={currValue}
                    onChange={(e) => setCurrValue(e.target.value)}
                    placeholder="Value"
                    className="p-2 border rounded"
                  />

                  <button
                    onClick={addPair}
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 my-2 border border-dashed p-2 rounded">
                  {kvPairs.length === 0 && (
                    <span className="text-xs text-gray-400">None added</span>
                  )}
                  {kvPairs.map((pair, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-white border px-2 py-1 rounded-full text-xs"
                    >
                      {pair.key}: {pair.value}
                      <button onClick={() => removePair(i)}>
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                className="w-full p-3 rounded bg-blue-600 text-white font-medium"
              >
                Create
              </button>
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button onClick={loadJobs} className="text-blue-600 font-medium">
                Refresh
              </button>
            </div>

            {/* Job Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-xs font-bold">Task</th>
                    <th className="p-4 text-xs font-bold">Priority</th>
                    <th className="p-4 text-xs font-bold">Payload</th>
                    <th className="p-4 text-xs font-bold">Status</th>
                    <th className="p-4 text-xs font-bold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="font-medium">{job.taskName}</div>
                        <div className="text-xs text-gray-400">
                          #{job.id}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded font-semibold
                            ${
                              job.priority === "High"
                                ? "bg-red-50 text-red-600"
                                : job.priority === "Medium"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                        >
                          {job.priority}
                        </span>
                      </td>

                      <td className="p-4">{renderPayload(job.payload)}</td>

                      <td className="p-4">
                        {job.status === "completed" && (
                          <span className="text-green-600 text-xs flex items-center gap-1">
                            <CheckCircle size={14} /> Completed
                          </span>
                        )}
                        {job.status === "running" && (
                          <span className="text-blue-600 text-xs flex items-center gap-1">
                            <Loader2 size={14} className="animate-spin" />{" "}
                            Running
                          </span>
                        )}
                        {job.status === "pending" && (
                          <span className="text-gray-600 text-xs flex items-center gap-1">
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>

                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {job.status === "pending" && (
                            <button
                              onClick={() => handleRun(job.id)}
                              className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
                            >
                              <Play size={12} />
                              Run
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(job.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {jobs.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  No jobs found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
