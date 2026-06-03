// js/db.js
import { db, isFirebaseConfigured } from './firebase-config.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// --- MOCK DATABASE SYSTEM (FALLBACK) ---
const MOCK_TRANSACTIONS_KEY = 'financeapp_mock_transactions';
const MOCK_CATEGORIES_KEY = 'financeapp_mock_categories';

const getMockTransactions = () => JSON.parse(localStorage.getItem(MOCK_TRANSACTIONS_KEY)) || [];
const setMockTransactions = (transactions) => localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(transactions));

const getMockCategories = (uid) => {
  const allCategories = JSON.parse(localStorage.getItem(MOCK_CATEGORIES_KEY)) || {};
  return allCategories[uid] || null;
};
const setMockCategories = (uid, list) => {
  const allCategories = JSON.parse(localStorage.getItem(MOCK_CATEGORIES_KEY)) || {};
  allCategories[uid] = list;
  localStorage.setItem(MOCK_CATEGORIES_KEY, JSON.stringify(allCategories));
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- DEFAULT CATEGORIES ---
export const DEFAULT_INCOME_CATEGORIES = ['Salário', 'Investimentos', 'Freelance', 'Presentes', 'Outros'];
export const DEFAULT_EXPENSE_CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Vestuário', 'Outros'];

// --- DATABASE OPERATIONS ---

// 1. Fetch Transactions
export const getTransactions = async (uid) => {
  if (isFirebaseConfigured() && db) {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    // Sort transactions by date descending client-side to avoid index config issues in Firebase
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    // Mock Fetch
    await delay(400);
    const transactions = getMockTransactions();
    const userTransactions = transactions.filter(t => t.userId === uid);
    return userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

// 2. Add Transaction
export const addTransaction = async (uid, transactionData) => {
  const newTransaction = {
    userId: uid,
    description: transactionData.description,
    amount: parseFloat(transactionData.amount),
    type: transactionData.type, // 'income' | 'expense'
    category: transactionData.category,
    date: transactionData.date, // YYYY-MM-DD
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
    return { id: docRef.id, ...newTransaction };
  } else {
    // Mock Add
    await delay(300);
    const transactions = getMockTransactions();
    const mockId = 'mock_tx_' + Math.random().toString(36).substr(2, 9);
    const savedTransaction = { id: mockId, ...newTransaction };
    transactions.push(savedTransaction);
    setMockTransactions(transactions);
    return savedTransaction;
  }
};

// 3. Update Transaction
export const updateTransaction = async (id, transactionData) => {
  const updates = {
    description: transactionData.description,
    amount: parseFloat(transactionData.amount),
    type: transactionData.type,
    category: transactionData.category,
    date: transactionData.date
  };

  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, updates);
    return { id, ...updates };
  } else {
    // Mock Update
    await delay(300);
    const transactions = getMockTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Transação não encontrada.");
    transactions[index] = { ...transactions[index], ...updates };
    setMockTransactions(transactions);
    return transactions[index];
  }
};

// 4. Delete Transaction
export const deleteTransaction = async (id) => {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
    return id;
  } else {
    // Mock Delete
    await delay(200);
    const transactions = getMockTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    setMockTransactions(filtered);
    return id;
  }
};

// 5. Get User Custom Categories
export const getUserCategories = async (uid) => {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'categories', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list;
    } else {
      // If it doesn't exist, create it with empty list and return empty list
      await setDoc(docRef, { list: [] });
      return [];
    }
  } else {
    // Mock get
    await delay(200);
    const list = getMockCategories(uid);
    if (list === null) {
      setMockCategories(uid, []);
      return [];
    }
    return list;
  }
};

// 6. Add Custom Category
export const addCustomCategory = async (uid, newCategory) => {
  if (!newCategory || typeof newCategory !== 'string' || newCategory.trim() === '') {
    throw new Error("Categoria inválida.");
  }
  const categoryClean = newCategory.trim();

  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, 'categories', uid);
    const currentList = await getUserCategories(uid);
    if (currentList.includes(categoryClean)) {
      throw new Error("Esta categoria já existe.");
    }
    const newList = [...currentList, categoryClean];
    await setDoc(docRef, { list: newList });
    return newList;
  } else {
    // Mock add
    await delay(200);
    const currentList = await getUserCategories(uid);
    if (currentList.includes(categoryClean)) {
      throw new Error("Esta categoria já existe.");
    }
    const newList = [...currentList, categoryClean];
    setMockCategories(uid, newList);
    return newList;
  }
};
