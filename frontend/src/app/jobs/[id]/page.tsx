"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetail } from "@/utils/api";

export default function JobDetail() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    getJobDetail(id).then(setJob);
  }, [id]);

  if (!job) return <div className="p-8 text-gray-500">Loading...</div>;

  let payload = {};
  try { payload = JSON.parse(job.payload); } catch {}

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl text-black font-bold mb-4">Job #{job.id}</h1>

        <div className="space-y-3 text-sm text-gray-700">
          <div><span className="font-semibold">Task:</span> {job.taskName}</div>
          <div><span className="font-semibold">Priority:</span> {job.priority}</div>
          <div><span className="font-semibold">Status:</span> {job.status}</div>
          <div><span className="font-semibold">Created:</span> {job.createdAt}</div>
          {job.completedAt && (
            <div><span className="font-semibold">Completed:</span> {job.completedAt}</div>
          )}
          
          <div>
            <span className="font-semibold block mb-1">Payload:</span>
            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* 🔙 Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-block bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-black transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
