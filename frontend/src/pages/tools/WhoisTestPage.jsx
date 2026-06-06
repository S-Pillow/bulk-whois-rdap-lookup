import React, { useState } from 'react';

function WhoisTestPage() {
  const [domains, setDomains] = useState('google.com\nexample.com');
  const [useRDAP, setUseRDAP] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);

  const testDomainLookup = async () => {
    setLoading(true);
    setApiResponse(null);
    setError(null);
    
    const domainList = domains
      .split(/\r?\n/)
      .map(d => d.trim())
      .filter(Boolean);
      
    const payload = {
      domains: domainList,
      use_rdap: useRDAP,
      include_registrar: true,
      include_registrant: true,
      include_status: true,
      include_nexus: true,
      include_regdate: true
    };
    
    setRequestDetails({
      url: '/api/lookup-domains',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload, null, 2)
    });

    try {
      console.log('Making API request with payload:', payload);
      const response = await fetch('/api/lookup-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      if (!response.ok) {
        setError(`API Error (${response.status}): ${responseText}`);
        return;
      }

      try {
        const data = JSON.parse(responseText);
        console.log('Parsed API Response:', data);
        setApiResponse(data);
      } catch (parseError) {
        setError(`Failed to parse JSON response: ${parseError.message}\n\nRaw response: ${responseText}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      setError(`Request failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Test RDAP/WHOIS Lookup</h1>
      
      <div className="mb-4">
        <label className="block mb-2 text-foreground">Domains (one per line):</label>
        <textarea 
          value={domains} 
          onChange={(e) => setDomains(e.target.value)}
          className="w-full p-2 border rounded bg-background text-foreground"
          rows={4}
        />
      </div>
      
      <div className="mb-4">
        <label className="flex items-center gap-2 text-foreground">
          <input 
            type="checkbox" 
            checked={useRDAP} 
            onChange={(e) => setUseRDAP(e.target.checked)} 
          />
          Use RDAP (uncheck for WHOIS)
        </label>
      </div>
      
      <button
        onClick={testDomainLookup}
        disabled={loading}
        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Run Test'}
      </button>
      
      {requestDetails && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-foreground">Request Details</h2>
          <pre className="bg-muted text-muted-foreground p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(requestDetails, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-destructive">Error</h2>
          <pre className="bg-destructive/10 text-destructive p-4 rounded overflow-auto max-h-60 border border-destructive/20">
            {error}
          </pre>
        </div>
      )}
      
      {apiResponse && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-green-600 dark:text-green-400">API Response</h2>
          <pre className="bg-green-500/10 text-green-700 dark:text-green-300 p-4 rounded overflow-auto max-h-96 border border-green-500/20">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
          
          {apiResponse.results && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-foreground">Results Table</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full bg-card">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border-b p-2 text-left text-foreground">Domain</th>
                      <th className="border-b p-2 text-left text-foreground">Method</th>
                      <th className="border-b p-2 text-left text-foreground">Registrar</th>
                      <th className="border-b p-2 text-left text-foreground">Registrant</th>
                      <th className="border-b p-2 text-left text-foreground">Status</th>
                      <th className="border-b p-2 text-left text-foreground">Creation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiResponse.results.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 text-card-foreground">{item.domain}</td>
                        <td className="p-2 text-card-foreground">{item.method}</td>
                        <td className="p-2 text-card-foreground">{item.registrar}</td>
                        <td className="p-2 text-card-foreground">{item.registrant_name}</td>
                        <td className="p-2 text-card-foreground">{Array.isArray(item.statuses) ? item.statuses.join(', ') : item.statuses}</td>
                        <td className="p-2 text-card-foreground">{item.creation_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WhoisTestPage;
