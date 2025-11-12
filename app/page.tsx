'use client';

import { useState, useEffect } from 'react';
import { GovernmentScheme, getSchemes, addScheme, updateScheme, deleteScheme } from '@/firebase/schemes';
import SchemeTable from '@/components/SchemeTable';
import SchemeForm from '@/components/SchemeForm';
import { Plus } from 'lucide-react';

export default function Home() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState<GovernmentScheme | null>(null);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const data = await getSchemes();
      setSchemes(data);
    } catch (error) {
      console.error('Error loading schemes:', error);
      alert('Failed to load schemes. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingScheme(null);
    setShowForm(true);
  };

  const handleEdit = (scheme: GovernmentScheme) => {
    setEditingScheme(scheme);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      try {
        await deleteScheme(id);
        await loadSchemes();
      } catch (error) {
        console.error('Error deleting scheme:', error);
        alert('Failed to delete scheme');
      }
    }
  };

  const handleFormSubmit = async (schemeData: Omit<GovernmentScheme, 'id' | 'idx'>) => {
    try {
      if (editingScheme?.id) {
        await updateScheme(editingScheme.id, schemeData);
      } else {
        await addScheme(schemeData);
      }
      setShowForm(false);
      setEditingScheme(null);
      await loadSchemes();
    } catch (error) {
      console.error('Error saving scheme:', error);
      alert('Failed to save scheme');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingScheme(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Government Schemes Database</h1>
              <p className="text-gray-600 mt-2">Manage and view government schemes information</p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              <Plus size={20} />
              Add Scheme
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading schemes...</p>
            </div>
          ) : (
            <SchemeTable
              schemes={schemes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {showForm && (
        <SchemeForm
          scheme={editingScheme}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </main>
  );
}

