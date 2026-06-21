export const GITHUB_URL = "https://github.com/yashuyouwaraj/ChaosForge";
export const PERSONAL_GITHUB_URL = "https://github.com/yashuyouwaraj";
export const LINKEDIN_URL = "https://www.linkedin.com/in/yashu-youwaraj/";
export const PORTFOLIO_URL = "https://yashuyouwaraj.vercel.app/";
export const CONTACT_EMAIL = "yashuyouwaraj123@gmail.com";

export const PRODUCT_METRICS = [
  { value: 8, label: "AI Models", subtext: "NVIDIA NIM routing" },
  { value: 14, label: "AI Skills", subtext: "Copilot capabilities" },
  { value: 11, label: "Intelligence Engines", subtext: "Operational analysis" },
  { value: 5, label: "Chaos Profiles", subtext: "Fault injection presets" },
  { value: 3, label: "Export Formats", subtext: "PDF, JSON, CSV" },
  { value: 6, label: "Kafka Partitions", subtext: "Distributed workers" },
];

export const WORKFLOW_STEPS = [
  { title: "Create Project", description: "Define your target service and workspace.", href: "/projects" },
  { title: "Configure Simulation", description: "Set RPS, duration, and traffic patterns.", href: "/simulations" },
  { title: "Launch Traffic", description: "Kafka workers execute distributed HTTP load.", href: "/simulations" },
  { title: "Monitor Live Dashboard", description: "WebSocket telemetry, latency, and RPS in realtime.", href: "/dashboard" },
  { title: "Inject Chaos", description: "Latency, failures, packet loss, timeouts, and resets.", href: "/chaos" },
  { title: "AI Analysis", description: "11 intelligence engines analyze run behavior.", href: "/ai" },
  { title: "Generate Executive Report", description: "Health, risk, root cause, and recommendations.", href: "/reports" },
  { title: "Deploy With Confidence", description: "Deployment readiness scores guide release decisions.", href: "/reports" },
];

export const ARCHITECTURE_STEPS = [
  { label: "Browser", detail: "Next.js control surface" },
  { label: "Express API", detail: "Auth, orchestration, WebSockets" },
  { label: "Kafka", detail: "Distributed event pipeline" },
  { label: "Workers", detail: "HTTP traffic executors" },
  { label: "Redis", detail: "Runtime state & metrics cache" },
  { label: "MongoDB", detail: "Projects, runs, persistence" },
  { label: "Prometheus", detail: "Metrics collection" },
  { label: "Grafana", detail: "Operational dashboards" },
  { label: "AI Copilot", detail: "NVIDIA NIM intelligence" },
  { label: "Reports", detail: "PDF, JSON, CSV export" },
];

export const INTELLIGENCE_ENGINES = [
  { title: "Health Score", description: "Composite health grade with confidence scoring from run metrics and infrastructure signals.", icon: "HS" },
  { title: "Predictive Risk", description: "Forecast risk levels with contributing factors before incidents escalate.", icon: "PR" },
  { title: "Root Cause Analysis", description: "Correlate latency spikes, failures, and chaos events into actionable signals.", icon: "RC" },
  { title: "Recommendations", description: "Priority remediation guidance from the Intelligence Engine.", icon: "RE" },
  { title: "Deployment Readiness", description: "Availability, reliability, performance, resilience, and observability scores.", icon: "DR" },
  { title: "Infrastructure Memory", description: "Recurring patterns and historical intelligence across runs.", icon: "IM" },
  { title: "Executive Summary", description: "Executive brief and summary for leadership-ready reporting.", icon: "ES" },
];

export const CHAOS_FAULT_TYPES = [
  { title: "Latency", description: "Inject min/max delay with configurable percentage.", icon: "LT" },
  { title: "Packet Loss", description: "Simulate network degradation under load.", icon: "PL" },
  { title: "Timeout", description: "Force request timeouts at configurable duration.", icon: "TO" },
  { title: "HTTP Failures", description: "Return status codes like 500 during traffic.", icon: "HF" },
  { title: "Connection Reset", description: "Drop connections to test resilience.", icon: "CR" },
];

