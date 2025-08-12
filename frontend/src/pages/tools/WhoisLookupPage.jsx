import React, { useState, useEffect, useReducer, useRef } from "react";
import Spotlight from "@/components/Spotlight";
import { Loader2, AlertCircle, Upload, X, Download, Settings2, Info } from "lucide-react";
import { saveAs } from "file-saver";
import Papa from "papaparse";

// Prefer configured base URL; otherwise default to current origin to work in production
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) || window.location.origin;

// Helper function to properly join URL paths without duplicate slashes
const joinPaths = (...parts) => {
  // Remove trailing slashes from the first part and leading slashes from all other parts
  const processedParts = parts.map((part, i) => {
    let processed = part || '';
    if (i === 0) {
      // For first part, remove trailing slash if present
      processed = processed.replace(/\/$/, '');
    } else {
      // For all other parts, remove leading slash if present
      processed = processed.replace(/^\//, '');
    }
    return processed;
  });
  return processedParts.join('/');
};

// Define reducer actions
const ACTIONS = {
  SET_TOTAL: 'set_total',
  ADD_RESULT: 'add_result',
  RESET: 'reset',
  SET_ERROR: 'set_error',
  SET_LOADING: 'set_loading',
  CLEAR_RESULTS: 'clear_results'
};

// Initial state for the reducer
const initialState = {
  total: 0,
  completed: 0,
  results: [],
  loading: false,
  error: ""
};

// Reducer function to handle state updates
function lookupReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TOTAL:
      return { ...initialState, total: action.payload, loading: true };
    case ACTIONS.ADD_RESULT:
      return {
        ...state,
        results: [...state.results, action.payload],
        completed: state.completed + 1,
        loading: state.completed + 1 < state.total, // Set loading to false if all results received
      };
    case ACTIONS.RESET:
      return { ...initialState };
    case ACTIONS.CLEAR_RESULTS:
      return { ...initialState, total: state.total }; // Keep total if a lookup was initiated
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// Configuration for checkboxes
// 'id' is for state key, 'label' for UI, 'fieldKey' for backend request and data access
const initialCheckboxConfig = [
  { id: 'domain',        label: 'Domain Name',       fieldKey: 'domain',            defaultChecked: true,  alwaysEnabled: true,  rdapDisabled: false },
  { id: 'registrar',     label: 'Registrar',         fieldKey: 'registrar',         defaultChecked: true,  alwaysEnabled: true,  rdapDisabled: false },
  { id: 'registrant',    label: 'Registrant',        fieldKey: 'registrant_name',   defaultChecked: true,  alwaysEnabled: true,  rdapDisabled: true  },
  { id: 'status',        label: 'Domain Status',     fieldKey: 'statuses',          defaultChecked: true,  alwaysEnabled: true,  rdapDisabled: false },
  { id: 'regDate',       label: 'Registration Date', fieldKey: 'creation_date',     defaultChecked: true,  alwaysEnabled: true,  rdapDisabled: false },
  { id: 'nexus',         label: 'Nexus Categories',  fieldKey: 'nexus_categories',  defaultChecked: false, alwaysEnabled: true,  rdapDisabled: true  },
  { id: 'nameservers',   label: 'Nameservers',       fieldKey: 'nameservers',       defaultChecked: false, alwaysEnabled: true,  rdapDisabled: false },
  { id: 'useRDAP',       label: 'Use RDAP (fallback to WHOIS)', fieldKey: 'use_rdap', defaultChecked: false, alwaysEnabled: true, rdapDisabled: false }
];

const WhoisLookupPage = () => {
  const [domains, setDomains] = useState("");
  const [state, dispatch] = useReducer(lookupReducer, initialState);
  // Controller for cancelling in-flight lookups
  const controllerRef = useRef(null);

  // Initialize checkbox states from config
  const [checkboxStates, setCheckboxStates] = useState(() => {
    const initialStates = {};
    initialCheckboxConfig.forEach(cb => {
      initialStates[cb.id] = cb.defaultChecked;
    });
    return initialStates;
  });

  // Effect to handle RDAP checkbox logic
  useEffect(() => {
    if (checkboxStates.useRDAP) {
      // If RDAP is checked, uncheck and disable Registrant and Nexus
      setCheckboxStates(prev => ({
        ...prev,
        registrant: false,
        nexus: false
      }));
    } 
    // No 'else' needed to re-enable, as their 'disabled' status is handled in JSX
  }, [checkboxStates.useRDAP]);

  const handleCheckboxChange = (id) => {
    setCheckboxStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDomains(e.target.result);
      };
      reader.readAsText(file);
    }
    event.target.value = null; // Reset file input
  };

  const handleLookup = () => {
    // Normalize and de-duplicate domains (case-insensitive), preserving first occurrence
    const seen = new Set();
    const domainsArray = domains
      .split(/\n|,/)
      .map(d => d.trim())
      .filter(d => {
        if (!d) return false;
        const key = d.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    if (domainsArray.length === 0) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: "Please enter at least one domain." });
      return;
    }

    dispatch({ type: ACTIONS.RESET }); // Reset state before new lookup
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    // Determine which fields to request based on checked & enabled checkboxes
    const fieldsToRequest = initialCheckboxConfig
      .filter(cb => cb.id !== 'useRDAP' && checkboxStates[cb.id] && (cb.alwaysEnabled || !checkboxStates.useRDAP || !cb.rdapDisabled))
      .map(cb => cb.fieldKey);

    const payload = {
      domains: domainsArray,
      fields: fieldsToRequest,
      use_rdap: checkboxStates.useRDAP
    };

    // Cancel any in-flight request
    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch (_) {}
      controllerRef.current = null;
    }

    // Create proper URL path, handling whether API_BASE_URL already has '/api' or not
    const apiPath = API_BASE_URL.endsWith('/api') || API_BASE_URL === '/api' ? 'whois-lookup' : 'api/whois-lookup';
    const sseUrl = joinPaths(API_BASE_URL, apiPath);
    
    // NOTE: We use fetch streaming with an AbortController for robust POST + SSE handling

    console.log('Initiating WHOIS/RDAP lookup for:', payload.domains, 'Using RDAP:', payload.use_rdap);
    console.log('API URL:', sseUrl);
    // Create a new controller for this request
    controllerRef.current = new AbortController();

    fetch(sseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify(payload),
        signal: controllerRef.current.signal
    })
    .then(response => {
        console.log('Response received:', response.status, response.statusText);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (!response.body) {
            throw new Error('Response body is null');
        }
        
        // Check content type - this helps diagnose MIME type errors
        const contentType = response.headers.get('Content-Type');
        console.log('Content-Type:', contentType);
        if (!contentType || !contentType.includes('text/event-stream')) {
            console.warn('Warning: Response Content-Type is not text/event-stream:', contentType);
        }
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        function processChunk(text) {
            buffer += text;
            // Split on blank line boundaries, handling both LF and CRLF
            const parts = buffer.split(/\r?\n\r?\n/);
            // Keep the last partial fragment in buffer
            buffer = parts.pop() || '';
            for (const eventString of parts) {
                const lines = eventString.split(/\r?\n/);
                let eventType = 'message';
                let dataLines = [];
                for (const rawLine of lines) {
                    const line = rawLine; // already split without newlines
                    if (line.startsWith('event:')) {
                        eventType = line.substring('event:'.length).trimStart().trimEnd();
                    } else if (line.startsWith('data:')) {
                        // Per SSE spec, data may have a leading space after the colon
                        dataLines.push(line.substring('data:'.length).trimStart());
                    }
                }
                const eventData = dataLines.join('\n').trim();
                if (!eventData) continue;
                try {
                    const jsonData = JSON.parse(eventData);
                    if (eventType === 'total') {
                        dispatch({ type: ACTIONS.SET_TOTAL, payload: jsonData.total });
                    } else if (eventType === 'result') {
                        dispatch({ type: ACTIONS.ADD_RESULT, payload: jsonData });
                    } else if (eventType === 'error') {
                        dispatch({ type: ACTIONS.SET_ERROR, payload: jsonData.message || 'An error occurred during lookup.' });
                        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                        reader.cancel();
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing SSE data:', e, 'Raw data:', eventData);
                    dispatch({ type: ACTIONS.SET_ERROR, payload: 'Error processing data from server.' });
                }
            }
        }

        function readLoop() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                    buffer = '';
                    // Clear controller on completion
                    controllerRef.current = null;
                    return;
                }
                const chunk = decoder.decode(value, { stream: true });
                processChunk(chunk);
                readLoop();
            }).catch(error => {
                if (error && error.name === 'AbortError') {
                    console.log('Lookup aborted by user.');
                } else {
                    console.error('SSE Error:', error);
                    dispatch({ type: ACTIONS.SET_ERROR, payload: `Connection error: ${error.message}` });
                }
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            });
        }
        readLoop();
    })
    .catch(error => {
        console.error('Fetch Setup Error:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: `Failed to connect: ${error.message}` });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    });
  };

  const handleClearAll = () => {
    setDomains("");
    dispatch({ type: ACTIONS.RESET });
    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch (_) {}
      controllerRef.current = null;
    }
    // Reset checkboxes to default
    const initialStates = {};
    initialCheckboxConfig.forEach(cb => {
      initialStates[cb.id] = cb.defaultChecked;
    });
    setCheckboxStates(initialStates);
  };

  const handleClearResults = () => {
    dispatch({ type: ACTIONS.CLEAR_RESULTS });
  };

  const handleExport = () => {
    if (state.results.length === 0) {
      alert('No results to export.');
      return;
    }

    const visibleFieldsConfig = initialCheckboxConfig.filter(cb => cb.id !== 'useRDAP' && checkboxStates[cb.id]);
    
    const dataToExport = state.results.map(result => {
      const row = {};
      visibleFieldsConfig.forEach(config => {
        let value = result[config.fieldKey];
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        row[config.label] = value !== undefined && value !== null ? String(value) : ""; 
      });
      return row;
    });

    if (dataToExport.length === 0) {
      alert('No data to export based on current selections.');
      return;
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'whois_rdap_lookup_results.csv');
  };
  
  const progress = state.total > 0 ? (state.completed / state.total) * 100 : 0;

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#4F46E5" />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Bulk WHOIS/RDAP Lookup
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter domains, select fields, and choose your lookup method. Results stream in real-time.
          </p>
        </div>

        {/* Domain Input Section */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-5 text-indigo-600 dark:text-indigo-400">Input Domains</h2>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100 resize-y min-h-[150px]"
            placeholder="Enter domains, one per line or comma-separated...\nexample.com\nexample.net, example.org"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
          />
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <label htmlFor="file-upload" className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out inline-flex items-center mb-2 sm:mb-0">
              <Upload size={18} className="mr-2" /> Upload .txt File
            </label>
            <input id="file-upload" type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
            <button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out inline-flex items-center"
            >
              <X size={18} className="mr-2" /> Clear Input & Results
            </button>
          </div>
        </div>

        {/* Field Selection Section */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">Select Fields & Method</h2>
            <Settings2 size={28} className="text-indigo-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {initialCheckboxConfig.map(cb => (
              <label key={cb.id} className={`flex items-center p-3 rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-2 ${checkboxStates[cb.id] ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 transition duration-150 ease-in-out mr-3"
                  checked={checkboxStates[cb.id]}
                  onChange={() => handleCheckboxChange(cb.id)}
                  disabled={cb.id === 'useRDAP' ? false : (cb.rdapDisabled && checkboxStates.useRDAP)}
                />
                <span className={`text-sm font-medium ${ (cb.rdapDisabled && checkboxStates.useRDAP) ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>{cb.label}</span>
              </label>
            ))}
          </div>
          {checkboxStates.useRDAP && (
             <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-md">
                <div className="flex items-center">
                    <Info size={20} className="text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        When RDAP is selected, 'Registrant' and 'Nexus Categories' are unavailable as RDAP services often redact this information for privacy or it's not part of the standard RDAP response.
                    </p>
                </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleLookup}
            disabled={state.loading}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
          >
            {state.loading ? <Loader2 size={22} className="animate-spin mr-2" /> : <Settings2 size={22} className="mr-2" />} 
            {state.loading ? 'Looking up...' : 'Start Lookup'}
          </button>
        </div>

        {/* Progress and Results Section */}
        {(state.total > 0 || state.loading || state.error) && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Results</h2>
            {state.loading && state.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-indigo-700 dark:text-indigo-300">Progress</span>
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{state.completed} of {state.total} domains</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {state.error && (
              <div className="my-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md shadow-md flex items-center">
                <AlertCircle size={20} className="mr-3 flex-shrink-0" /> 
                <span>Error: {state.error}</span>
              </div>
            )}

            {state.results.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleExport}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out inline-flex items-center text-sm"
                        disabled={state.loading && state.results.length === 0}
                    >
                        <Download size={16} className="mr-2" /> Export as CSV
                    </button>
                    <button
                        onClick={handleClearResults}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out inline-flex items-center text-sm"
                        disabled={state.loading && state.results.length === 0}
                    >
                        <X size={16} className="mr-2" /> Clear Results Only
                    </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {initialCheckboxConfig.filter(cb => cb.id !== 'useRDAP' && checkboxStates[cb.id] && (cb.alwaysEnabled || !checkboxStates.useRDAP || !cb.rdapDisabled)).map(config => (
                          <th key={config.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {config.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {state.results.map((result, index) => (
                        <tr key={index} className={`${result.error_message ? 'bg-red-50 dark:bg-red-900/10' : (index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50')}`}>
                          {initialCheckboxConfig.filter(cb => cb.id !== 'useRDAP' && checkboxStates[cb.id] && (cb.alwaysEnabled || !checkboxStates.useRDAP || !cb.rdapDisabled)).map(config => (
                            <td key={config.id} className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 break-words">
                              {Array.isArray(result[config.fieldKey]) ? result[config.fieldKey].join('; ') : (result[config.fieldKey] !== undefined && result[config.fieldKey] !== null ? String(result[config.fieldKey]) : 'N/A')}
                            </td>
                          ))}
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
    </div>
  );
};

export default WhoisLookupPage;
