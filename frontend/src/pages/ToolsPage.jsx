import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Globe, Search, ListChecks, Briefcase, Shield, ShieldAlert } from "lucide-react";

const tools = [
  {
    title: "DNS Lookup",
    description: "Query DNS records for any domain using public resolvers.",
    icon: <Globe className="h-6 w-6 text-blue-600" />,
    path: "/tools/dns-lookup",
  },
  {
    title: "URL Converter",
    description: "Sanitize, unsanitize, and extract domains from URLs.",
    icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
    path: "/tools/url-converter",
  },
  {
    title: "WHOIS Lookup",
    description: "Perform WHOIS or RDAP lookups for domain data.",
    icon: <Search className="h-6 w-6 text-purple-600" />,
    path: "/tools/whois-lookup",
  },
  {
    title: "CN Domain Categorizer",
    description: "Classify Chinese-namespace domains.",
    icon: <ListChecks className="h-6 w-6" style={{color: '#d72631', background: 'linear-gradient(90deg, #ffd700 60%, #d72631 100%)', borderRadius: '50%'}} />,
    path: "/tools/cn_domain_categorizer",
    external: true,
  },
  {
    title: "TakedownIQ",
    description: "Automate evidence collection, analysis, and takedown requests for malicious domains.",
    icon: <ShieldCheck className="h-6 w-6 text-cyan-600" />,
    path: "/tools/takedowniq",
    external: true,
  },
  {
    title: "Job Tracker",
    description: "Track multi-step registrar workflows (Terminations, Name Changes, Assignments).",
    icon: <Briefcase className="h-6 w-6 text-amber-600" />,
    path: "/tools/job-tracker",
    external: true,
  },
  {
    title: "VirusTotal Bulk Check",
    description: "Paste domains and URLs to fetch VirusTotal detection counts in a throttled batch.",
    icon: <Shield className="h-6 w-6 text-red-600" />,
    path: "/tools/vt-bulk-check",
    external: true,  // Standalone app served by Nginx
  },
  {
    title: "URL Activity Scanner",
    description: "Check whether suspicious URLs appear active without viewing, rendering, downloading, or storing content.",
    icon: <ShieldCheck className="h-6 w-6 text-cyan-500" />,
    path: "/tools/url-activity-scanner",
    external: true,  // Standalone Next.js app proxied to port 3002
  },
  {
    title: "MDI",
    description: "Malicious Domain Identifier — combine domain reputation, WHOIS, and live activity into a single check.",
    icon: <ShieldAlert className="h-6 w-6 text-orange-600" />,
    path: "/tools/mdi",
    external: true,  // Standalone app at /var/www/html/tools/mdi/
  },
];

const ToolsPage = () => {
  return (
    <div className="py-8 px-2 sm:px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Available Tools</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          tool.external ? (
            <a
              key={tool.title}
              href={tool.path}
              className="group block rounded-xl border bg-card p-6 shadow-md transition hover:shadow-xl hover:bg-accent/50 dark:shadow-lg dark:shadow-black/20"
              target="_self"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted p-2">{tool.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground group-hover:text-primary">
                    {tool.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </a>
          ) : (
            <Link
              key={tool.title}
              to={tool.path}
              className="group block rounded-xl border bg-card p-6 shadow-md transition hover:shadow-xl hover:bg-accent/50 dark:shadow-lg dark:shadow-black/20"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted p-2">{tool.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground group-hover:text-primary">
                    {tool.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
