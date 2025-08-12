// Sanitize URLs by obfuscating protocols and dots
export function sanitizeUrls(urls) {
  return urls.map((url) => {
    let cleaned = url.trim();

    // Auto-prepend http:// if protocol is missing
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = "http://" + cleaned;
    }

    // Convert protocols and obfuscate dots
    cleaned = cleaned
      .replace(/^https:\/\//i, "hXXps://")
      .replace(/^http:\/\//i, "hXXp://")
      .replace(/\./g, "[.]");

    return cleaned;
  });
}

// Unsanitize URLs by restoring protocols and dots
export function unsanitizeUrls(urls) {
  return urls.map((url) => {
    let cleaned = url.trim();

    // Restore protocols
    cleaned = cleaned
      .replace(/^hXXps:\/\//i, "https://")
      .replace(/^hXXp:\/\//i, "http://");

    // Restore dots
    cleaned = cleaned.replace(/\[\.\]/g, ".");

    // If still no protocol, default to http://
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = "http://" + cleaned;
    }

    return cleaned;
  });
}

// Extract just the domain name (e.g., from full URL)
export function extractDomains(urls) {
  const domainSet = new Set();

  urls.forEach((raw) => {
    let cleaned = raw.trim();

    // Remove protocol if present
    cleaned = cleaned.replace(/^(hXXps?|https?):\/\//i, "");

    // Restore dots if obfuscated
    cleaned = cleaned.replace(/\[\.\]/g, ".");

    const domainMatch = cleaned.match(/^([^\s\/]+)/);
    if (domainMatch) {
      const fullDomain = domainMatch[1].toLowerCase();
      const parts = fullDomain.split(".");

      // Extract second-level + top-level domain
      const domain =
        parts.length >= 2 ? parts.slice(-2).join(".") : fullDomain;

      domainSet.add(domain);
    }
  });

  return Array.from(domainSet);
}
