'use client';

import { useState } from 'react';
import { GovernmentScheme } from '@/firebase/schemes';
import { Edit, Trash2, ExternalLink, Eye, X } from 'lucide-react';

interface SchemeTableProps {
  schemes: GovernmentScheme[];
  onEdit: (scheme: GovernmentScheme) => void;
  onDelete: (id: string) => void;
}

export default function SchemeTable({ schemes, onEdit, onDelete }: SchemeTableProps) {
  const [viewingScheme, setViewingScheme] = useState<GovernmentScheme | null>(null);

  if (schemes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No schemes found. Click "Add Scheme" to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scheme Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schemes.map((scheme) => (
            <tr key={scheme.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono font-medium text-gray-900">{scheme.scheme_code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{scheme.scheme_name}</div>
                {scheme.official_website && (
                  <a
                    href={scheme.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={12} />
                    Visit Website
                  </a>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {scheme.category.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-md truncate" title={scheme.description}>
                  {scheme.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {scheme.is_active ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingScheme(scheme)}
                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(scheme)}
                    className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => scheme.id && onDelete(scheme.id)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewingScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{viewingScheme.scheme_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{viewingScheme.full_name}</p>
              </div>
              <button
                onClick={() => setViewingScheme(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Scheme Code</h3>
                  <p className="text-gray-900 font-mono">{viewingScheme.scheme_code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Category</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {viewingScheme.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{viewingScheme.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Eligibility</h3>
                <ul className="list-disc list-inside space-y-1">
                  {Array.isArray(viewingScheme.eligibility) ? (
                    viewingScheme.eligibility.map((item, idx) => (
                      <li key={idx} className="text-gray-900">{item}</li>
                    ))
                  ) : (
                    <li className="text-gray-900">{viewingScheme.eligibility}</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Required Documents</h3>
                <ul className="list-disc list-inside space-y-1">
                  {Array.isArray(viewingScheme.required_documents) ? (
                    viewingScheme.required_documents.map((doc, idx) => (
                      <li key={idx} className="text-gray-900">{doc}</li>
                    ))
                  ) : (
                    <li className="text-gray-900">As per scheme guidelines</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Benefits</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{viewingScheme.benefits}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Application Process</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{viewingScheme.application_process}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {viewingScheme.deadline && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Deadline</h3>
                    <p className="text-gray-900">{viewingScheme.deadline}</p>
                  </div>
                )}
                {viewingScheme.contact_number && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact</h3>
                    <p className="text-gray-900">{viewingScheme.contact_number}</p>
                  </div>
                )}
              </div>

              {viewingScheme.official_website && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Official Website</h3>
                  <a
                    href={viewingScheme.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    {viewingScheme.official_website}
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setViewingScheme(null);
                    onEdit(viewingScheme);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  Edit Scheme
                </button>
                <button
                  onClick={() => setViewingScheme(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
