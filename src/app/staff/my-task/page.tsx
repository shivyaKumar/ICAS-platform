'use client'; // keep if this page uses hooks or browser APIs; delete if server component

export default function MyTaskPage() {
  return (
    <main className="p-6">
      <h1>My Task</h1>
    </main>
  );
}

// keeps TS happy even if you remove imports later
export {};
