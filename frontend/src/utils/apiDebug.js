import React from "react";
import { getApiUrl } from "@/config/api";

export const testApiConnection = async () => {
  try {
    // Test basic DNS query
    const testData = {
      domain: "google.com",
      record_type: "A",
      nameservers: ["8.8.8.8"],  // 🔥 fixed: should be an array of nameservers, not a single string
    };

    console.log("Testing API connection...");
    const endpoint = getApiUrl("/dns-query");
    console.log("Endpoint:", endpoint);
    console.log("Test data:", testData);

    const response = await fetch(endpoint, {
      method: "POST",  // 🔥 Always POST!
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      return {
        success: false,
        status: response.status,
        error: errorText,
      };
    }

    const data = await response.json();
    console.log("API Response Data:", data);

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("API Connection Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
