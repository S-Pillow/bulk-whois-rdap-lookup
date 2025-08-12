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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test RDAP/WHOIS Lookup</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Domains (one per line):</label>
        <textarea 
          value={domains} 
          onChange={(e) => setDomains(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>
      
      <div className="mb-4">
        <label className="flex items-center gap-2">
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
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 disabled:bg-blue-300"
      >
        {loading ? 'Loading...' : 'Run Test'}
      </button>
      
      {requestDetails && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Request Details</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(requestDetails, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
          <pre className="bg-red-50 text-red-800 p-4 rounded overflow-auto max-h-60">
            {error}
          </pre>
        </div>
      )}
      
      {apiResponse && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-green-600">API Response</h2>
          <pre className="bg-green-50 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
          
          {apiResponse.results && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Results Table</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="border p-2">Domain</th>
                      <th className="border p-2">Method</th>
                      <th className="border p-2">Registrar</th>
                      <th className="border p-2">Registrant</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Creation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiResponse.results.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.domain}</td>
                        <td className="border p-2">{item.method}</td>
                        <td className="border p-2">{item.registrar}</td>
                        <td className="border p-2">{item.registrant_name}</td>
                        <td className="border p-2">{Array.isArray(item.statuses) ? item.statuses.join(', ') : item.statuses}</td>
                        <td className="border p-2">{item.creation_date}</td>
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
