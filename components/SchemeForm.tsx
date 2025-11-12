'use client';

import { useState, useEffect } from 'react';
import { GovernmentScheme } from '@/firebase/schemes';
import { X } from 'lucide-react';

interface SchemeFormProps {
  scheme: GovernmentScheme | null;
  onSubmit: (scheme: Omit<GovernmentScheme, 'id' | 'idx'>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'credit',
  'market_linkage',
  'income_support',
  'organic_farming',
  'soil_health',
  'mechanization',
  'horticulture',
  'insurance',
  'irrigation',
  'women_empowerment',
  'seed_development',
  'animal_husbandry',
  'cooperative_farming',
  'general'
];

export default function SchemeForm({ scheme, onSubmit, onCancel }: SchemeFormProps) {
  const [formData, setFormData] = useState({
    scheme_code: '',
    scheme_name: '',
    full_name: '',
    description: '',
    category: 'general',
    eligibility: [] as string[],
    required_documents: [] as string[],
    benefits: '',
    application_process: '',
    official_website: '',
    deadline: '',
    is_active: true,
    contact_number: '',
  });

  const [eligibilityText, setEligibilityText] = useState('');
  const [documentsText, setDocumentsText] = useState('');

  useEffect(() => {
    if (scheme) {
      setFormData({
        scheme_code: scheme.scheme_code || '',
        scheme_name: scheme.scheme_name || '',
        full_name: scheme.full_name || '',
        description: scheme.description || '',
        category: scheme.category || 'general',
        eligibility: Array.isArray(scheme.eligibility) ? scheme.eligibility : [],
        required_documents: Array.isArray(scheme.required_documents) ? scheme.required_documents : [],
        benefits: scheme.benefits || '',
        application_process: scheme.application_process || '',
        official_website: scheme.official_website || '',
        deadline: scheme.deadline || '',
        is_active: scheme.is_active !== undefined ? scheme.is_active : true,
        contact_number: scheme.contact_number || '',
      });
      setEligibilityText(Array.isArray(scheme.eligibility) ? scheme.eligibility.join('\n') : '');
      setDocumentsText(Array.isArray(scheme.required_documents) ? scheme.required_documents.join('\n') : '');
    }
  }, [scheme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEligibilityChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEligibilityText(e.target.value);
    const items = e.target.value.split('\n').filter(item => item.trim().length > 0);
    setFormData(prev => ({ ...prev, eligibility: items }));
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentsText(e.target.value);
    const items = e.target.value.split('\n').filter(item => item.trim().length > 0);
    setFormData(prev => ({ ...prev, required_documents: items }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {scheme ? 'Edit Scheme' : 'Add New Scheme'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheme Code *
              </label>
              <input
                type="text"
                name="scheme_code"
                value={formData.scheme_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="KCC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheme Name *
              </label>
              <input
                type="text"
                name="scheme_name"
                value={formData.scheme_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eligibility (one per line) *
            </label>
            <textarea
              value={eligibilityText}
              onChange={handleEligibilityChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="All farmers&#10;Land holding up to 2 hectares"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Documents (one per line) *
            </label>
            <textarea
              value={documentsText}
              onChange={handleDocumentsChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Aadhaar Card&#10;Bank Account Details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefits *
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Process *
            </label>
            <textarea
              name="application_process"
              value={formData.application_process}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Website
              </label>
              <input
                type="url"
                name="official_website"
                value={formData.official_website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Open year-round"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1800-180-6060"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Scheme is active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              {scheme ? 'Update Scheme' : 'Add Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
