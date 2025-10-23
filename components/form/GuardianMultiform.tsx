'use client';

import React from 'react';

export interface Guardian {
  name: string;
  relationship: string;
  email: string;
}

interface GuardianMultiformProps {
  guardians: Guardian[];
  onChange: (guardians: Guardian[]) => void;
  className?: string;
}

const GuardianMultiform: React.FC<GuardianMultiformProps> = ({
  guardians,
  onChange,
  className = '',
}) => {
  const handleAdd = () => {
    onChange([...guardians, { name: '', relationship: '', email: '' }]);
  };

  const handleRemove = (index: number) => {
    const updated = guardians.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : [{ name: '', relationship: '', email: '' }]);
  };

  const handleChange = (index: number, field: keyof Guardian, value: string) => {
    const updated = [...guardians];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-lg font-bold text-gray-700 mb-4">
        Guardians (Optional)
      </h4>

      <div className="space-y-6">
        {guardians.map((guardian, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-xl bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-semibold text-gray-700">Guardian {index + 1}</h5>
              <div className="flex gap-2">
                {index === guardians.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full font-bold"
                    aria-label="Add Guardian"
                  >
                    +
                  </button>
                )}
                {guardians.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full font-bold"
                    aria-label="Remove Guardian"
                  >
                    −
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={guardian.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder="Enter guardian name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={guardian.relationship}
                  onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                  placeholder="e.g., Father, Mother"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={guardian.email}
                  onChange={(e) => handleChange(index, 'email', e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardianMultiform;
