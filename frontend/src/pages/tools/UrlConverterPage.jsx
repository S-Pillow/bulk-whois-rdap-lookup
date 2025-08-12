import React, { useState, useRef } from "react";
import { sanitizeUrls, unsanitizeUrls, extractDomains } from "@/lib/urlUtils";
import { Copy, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function UrlConverterPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const outputRef = useRef(null);

  const handlePasteClean = (e) => {
    let pastedText = e.clipboardData.getData('text');
    pastedText = pastedText.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
    e.preventDefault();
    setInputText((prev) => prev + pastedText);
  };

  const handleSanitize = () => {
    const urls = inputText.split("\n").map(line => line.trim()).filter(Boolean);
    setOutputText(sanitizeUrls(urls).join("\n"));
  };

  const handleUnsanitize = () => {
    const urls = inputText.split("\n").map(line => line.trim()).filter(Boolean);
    setOutputText(unsanitizeUrls(urls).join("\n"));
  };

  const handleExtract = () => {
    const urls = inputText.split("\n").map(line => line.trim()).filter(Boolean);
    setOutputText(extractDomains(urls).join("\n"));
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="flex justify-center mb-6">
        <ShieldCheck className="h-12 w-12 text-green-400" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-4xl font-bold tracking-wide text-green-400"
      >
        URL Converter
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 relative">
        {/* Input Box */}
        <textarea
          className="w-full h-96 bg-black border border-green-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          placeholder="Paste URLs here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPaste={handlePasteClean}
        />

        {/* Output Box */}
        <div className="relative">
          <textarea
            ref={outputRef}
            className="w-full h-96 bg-black border border-green-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            placeholder="Output appears here..."
            value={outputText}
            readOnly
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-green-400 hover:text-green-200 border border-green-400 rounded px-3 py-1 text-xs"
          >
            <Copy className="inline mr-1 w-4 h-4" /> Copy
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mt-8">
        <button
          onClick={handleSanitize}
          className="border border-green-400 text-green-400 hover:bg-green-700 hover:text-black px-6 py-2 rounded-md transition"
        >
          SANITIZE URLS
        </button>
        <button
          onClick={handleUnsanitize}
          className="border border-green-400 text-green-400 hover:bg-green-700 hover:text-black px-6 py-2 rounded-md transition"
        >
          UNSANITIZE URLS
        </button>
        <button
          onClick={handleExtract}
          className="border border-green-400 text-green-400 hover:bg-green-700 hover:text-black px-6 py-2 rounded-md transition"
        >
          EXTRACT DOMAINS
        </button>
        <button
          onClick={handleClear}
          className="border border-red-400 text-red-400 hover:bg-red-700 hover:text-black px-6 py-2 rounded-md transition"
        >
          CLEAR INPUT/OUTPUT
        </button>
      </div>
    </div>
  );
}

export default UrlConverterPage;
