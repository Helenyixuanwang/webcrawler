import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Jobs
export const createJob = (data) => api.post("/jobs/", data);
export const listJobs = () => api.get("/jobs/");
export const getJob = (id) => api.get(`/jobs/${id}`);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

// Pages
export const getJobPages = (id) => api.get(`/jobs/${id}/pages`);
export const getJobChanges = (id) => api.get(`/jobs/${id}/changes`);
