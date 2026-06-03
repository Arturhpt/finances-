// js/auth.js
import { auth, isFirebaseConfigured } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// --- MOCK AUTHENTICATION SYSTEM (FALLBACK) ---
const MOCK_USERS_KEY = 'financeapp_mock_users';
const MOCK_CURRENT_USER_KEY = 'financeapp_mock_curr_user';

const getMockUsers = () => JSON.parse(localStorage.getItem(MOCK_USERS_KEY)) || [];
const setMockUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

// Helper for delays to simulate network activity
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXPORTED AUTHENTICATION API ---

export const signUpUser = async (email, password, displayName) => {
  if (isFirebaseConfigured() && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } else {
    // Mock Signup
    await delay(600);
    const users = getMockUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("Este e-mail já está cadastrado.");
    }
    const newUser = {
      uid: 'mock_uid_' + Math.random().toString(36).substr(2, 9),
      email,
      displayName,
      emailVerified: false
    };
    users.push({ ...newUser, password }); // In real apps password is encrypted; this is just mock
    setMockUsers(users);
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(newUser));
    // Trigger mock auth change event
    triggerMockAuthChange(newUser);
    return newUser;
  }
};

export const loginUser = async (email, password) => {
  if (isFirebaseConfigured() && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } else {
    // Mock Login
    await delay(600);
    const users = getMockUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("E-mail ou senha incorretos.");
    }
    const cleanUser = { uid: user.uid, email: user.email, displayName: user.displayName };
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(cleanUser));
    triggerMockAuthChange(cleanUser);
    return cleanUser;
  }
};

export const resetPassword = async (email) => {
  if (isFirebaseConfigured() && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // Mock Password Reset
    await delay(500);
    const users = getMockUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("E-mail não encontrado.");
    }
    console.log(`[Mock Reset] Email de recuperação enviado para ${email}`);
  }
};

export const logoutUser = async () => {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  } else {
    // Mock Logout
    await delay(300);
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
    triggerMockAuthChange(null);
  }
};

// Listeners collection for Mock Auth
const mockAuthListeners = [];
const triggerMockAuthChange = (user) => {
  mockAuthListeners.forEach(cb => cb(user));
};

export const onAuthChange = (callback) => {
  if (isFirebaseConfigured() && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Setup Mock Listener
    mockAuthListeners.push(callback);
    // Emit current mock state immediately
    const currentUser = JSON.parse(localStorage.getItem(MOCK_CURRENT_USER_KEY)) || null;
    // Delay to simulate async firebase auth init
    setTimeout(() => {
      callback(currentUser);
    }, 100);
    
    // Return unsubscribe function
    return () => {
      const index = mockAuthListeners.indexOf(callback);
      if (index > -1) mockAuthListeners.splice(index, 1);
    };
  }
};

// Gets current logged user synchronously
export const getCurrentUser = () => {
  if (isFirebaseConfigured() && auth) {
    return auth.currentUser;
  } else {
    return JSON.parse(localStorage.getItem(MOCK_CURRENT_USER_KEY)) || null;
  }
};
