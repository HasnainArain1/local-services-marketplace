export const C = {
  ink: "#141D28",
  inkSoft: "#2A3848",
  paper: "#EFECE6",
  card: "#FFFFFF",
  border: "#D5D2C7",
  muted: "#5A6578",
  amber: "#C47B1E",
  amberDeep: "#6F450B",
  amberBg: "#F7E5C8",
  teal: "#235751",
  tealDeep: "#123330",
  tealBg: "#D4E7E3",
  success: "#2E6B47",
  successBg: "#D7ECE0",
  danger: "#A33B2E",
  dangerBg: "#F5D8D4",
};

export const disp = { fontFamily: "'Space Grotesk', sans-serif" };
export const mono = { fontFamily: "'IBM Plex Mono', monospace" };
export const sans = { fontFamily: "'Inter', sans-serif" };

export const STATUS_TONE = {
  new: "amber",
  submitted: "amber",
  matched: "amber",
  quoted: "teal",
  accepted: "teal",
  in_progress: "amber",
  completed: "success",
  cancelled: "danger",
  active: "success",
  pending: "amber",
  suspended: "danger",
};

export const STATUS_LABEL = {
  new: "New",
  submitted: "Submitted",
  matched: "Matched",
  quoted: "Quoted",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  active: "Active",
  pending: "Pending review",
  suspended: "Suspended",
};

export const inputStyle = {
  ...sans,
  width: "100%",
  fontSize: 14,
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: "#FCFCFA",
  boxSizing: "border-box",
  outline: "none",
};

export const CATEGORY_META = {
  "AC Repair": { desc: "Air conditioner installation, gas refill, cooling problems, compressor repair, and AC servicing." },
  "AC Repair & Installation": { desc: "Air conditioner installation, gas refill, cooling problems, compressor repair, and AC servicing." },
  "Plumbing": { desc: "Fixing leaks, installing pipes, repairing toilets, and unblocking drains." },
  "Electrical": { desc: "Wiring, installing light fixtures, repairing outlets, and panel upgrades." },
  "Electrical Work": { desc: "Wiring, installing light fixtures, repairing outlets, and panel upgrades." },
  "Appliance Repair": { desc: "Repairing refrigerators, washing machines, ovens, microwaves, and home appliances." },
  "Home Cleaning": { desc: "General home cleaning, dusting, mopping, vacuuming, and deep cleaning." },
  "House Cleaning": { desc: "General home cleaning, dusting, mopping, vacuuming, and deep cleaning." },
  "House cleaning": { desc: "General home cleaning, dusting, mopping, vacuuming, and deep cleaning." },
  "Pest Control": { desc: "Removing insects, rodents, termites, cockroaches, and household pests." },
  "Carpentry": { desc: "Furniture repair, door fixing, custom woodwork, cabinet making." },
  "Painting": { desc: "Interior and exterior wall painting, waterproofing, and surface finishing." },
  "Painting & Wall Work": { desc: "Interior and exterior wall painting, waterproofing, and surface finishing." },
  "Tutoring": { desc: "Private academic tutoring for math, science, languages, and test prep." },
  "Tutoring & Academic Help": { desc: "Private academic tutoring for math, science, languages, and test prep." },
  "Moving & Shifting": { desc: "Packing, loading, transporting furniture, and full house relocation." },
  "Moving Services": { desc: "Packing, loading, transporting furniture, and full house relocation." },
};

export function getCategoryMeta(name) {
  return CATEGORY_META[name] || { desc: `Professional ${name} services.` };
}