export const CHAOS_PROFILES = [
  { name: "Custom", description: "Manual fault configuration for precise experiments.", active: false },
  { name: "Latency", description: "200–1000ms delay at 50% injection rate.", active: true },
  { name: "Failure", description: "30% HTTP 500 failure rate.", active: true },
  { name: "Network", description: "20% packet loss with 5s timeouts.", active: true },
  { name: "Stress", description: "Combined latency, failure, timeout, and packet loss.", active: true },
];

export const AI_SKILLS = [
  { title: "Ask ChaosForge", description: "Conversational copilot for infrastructure questions.", href: "/ask", category: "fast" },
  { title: "Executive Brief", description: "Leadership-ready summaries from run intelligence.", href: "/ai", category: "deep" },
  { title: "Runbook Generator", description: "Operational runbooks from incident context.", href: "/ai", category: "deep" },
  { title: "Capacity Planner", description: "Infrastructure capacity analysis and planning.", href: "/ai", category: "deep" },
  { title: "Optimization Advisor", description: "Performance and cost optimization guidance.", href: "/ai", category: "deep" },
  { title: "Incident Investigator", description: "Deep root cause investigation with reasoning.", href: "/ai", category: "deep" },
  { title: "Weekly Review", description: "Weekly infrastructure review reports.", href: "/ai", category: "deep" },
  { title: "AI Report Generator", description: "Generate comprehensive operational reports.", href: "/reports", category: "deep" },
  { title: "Explain Report", description: "Natural language report explanations.", href: "/reports", category: "fast" },
  { title: "Explain Dashboard", description: "Interpret live dashboard metrics instantly.", href: "/dashboard", category: "fast" },
  { title: "Explain Run", description: "Summarize simulation run behavior.", href: "/dashboard", category: "fast" },
  { title: "Chaos Advisor", description: "Recommend chaos experiment configurations.", href: "/chaos", category: "deep" },
];

export const NVIDIA_MODELS = [
  { key: "ultra", name: "Nemotron Ultra", use: "Deep reasoning & executive briefs", speed: "slow" },
  { key: "super", name: "Nemotron Super", use: "Fast operational explanations", speed: "fast" },
  { key: "llama70b", name: "Llama 3.3 70B", use: "Reliable fallback model", speed: "fast" },
  { key: "llama405b", name: "Llama 3.1 405B", use: "Complex reasoning alternative", speed: "medium" },
  { key: "mistralNemo", name: "Mistral Nemo 12B", use: "Fastest lightweight Q&A", speed: "fastest" },
  { key: "phi35", name: "Phi-3.5 Mini", use: "Lightweight chat responses", speed: "fastest" },
  { key: "deepseekR1", name: "DeepSeek R1", use: "Deep reasoning & root cause", speed: "medium" },
  { key: "qwen25", name: "Qwen 2.5 72B", use: "General analysis & comparisons", speed: "fast" },
];

export const NVIDIA_MODES = [
  { id: "automatic", label: "Automatic", description: "Route by skill — fast skills use Super, deep skills use Ultra." },
  { id: "fast", label: "Fast", description: "Always Nemotron Super for rapid operational responses." },
  { id: "balanced", label: "Balanced", description: "Skill-aware routing between Super and Ultra." },
  { id: "deep", label: "Deep Reasoning", description: "Always Nemotron Ultra with reasoning budget enabled." },
];

export const REPORT_SECTIONS = [
  "Executive Brief",
  "Health Score",
  "Predictive Risk",
  "Root Cause Analysis",
  "Recommendations",
  "Deployment Readiness",
  "Chaos Summary",
  "Incident Timeline",
  "Infrastructure Memory",
  "Operational Insights",
];

export const EXPORT_FORMATS = [
  { format: "PDF", description: "Leadership-ready operational report", ext: "pdf" },
  { format: "JSON", description: "Full structured report data", ext: "json" },
  { format: "CSV", description: "Tabular metrics export", ext: "csv" },
];

