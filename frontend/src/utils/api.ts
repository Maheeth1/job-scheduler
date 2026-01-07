const API_URL = "http://localhost:3001";

// Fetch all jobs with optional filters
export const fetchJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/jobs?${params}`);
  return res.json();
};

// Create a new job
export const createJob = async (data: any) => {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Run a specific job by ID
export const runJob = async (id: number) => {
  const res = await fetch(`${API_URL}/run-job/${id}`, { method: "POST" });
  return res.json();
};

// Get job details by ID
export async function getJobDetail(id: string | number) {
  const res = await fetch(`${API_URL}/jobs/${id}`);
  return res.json();
}

// Fetch jobs with specific status and priority filters
export async function fetchJobsFiltered(status?: string, priority?: string) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);

  const res = await fetch(`${API_URL}/jobs?` + params.toString());
  return res.json();
}

// Delete a job by ID
export async function deleteJob(id: number) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
  });
  return res.json();
}