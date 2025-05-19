import React from 'react';

// institution dashboard: shows complaints routed to this institution
export default function InstitutionPending() {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Institution Registration Pending</h2>
        <p className="text-gray-700">
          Your institution account is awaiting admin approval. You’ll be able to see and manage
          complaints as soon as an administrator approves your registration.
        </p>
      </div>
    </div>
  );
}