export const COMPARISONS = [
  {
    title: "Traditional Load Testing",
    chaosForge: ["Distributed Kafka workers", "Realtime WebSocket telemetry", "Chaos engineering built-in", "AI intelligence on every run", "Executive reports with root cause"],
    traditional: ["Single-process load generators", "Batch result exports", "No fault injection", "Manual analysis required", "Spreadsheet summaries"],
  },
  {
    title: "Traditional Observability",
    chaosForge: ["Load testing + observability unified", "Chaos under traffic conditions", "AI copilot explains dashboards", "Deployment readiness scoring", "Infrastructure memory across runs"],
    traditional: ["Metrics only — no load generation", "No chaos experimentation", "Separate tooling for analysis", "Manual incident correlation", "No run comparison intelligence"],
  },
  {
    title: "Standalone Chaos Tools",
    chaosForge: ["Chaos during live traffic simulation", "5 fault types + 5 profiles", "AI chaos experiment advisor", "Integrated incident timeline", "Full operational reports"],
    traditional: ["Chaos isolated from load context", "Limited fault types", "No AI guidance", "Manual incident tracking", "No unified reporting"],
  },
];

export const DEV_STACK = [
  { name: "REST APIs", detail: "Express 5 gateway" },
  { name: "Kafka", detail: "Event streaming" },
  { name: "Redis", detail: "Runtime state" },
  { name: "MongoDB", detail: "Persistence" },
  { name: "Socket.IO", detail: "Live telemetry" },
  { name: "Docker", detail: "Compose profiles" },
  { name: "Prometheus", detail: "Metrics scraping" },
  { name: "Grafana", detail: "Dashboards" },
  { name: "JWT", detail: "Authentication" },
  { name: "NVIDIA AI", detail: "NIM model routing" },
  { name: "Next.js", detail: "React 19 frontend" },
  { name: "Express", detail: "Node.js API" },
  { name: "Node.js", detail: "Worker processes" },
];

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    subtitle: "For exploring the platform.",
    cta: "Start Building",
    href: "/signup",
    highlighted: false,
    features: ["Basic Simulations", "Basic Reports", "3 Projects", "100 RPS max", "300s duration"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹500",
    suffix: "/mo",
    subtitle: "For scaling distributed teams.",
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
    badge: "Most Popular",
    features: ["Advanced Reports", "AI Intelligence", "Predictive Risk", "Infrastructure Memory", "100 Projects", "10,000 RPS"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹2500",
    suffix: "/mo",
    subtitle: "For mission-critical infrastructure.",
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
    features: ["Unlimited Simulations", "Enterprise Analytics", "Priority Support", "Custom Integrations", "Unlimited RPS"],
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Platform", href: "/dashboard" },
    { label: "Simulations", href: "/simulations" },
    { label: "Chaos Engineering", href: "/chaos" },
    { label: "AI Operations", href: "/ai" },
    { label: "Reports", href: "/reports" },
    { label: "Infrastructure", href: "/infrastructure" },
    { label: "Observability", href: "/observability" },
    { label: "Projects", href: "/projects" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Status", href: "/observability" },
    { label: "Open Source", href: GITHUB_URL, external: true },
    { label: "Roadmap", href: "/roadmap" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Community", href: GITHUB_URL, external: true },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Contact", href: "/contact" },
  ],
};

export const SOCIAL_LINKS = [
  { label: "GitHub", href: PERSONAL_GITHUB_URL },
  { label: "LinkedIn", href: LINKEDIN_URL },
  { label: "Website", href: PORTFOLIO_URL },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}` },
];

export const PLATFORM_FEATURES = [
  {
    title: "Distributed Load Testing",
    description: "Kafka-backed workers simulate global traffic patterns and uncover pressure points before they cascade into incidents.",
    span: "large",
  },
  {
    title: "WebSocket Telemetry",
    description: "Sub-millisecond realtime event streaming directly to observability dashboards.",
    span: "small",
  },
  {
    title: "Prometheus + Grafana",
    description: "Production-grade monitoring integrated with the same intelligence layer as runtime data.",
    span: "small",
  },
  {
    title: "AI-Native Intelligence",
    description: "11 intelligence engines deliver health scores, predictive risk, root cause analysis, and deployment readiness.",
    span: "large",
  },
];
