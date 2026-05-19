export const REVENUE = [
  { m: "Jan", revenue: 142000, expenses: 98000 },
  { m: "Feb", revenue: 168000, expenses: 102000 },
  { m: "Mar", revenue: 155000, expenses: 110000 },
  { m: "Apr", revenue: 192000, expenses: 121000 },
  { m: "May", revenue: 221000, expenses: 134000 },
  { m: "Jun", revenue: 248000, expenses: 142000 },
  { m: "Jul", revenue: 263000, expenses: 158000 },
  { m: "Aug", revenue: 289000, expenses: 167000 },
  { m: "Sep", revenue: 312000, expenses: 178000 },
  { m: "Oct", revenue: 341000, expenses: 184000 },
  { m: "Nov", revenue: 367000, expenses: 196000 },
  { m: "Dec", revenue: 402000, expenses: 211000 },
];

export const CASHFLOW = REVENUE.map((r) => ({ m: r.m, net: r.revenue - r.expenses }));

export const DEPARTMENTS = [
  { name: "Finance", spend: 184, perf: 96 },
  { name: "HR", spend: 92, perf: 88 },
  { name: "Procurement", spend: 211, perf: 79 },
  { name: "Payroll", spend: 154, perf: 92 },
  { name: "Audit", spend: 47, perf: 95 },
  { name: "Operations", spend: 268, perf: 84 },
];

export const TRANSACTIONS = [
  { id: "TXN-9821", party: "Helix Supplies Ltd", amount: 48200, type: "Payment", risk: 12, status: "cleared", time: "2m ago" },
  { id: "TXN-9820", party: "Nimbus Cloud Inc", amount: 12450, type: "Subscription", risk: 6, status: "cleared", time: "8m ago" },
  { id: "TXN-9819", party: "Orion Logistics", amount: 184000, type: "Vendor", risk: 78, status: "review", time: "11m ago" },
  { id: "TXN-9818", party: "Vertex Energy", amount: 6720, type: "Utility", risk: 4, status: "cleared", time: "16m ago" },
  { id: "TXN-9817", party: "Apex Consulting", amount: 22300, type: "Services", risk: 31, status: "cleared", time: "24m ago" },
  { id: "TXN-9816", party: "Sigma Hardware", amount: 92100, type: "Vendor", risk: 64, status: "review", time: "32m ago" },
  { id: "TXN-9815", party: "Lumen Tax Authority", amount: 38900, type: "Tax", risk: 9, status: "cleared", time: "41m ago" },
  { id: "TXN-9814", party: "Atlas Construction", amount: 215400, type: "Capex", risk: 88, status: "blocked", time: "1h ago" },
];

export const ALERTS = [
  { kind: "risk", text: "3 invoices require approval", level: "warn" },
  { kind: "cash", text: "Cash flow dropped by 9% this week", level: "warn" },
  { kind: "fraud", text: "High-risk transaction detected: TXN-9814", level: "danger" },
  { kind: "ok", text: "Payroll batch ready for 248 employees", level: "info" },
];

export const ORG_NODES = [
  { id: "exec", label: "Executive", x: 50, y: 12 },
  { id: "fin", label: "Finance", x: 18, y: 38 },
  { id: "hr", label: "HR", x: 82, y: 38 },
  { id: "proc", label: "Procurement", x: 10, y: 70 },
  { id: "pay", label: "Payroll", x: 35, y: 78 },
  { id: "aud", label: "Audit", x: 65, y: 78 },
  { id: "ops", label: "Operations", x: 90, y: 70 },
];
export const ORG_EDGES: [string, string][] = [
  ["exec","fin"],["exec","hr"],["fin","proc"],["fin","pay"],["fin","aud"],
  ["hr","pay"],["hr","ops"],["ops","proc"],["aud","ops"],
];

export const AUDIT = [
  { who: "Amara Osei", action: "Approved invoice INV-2041", when: "2 min ago", tag: "approval" },
  { who: "Daniel Kim", action: "Edited supplier Orion Logistics", when: "14 min ago", tag: "edit" },
  { who: "AI Copilot", action: "Flagged TXN-9814 (risk 88)", when: "32 min ago", tag: "ai" },
  { who: "Sophia Müller", action: "Ran Q3 forecast model", when: "1 h ago", tag: "report" },
  { who: "Jonas Park", action: "Signed in from new device", when: "2 h ago", tag: "auth" },
  { who: "Priya Nair", action: "Closed reconciliation batch #88", when: "4 h ago", tag: "close" },
];

export const ORGS = [
  { id: "nova", name: "Nova Holdings", plan: "Enterprise", color: "from-blue-500 to-cyan-400", users: 1248 },
  { id: "halo", name: "Halo Capital", plan: "Pro", color: "from-violet-500 to-fuchsia-400", users: 312 },
  { id: "atlas", name: "Atlas Logistics", plan: "Enterprise", color: "from-emerald-500 to-teal-400", users: 884 },
  { id: "kite", name: "Kite Studios", plan: "Starter", color: "from-amber-500 to-orange-400", users: 47 },
];

export const COLLAB_MESSAGES = [
  { user: "Amara", text: "Can we approve INV-2041 today?", time: "10:21" },
  { user: "Daniel", text: "Reviewing — risk score is fine.", time: "10:22" },
  { user: "Copilot", text: "Suggested approver: Sophia (department head).", time: "10:22" },
  { user: "Sophia", text: "Approved ✅", time: "10:24" },
];