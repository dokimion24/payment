'use client';

import { useRouter } from 'next/navigation';

interface ValidationErrorPageProps {
  title: string;
  description: string;
  errors: { message: string }[];
  backLabel: string;
}

export function ValidationErrorPage({
  title,
  description,
  errors,
  backLabel,
}: ValidationErrorPageProps) { 
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ef4444"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-4">{description}</p>
        <ul className="text-left text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-6">
          {errors.map((issue, i) => (
            <li key={i}>{issue.message}</li>
          ))}
        </ul>
        <button
          onClick={() => router.push('/')}
          className="bg-gray-900 text-white rounded-xl px-8 py-3 font-medium hover:bg-gray-800"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
