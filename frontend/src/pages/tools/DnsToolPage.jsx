import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Globe, Search, Loader2, Server } from "lucide-react";
import { getApiUrl } from "@/config/api";
import { testApiConnection } from "@/utils/apiDebug";
import { Button } from "@/components/ui/button";

const RECORD_TYPES = [
  "A", "AAAA", "MX", "NS", "TXT", "SOA", "CNAME", "PTR"
];

function DnsToolPage() {
  const [domain, setDomain] = useState("");
  const [nameservers, setNameservers] = useState(["", "", "", ""]);
  const [recordType, setRecordType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [apiStatus, setApiStatus] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkApiConnection = async () => {
      const result = await testApiConnection();
      setApiStatus(result);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "API Connection Error",
          description: `Failed to connect to API: ${result.error}`,
        });
      }
    };

    checkApiConnection();
  }, [toast]);

  const handleNameserverChange = (index, value) => {
    const newNameservers = [...nameservers];
    newNameservers[index] = value;
    setNameservers(newNameservers);
  };

  const handleLookup = async () => {
    if (!domain.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a domain name.",
      });
      return;
    }

    // Only require nameservers for specific record types that need them
    const activeNameservers = nameservers.filter(ns => ns.trim());
    const optionalNameserverRecords = ["NS", "SOA", "A", "AAAA", "MX", "TXT", "CNAME", "PTR"];
    if (activeNameservers.length === 0 && !optionalNameserverRecords.includes(recordType)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter at least one nameserver.",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // If no nameservers provided for certain record types, backend will use system default
      // For these records with no nameservers, use a special identifier that will be handled by the backend
      const optionalNameserverRecords = ["NS", "SOA", "A", "AAAA", "MX", "TXT", "CNAME", "PTR"];
      const serversToQuery = activeNameservers.length > 0 ? 
                            activeNameservers : 
                            (optionalNameserverRecords.includes(recordType) ? ["system_default"] : []);
      const queries = serversToQuery.map(async (nameserver) => {
        try {
          const response = await fetch(getApiUrl("/dns-query"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              domain,
              record_type: recordType,
              nameservers: [nameserver], // Always array
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const singleResult = data.results?.[0];

          if (!singleResult || !singleResult.text) {
            throw new Error("Empty or invalid response received.");
          }

          return {
            nameserver,
            success: true,
            result: singleResult.text,
            is_authoritative: singleResult.is_authoritative,
          };
        } catch (error) {
          console.error(`Error querying ${nameserver}:`, error.message);

          // Friendly toast for each failed nameserver
          toast({
            variant: "destructive",
            title: "Lookup Failed",
            description: `Failed querying ${nameserver}: ${error.message}`,
          });

          return {
            nameserver,
            success: false,
            error: error.message,
          };
        }
      });

      const results = await Promise.all(queries);
      setResults(results);

      if (!results.length) {
        toast({
          variant: "destructive",
          title: "No Results",
          description: "No data was returned from the DNS server.",
        });
      }

      const allFailed = results.every(result => !result.success);
      if (allFailed) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "All lookups failed. Please check your nameservers and try again.",
        });
      }
    } catch (error) {
      console.error("Lookup process failed:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unexpected error during DNS lookup.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderApiStatus = () => {
    if (!apiStatus || apiStatus.success) return null;

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <h3 className="text-red-800 dark:text-red-200 font-medium">API Connection Error</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">{apiStatus.error}</p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">Status: {apiStatus.status}</p>
      </div>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="mt-8 text-center text-muted-foreground">
          Fetching results...
        </div>
      );
    }

    if (!results.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 space-y-6"
      >
        {results.map((result, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card/50 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{result.nameserver}</h3>
              {result.success ? (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.is_authoritative
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}>
                  {result.is_authoritative ? "Authoritative" : "Non-Authoritative"}
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                  Error
                </span>
              )}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm font-mono bg-background/50 p-4 rounded-md">
              {result.success ? result.result : result.error}
            </pre>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">DNS Lookup Tool</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Professional DNS record lookup and analysis
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card p-6"
      >
        {renderApiStatus()}
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Name</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Record Type</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RECORD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">
              {["NS", "SOA", "A", "AAAA", "MX", "TXT", "CNAME", "PTR"].includes(recordType) ? 
                "Nameservers (Optional)" : "Nameservers"}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {nameservers.map((ns, index) => (
                <div key={index} className="relative">
                  <Server className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={ns}
                    onChange={(e) => handleNameserverChange(index, e.target.value)}
                    placeholder={`${["NS", "SOA", "A", "AAAA", "MX", "TXT", "CNAME", "PTR"].includes(recordType) ? "Optional - " : ""}Nameserver ${index + 1} (e.g., 8.8.8.8)`}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  />
                </div>
              ))}
            </div>
            {["NS", "SOA", "A", "AAAA", "MX", "TXT", "CNAME", "PTR"].includes(recordType) && (
              <p className="text-xs text-muted-foreground">
                For {recordType} records, nameservers are optional. If none are provided, system default nameservers will be used.
              </p>
            )}
          </div>

          <Button
            onClick={handleLookup}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Lookup
              </>
            )}
          </Button>
        </div>

        {renderResults()}
      </motion.div>
    </div>
  );
}

export default DnsToolPage;
