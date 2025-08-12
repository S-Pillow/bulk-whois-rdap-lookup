import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Globe, Search, ListChecks } from "lucide-react";

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
  },
  {
    title: "TakedownIQ",
    description: "Automate evidence collection, analysis, and takedown requests for malicious domains.",
    icon: <ShieldCheck className="h-6 w-6 text-cyan-600" />,
    path: "/tools/takedowniq",
  },
];

const ToolsPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-6 sm:px-12 lg:px-24">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Available Tools</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          tool.title === "CN Domain Categorizer" || tool.title === "TakedownIQ" ? (
            <a
              key={tool.title}
              href={tool.path}
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl"
              target="_self"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-100 p-2">{tool.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {tool.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
                </div>
              </div>
            </a>
          ) : (
            <Link
              key={tool.title}
              to={tool.path}
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-100 p-2">{tool.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {tool.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
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
