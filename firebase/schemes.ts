import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './config';

export interface GovernmentScheme {
  idx?: number;
  id?: string;
  scheme_code: string;
  scheme_name: string;
  full_name: string;
  description: string;
  category: string;
  eligibility: string[];
  required_documents: string[];
  benefits: string;
  application_process: string;
  official_website?: string;
  deadline?: string;
  is_active: boolean;
  contact_number?: string;
  created_at?: Date;
  updated_at?: Date;
}

const COLLECTION_NAME = 'governmentSchemes';

// Get all schemes
export const getSchemes = async (): Promise<GovernmentScheme[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('scheme_name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc, index) => ({
      idx: index,
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as GovernmentScheme[];
  } catch (error) {
    console.error('Error getting schemes:', error);
    throw error;
  }
};

// Add a new scheme
export const addScheme = async (scheme: Omit<GovernmentScheme, 'id' | 'idx'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...scheme,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding scheme:', error);
    throw error;
  }
};

// Update a scheme
export const updateScheme = async (id: string, scheme: Partial<GovernmentScheme>): Promise<void> => {
  try {
    const schemeRef = doc(db, COLLECTION_NAME, id);
    const { idx, id: _, ...updateData } = scheme;
    await updateDoc(schemeRef, {
      ...updateData,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error('Error updating scheme:', error);
    throw error;
  }
};

// Delete a scheme
export const deleteScheme = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting scheme:', error);
    throw error;
  }
};

