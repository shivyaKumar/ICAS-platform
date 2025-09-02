'use client'; // keep if you use hooks/state; remove if server component is fine

import React from 'react';

export default function StaffDashboardPage() {
  return (
    <main className="p-6">
      <h1>Staff Dashboard</h1>
      <p>It builds! 🧱</p>
    </main>
  );
}

// ensures TS treats this file as a module even if imports get removed later
export {};
