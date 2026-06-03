// js/app.js
import { isFirebaseConfigured } from './firebase-config.js';
import {
  signUpUser,
  loginUser,
  resetPassword,
  logoutUser,
  onAuthChange,
  getCurrentUser
} from './auth.js';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getUserCategories,
  addCustomCategory,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES
} from './db.js';
import { renderCharts } from './charts.js';

// --- STATE MANAGEMENT ---
let currentUser = null;
let allTransactions = [];
let customCategories = [];
let activeView = 'dashboard';
let currentEditingTxId = null;

// --- DOM ELEMENTS REFERENCE ---
const els = {
  // Banners
  firebaseStatusBanner: document.getElementById('firebase-status-banner'),
  
  // Sections
  authSection: document.getElementById('auth-section'),
  appShell: document.getElementById('app-shell'),
  contentContainer: document.getElementById('content-container'),
  
  // Auth Cards
  cardLogin: document.getElementById('card-login'),
  cardSignup: document.getElementById('card-signup'),
  cardReset: document.getElementById('card-reset'),
  
  // Auth Forms
  formLogin: document.getElementById('form-login'),
  formSignup: document.getElementById('form-signup'),
  formReset: document.getElementById('form-reset'),
  
  // Auth Inputs
  loginEmail: document.getElementById('login-email'),
  loginPass: document.getElementById('login-password'),
  signupName: document.getElementById('signup-name'),
  signupEmail: document.getElementById('signup-email'),
  signupPass: document.getElementById('signup-password'),
  resetEmail: document.getElementById('reset-email'),
  
  // Auth Action Links
  linkForgotPass: document.getElementById('link-forgot-pass'),
  linkGoSignup: document.getElementById('link-go-signup'),
  linkGoLogin: document.getElementById('link-go-login'),
  linkResetBackLogin: document.getElementById('link-reset-back-login'),
  
  // Navigation
  sidebar: document.getElementById('sidebar'),
  menuItems: document.querySelectorAll('.menu-item'),
  pageTitle: document.getElementById('page-title'),
  btnHamburger: document.getElementById('btn-hamburger'),
  btnCloseSidebar: document.getElementById('btn-close-sidebar'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  btnLogout: document.getElementById('btn-logout'),
  
  // User profile
  userAvatar: document.getElementById('user-avatar-lbl'),
  userName: document.getElementById('user-name-lbl'),
  userEmail: document.getElementById('user-email-lbl'),
  
  // VIEWS
  viewDashboard: document.getElementById('view-dashboard'),
  viewTransactions: document.getElementById('view-transactions'),
  viewReports: document.getElementById('view-reports'),
  
  // View Dashboard Elements
  lblTotalBalance: document.getElementById('lbl-total-balance'),
  lblTotalIncome: document.getElementById('lbl-total-income'),
  lblTotalExpense: document.getElementById('lbl-total-expense'),
  tbodyRecentTxs: document.getElementById('tbody-recent-txs'),
  recentTxsEmpty: document.getElementById('recent-txs-empty'),
  btnEmptyAddTx: document.getElementById('btn-empty-add-tx'),
  btnViewAllTxs: document.getElementById('btn-view-all-txs'),
  btnQuickIncome: document.getElementById('btn-quick-income'),
  btnQuickExpense: document.getElementById('btn-quick-expense'),
  btnQuickCategories: document.getElementById('btn-quick-categories'),
  
  // View Transactions Elements
  filterType: document.getElementById('filter-type'),
  filterCategory: document.getElementById('filter-category'),
  filterStartDate: document.getElementById('filter-start-date'),
  filterEndDate: document.getElementById('filter-end-date'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  btnAddTxMain: document.getElementById('btn-add-tx-main'),
  lblTxsCount: document.getElementById('lbl-txs-count'),
  tbodyAllTxs: document.getElementById('tbody-all-txs'),
  allTxsEmpty: document.getElementById('all-txs-empty'),
  
  // View Reports Elements
  lblRepIncome: document.getElementById('lbl-rep-income'),
  lblRepExpense: document.getElementById('lbl-rep-expense'),
  lblRepBalance: document.getElementById('lbl-rep-balance'),
  
  // Modals
  modalTx: document.getElementById('modal-transaction'),
  modalTxTitle: document.getElementById('modal-tx-title'),
  formTx: document.getElementById('form-transaction'),
  txId: document.getElementById('tx-id'),
  txTypeIncome: document.getElementById('tx-type-income'),
  txTypeExpense: document.getElementById('tx-type-expense'),
  txDescription: document.getElementById('tx-description'),
  txAmount: document.getElementById('tx-amount'),
  txCategory: document.getElementById('tx-category'),
  txDate: document.getElementById('tx-date'),
  btnCancelTxModal: document.getElementById('btn-cancel-tx-modal'),
  btnCloseTxModal: document.getElementById('btn-close-tx-modal'),
  
  modalCat: document.getElementById('modal-categories'),
  newCatName: document.getElementById('new-cat-name'),
  btnSaveNewCat: document.getElementById('btn-save-new-cat'),
  customCatsList: document.getElementById('custom-categories-list'),
  noCustomCatsLbl: document.getElementById('no-custom-cats-lbl'),
  defaultIncCatsList: document.getElementById('default-income-categories-list'),
  defaultExpCatsList: document.getElementById('default-expense-categories-list'),
  btnCloseCatModal: document.getElementById('btn-close-cat-modal'),
  btnCloseCatModalOk: document.getElementById('btn-close-cat-modal-ok'),
  
  // Toast container
  toastContainer: document.getElementById('toast-container')
};

// --- HELPER FUNCTIONS ---

// Currency Formatter
const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Date Formatter (YYYY-MM-DD -> DD/MM/YYYY)
const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Show loader in button
const setBtnLoading = (button, loading, originalText) => {
  if (loading) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> Carregando...`;
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
};

// Custom Toast System
export const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-solid fa-circle-info';
  if (type === 'success') iconClass = 'fa-solid fa-circle-check';
  if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
  
  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-message">${message}</div>
    <i class="fa-solid fa-xmark toast-close"></i>
  `;
  
  els.toastContainer.appendChild(toast);
  
  // Trigger entry animation
  setTimeout(() => toast.classList.add('show'), 50);
  
  // Remove element click
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.onclick = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  };
  
  // Auto dismiss
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
};

// Get current active theme
const isDarkTheme = () => {
  return document.documentElement.getAttribute('data-theme') === 'dark';
};

// Initialize Theme
const initTheme = () => {
  const savedTheme = localStorage.getItem('financeapp_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
};

// Toggle Theme
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('financeapp_theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Re-render charts with correct coloring
  if (currentUser) {
    renderCharts(allTransactions, newTheme === 'dark');
  }
};

const updateThemeIcon = (theme) => {
  const icon = els.btnThemeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
};

// --- ROUTING / SCREEN SYSTEM ---

const switchView = (viewName) => {
  activeView = viewName;
  
  // Update header text
  const titles = {
    dashboard: 'Dashboard',
    transactions: 'Lançamentos',
    reports: 'Relatórios'
  };
  els.pageTitle.textContent = titles[viewName] || 'FinanceApp';
  
  // Switch menu item active classes
  els.menuItems.forEach(item => {
    if (item.getAttribute('data-target') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch panels
  els.viewDashboard.classList.add('hidden');
  els.viewTransactions.classList.add('hidden');
  els.viewReports.classList.add('hidden');

  if (viewName === 'dashboard') {
    els.viewDashboard.classList.remove('hidden');
  } else if (viewName === 'transactions') {
    els.viewTransactions.classList.remove('hidden');
    // Set dynamic transaction filters default category options
    populateFilterCategories();
  } else if (viewName === 'reports') {
    els.viewReports.classList.remove('hidden');
  }
  
  // Smooth re-draw dashboard and charts
  renderActiveViewData();
  
  // Close sidebar on mobile navigation
  els.sidebar.classList.remove('active');
};

const showAuthCard = (cardId) => {
  els.cardLogin.classList.add('hidden');
  els.cardSignup.classList.add('hidden');
  els.cardReset.classList.add('hidden');

  if (cardId === 'login') els.cardLogin.classList.remove('hidden');
  if (cardId === 'signup') els.cardSignup.classList.remove('hidden');
  if (cardId === 'reset') els.cardReset.classList.remove('hidden');
};

// --- DATA BINDING AND RENDERING ---

const refreshAppData = async () => {
  if (!currentUser) return;
  
  try {
    // Parallel load
    const [txs, cats] = await Promise.all([
      getTransactions(currentUser.uid),
      getUserCategories(currentUser.uid)
    ]);
    
    allTransactions = txs;
    customCategories = cats;
    
    renderActiveViewData();
  } catch (error) {
    console.error("Erro ao recarregar dados:", error);
    showToast("Erro ao carregar dados do banco.", "error");
  }
};

const renderActiveViewData = () => {
  // Update Header details
  updateKPIs();
  
  if (activeView === 'dashboard') {
    renderDashboardView();
  } else if (activeView === 'transactions') {
    applyFiltersAndRender();
  } else if (activeView === 'reports') {
    renderReportsView();
  }
};

// 1. Dashboard UI Updates
const updateKPIs = () => {
  let income = 0;
  let expense = 0;

  allTransactions.forEach(tx => {
    if (tx.type === 'income') income += tx.amount;
    else if (tx.type === 'expense') expense += tx.amount;
  });

  const balance = income - expense;

  els.lblTotalBalance.textContent = formatCurrency(balance);
  els.lblTotalIncome.textContent = formatCurrency(income);
  els.lblTotalExpense.textContent = formatCurrency(expense);

  // Styling negative balance indicator
  if (balance < 0) {
    els.lblTotalBalance.className = 'kpi-value text-danger';
  } else {
    els.lblTotalBalance.className = 'kpi-value';
  }
};

const renderDashboardView = () => {
  const recentTxs = allTransactions.slice(0, 5); // Take last 5
  els.tbodyRecentTxs.innerHTML = '';
  
  if (recentTxs.length === 0) {
    els.recentTxsEmpty.classList.remove('hidden');
    document.getElementById('table-recent-txs').classList.add('hidden');
    return;
  }
  
  els.recentTxsEmpty.classList.add('hidden');
  document.getElementById('table-recent-txs').classList.remove('hidden');

  recentTxs.forEach(tx => {
    const row = document.createElement('tr');
    
    const valueClass = tx.type === 'income' ? 'text-success' : 'text-danger';
    const valPrefix = tx.type === 'income' ? '+' : '-';
    
    row.innerHTML = `
      <td><strong>${tx.description}</strong></td>
      <td><span class="category-tag">${tx.category || 'Geral'}</span></td>
      <td class="text-secondary">${formatDateLabel(tx.date)}</td>
      <td class="${valueClass} font-heading" style="font-weight: 600;">
        ${valPrefix} ${formatCurrency(tx.amount)}
      </td>
    `;
    els.tbodyRecentTxs.appendChild(row);
  });
};

// 2. Transactions Table View Filters
const populateFilterCategories = () => {
  // Save current select value
  const prevVal = els.filterCategory.value;
  
  els.filterCategory.innerHTML = '<option value="all">Todas</option>';
  
  // Combine defaults and custom categories
  const categoriesSet = new Set([
    ...DEFAULT_INCOME_CATEGORIES,
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...customCategories
  ]);
  
  categoriesSet.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    els.filterCategory.appendChild(opt);
  });
  
  els.filterCategory.value = prevVal || 'all';
};

const applyFiltersAndRender = () => {
  const typeFilter = els.filterType.value;
  const catFilter = els.filterCategory.value;
  const startFilter = els.filterStartDate.value;
  const endFilter = els.filterEndDate.value;
  
  const filtered = allTransactions.filter(tx => {
    // 1. Filter Type
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    
    // 2. Filter Category
    if (catFilter !== 'all' && tx.category !== catFilter) return false;
    
    // 3. Start Date
    if (startFilter && tx.date < startFilter) return false;
    
    // 4. End Date
    if (endFilter && tx.date > endFilter) return false;
    
    return true;
  });
  
  els.lblTxsCount.textContent = `${filtered.length} lançamentos`;
  renderTransactionsTable(filtered);
};

const renderTransactionsTable = (filtered) => {
  els.tbodyAllTxs.innerHTML = '';
  
  if (filtered.length === 0) {
    els.allTxsEmpty.classList.remove('hidden');
    document.getElementById('table-all-txs').classList.add('hidden');
    return;
  }
  
  els.allTxsEmpty.classList.add('hidden');
  document.getElementById('table-all-txs').classList.remove('hidden');
  
  filtered.forEach(tx => {
    const row = document.createElement('tr');
    
    const isIncome = tx.type === 'income';
    const valueClass = isIncome ? 'text-success' : 'text-danger';
    const badgeClass = isIncome ? 'badge income' : 'badge expense';
    const badgeText = isIncome ? 'Receita' : 'Despesa';
    const valPrefix = isIncome ? '+' : '-';
    
    row.innerHTML = `
      <td class="text-secondary">${formatDateLabel(tx.date)}</td>
      <td><strong>${tx.description}</strong></td>
      <td><span class="category-tag">${tx.category || 'Geral'}</span></td>
      <td><span class="${badgeClass}">${badgeText}</span></td>
      <td class="${valueClass} font-heading" style="font-weight: 600;">
        ${valPrefix} ${formatCurrency(tx.amount)}
      </td>
      <td>
        <div class="row-actions">
          <button class="btn-icon edit" data-id="${tx.id}" title="Editar">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn-icon delete" data-id="${tx.id}" title="Excluir">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    
    // Attach actions events
    row.querySelector('.btn-icon.edit').onclick = () => openTransactionModal(tx.id);
    row.querySelector('.btn-icon.delete').onclick = () => handleTransactionDelete(tx.id);
    
    els.tbodyAllTxs.appendChild(row);
  });
};

// 3. Reports & Analytics updates
const renderReportsView = () => {
  // Update Period summary stats (using the filtered or absolute months, but standard is sum all data loaded)
  let income = 0;
  let expense = 0;

  allTransactions.forEach(tx => {
    if (tx.type === 'income') income += tx.amount;
    else if (tx.type === 'expense') expense += tx.amount;
  });

  els.lblRepIncome.textContent = formatCurrency(income);
  els.lblRepExpense.textContent = formatCurrency(expense);
  els.lblRepBalance.textContent = formatCurrency(income - expense);
  
  const balanceLbl = els.lblRepBalance;
  if (income - expense < 0) {
    balanceLbl.className = 'report-stat-value text-danger';
  } else {
    balanceLbl.className = 'report-stat-value text-success';
  }

  // Draw Charts
  renderCharts(allTransactions, isDarkTheme());
};

// --- MODALS INTERACTIONS ---

const populateTxCategoriesDropdown = (type) => {
  els.txCategory.innerHTML = '';
  
  const standardCats = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  
  // Render standards
  standardCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    els.txCategory.appendChild(opt);
  });
  
  // Render user custom categories
  customCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    els.txCategory.appendChild(opt);
  });
};

const openTransactionModal = (editId = null) => {
  currentEditingTxId = editId;
  els.formTx.reset();
  
  // Set current date by default (local YYYY-MM-DD)
  const today = new Date().toISOString().substring(0, 10);
  els.txDate.value = today;
  
  if (editId) {
    // Edit mode
    els.modalTxTitle.textContent = 'Editar Lançamento';
    const tx = allTransactions.find(t => t.id === editId);
    
    if (tx) {
      els.txId.value = tx.id;
      els.txDescription.value = tx.description;
      els.txAmount.value = tx.amount;
      els.txDate.value = tx.date;
      
      if (tx.type === 'income') {
        els.txTypeIncome.checked = true;
      } else {
        els.txTypeExpense.checked = true;
      }
      
      populateTxCategoriesDropdown(tx.type);
      els.txCategory.value = tx.category;
    }
  } else {
    // Add Mode
    els.modalTxTitle.textContent = 'Novo Lançamento';
    els.txId.value = '';
    els.txTypeIncome.checked = true; // Default
    populateTxCategoriesDropdown('income');
  }
  
  els.modalTx.classList.add('active');
};

const closeTransactionModal = () => {
  els.modalTx.classList.remove('active');
  currentEditingTxId = null;
};

// Categories modal manager
const openCategoriesModal = () => {
  els.newCatName.value = '';
  renderCategoriesModalLists();
  els.modalCat.classList.add('active');
};

const closeCategoriesModal = () => {
  els.modalCat.classList.remove('active');
};

const renderCategoriesModalLists = () => {
  // User Custom
  els.customCatsList.innerHTML = '';
  if (customCategories.length === 0) {
    els.noCustomCatsLbl.classList.remove('hidden');
  } else {
    els.noCustomCatsLbl.classList.add('hidden');
    customCategories.forEach(cat => {
      const tag = document.createElement('span');
      tag.className = 'category-tag';
      tag.innerHTML = `${cat}`; // Don't support delete of categories yet or we can just leave it as tag
      els.customCatsList.appendChild(tag);
    });
  }

  // Standards Income
  els.defaultIncCatsList.innerHTML = '';
  DEFAULT_INCOME_CATEGORIES.forEach(cat => {
    const tag = document.createElement('span');
    tag.className = 'category-tag';
    tag.style.opacity = '0.8';
    tag.textContent = cat;
    els.defaultIncCatsList.appendChild(tag);
  });

  // Standards Expense
  els.defaultExpCatsList.innerHTML = '';
  DEFAULT_EXPENSE_CATEGORIES.forEach(cat => {
    const tag = document.createElement('span');
    tag.className = 'category-tag';
    tag.style.opacity = '0.8';
    tag.textContent = cat;
    els.defaultExpCatsList.appendChild(tag);
  });
};

// --- DATA CRUD HANDLERS ---

const handleTransactionSubmit = async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const description = els.txDescription.value.trim();
  const amount = parseFloat(els.txAmount.value);
  const type = els.txTypeIncome.checked ? 'income' : 'expense';
  const category = els.txCategory.value;
  const date = els.txDate.value;

  if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
    showToast("Por favor, preencha todos os campos corretamente.", "error");
    return;
  }

  try {
    const submitBtn = els.formTx.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setBtnLoading(submitBtn, true, originalText);

    const txData = { description, amount, type, category, date };

    if (currentEditingTxId) {
      await updateTransaction(currentEditingTxId, txData);
      showToast("Lançamento atualizado com sucesso!", "success");
    } else {
      await addTransaction(currentUser.uid, txData);
      showToast("Lançamento adicionado com sucesso!", "success");
    }

    closeTransactionModal();
    setBtnLoading(submitBtn, false, originalText);
    refreshAppData();
  } catch (error) {
    console.error("Erro ao salvar lançamento:", error);
    showToast("Erro ao salvar transação.", "error");
  }
};

const handleTransactionDelete = async (id) => {
  if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
  
  try {
    await deleteTransaction(id);
    showToast("Lançamento excluído com sucesso!", "success");
    refreshAppData();
  } catch (error) {
    console.error("Erro ao deletar lançamento:", error);
    showToast("Erro ao deletar transação.", "error");
  }
};

const handleCategorySave = async () => {
  if (!currentUser) return;
  const name = els.newCatName.value.trim();
  
  if (!name) {
    showToast("Insira um nome válido para a categoria.", "error");
    return;
  }

  try {
    setBtnLoading(els.btnSaveNewCat, true, `<i class="fa-solid fa-plus"></i>`);
    
    await addCustomCategory(currentUser.uid, name);
    showToast(`Categoria "${name}" adicionada!`, "success");
    
    els.newCatName.value = '';
    
    // Refresh Categories in modal list and state
    const cats = await getUserCategories(currentUser.uid);
    customCategories = cats;
    renderCategoriesModalLists();
    
    setBtnLoading(els.btnSaveNewCat, false, `<i class="fa-solid fa-plus"></i>`);
  } catch (error) {
    console.error("Erro ao salvar categoria:", error);
    showToast(error.message || "Erro ao salvar categoria.", "error");
    setBtnLoading(els.btnSaveNewCat, false, `<i class="fa-solid fa-plus"></i>`);
  }
};

// --- AUTHENTICATION FLOW HANDLERS ---

const handleLogin = async (e) => {
  e.preventDefault();
  const email = els.loginEmail.value.trim();
  const pass = els.loginPass.value;

  if (!email || !pass) {
    showToast("Por favor, preencha todos os campos.", "error");
    return;
  }

  try {
    setBtnLoading(els.formLogin.querySelector('button[type="submit"]'), true, "Entrar");
    await loginUser(email, pass);
    showToast("Login realizado com sucesso!", "success");
    els.formLogin.reset();
  } catch (error) {
    console.error("Erro no login:", error);
    showToast(error.message || "Erro de login. Verifique as credenciais.", "error");
  } finally {
    setBtnLoading(els.formLogin.querySelector('button[type="submit"]'), false, "Entrar");
  }
};

const handleSignup = async (e) => {
  e.preventDefault();
  const name = els.signupName.value.trim();
  const email = els.signupEmail.value.trim();
  const pass = els.signupPass.value;

  if (!name || !email || !pass) {
    showToast("Por favor, preencha todos os campos.", "error");
    return;
  }
  if (pass.length < 6) {
    showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  try {
    setBtnLoading(els.formSignup.querySelector('button[type="submit"]'), true, "Cadastrar");
    await signUpUser(email, pass, name);
    showToast("Conta criada e logada com sucesso!", "success");
    els.formSignup.reset();
  } catch (error) {
    console.error("Erro no cadastro:", error);
    showToast(error.message || "Erro ao realizar cadastro.", "error");
  } finally {
    setBtnLoading(els.formSignup.querySelector('button[type="submit"]'), false, "Cadastrar");
  }
};

const handleReset = async (e) => {
  e.preventDefault();
  const email = els.resetEmail.value.trim();

  if (!email) {
    showToast("Insira o seu e-mail.", "error");
    return;
  }

  try {
    setBtnLoading(els.formReset.querySelector('button[type="submit"]'), true, "Enviar Link");
    await resetPassword(email);
    showToast("Link de recuperação enviado! Verifique seu e-mail.", "success");
    els.formReset.reset();
    showAuthCard('login');
  } catch (error) {
    console.error("Erro no reset de senha:", error);
    showToast(error.message || "Erro ao enviar e-mail de recuperação.", "error");
  } finally {
    setBtnLoading(els.formReset.querySelector('button[type="submit"]'), false, "Enviar Link");
  }
};

const handleLogout = async () => {
  try {
    await logoutUser();
    showToast("Sessão encerrada.", "info");
  } catch (error) {
    console.error("Erro ao deslogar:", error);
    showToast("Erro ao deslogar.", "error");
  }
};

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
  // 1. Config warning verification
  if (!isFirebaseConfigured()) {
    els.firebaseStatusBanner.classList.remove('hidden');
  }
  
  // 2. Initialize Theme configuration
  initTheme();
  
  // 3. Theme Toggle event
  els.btnThemeToggle.addEventListener('click', toggleTheme);

  // 4. Hamburger Side Menu handling
  els.btnHamburger.addEventListener('click', () => els.sidebar.classList.add('active'));
  els.btnCloseSidebar.addEventListener('click', () => els.sidebar.classList.remove('active'));
  
  // Close menu on backdrop click in mobile view
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!els.sidebar.contains(e.target) && !els.btnHamburger.contains(e.target)) {
        els.sidebar.classList.remove('active');
      }
    }
  });

  // 5. Auth Views transitions
  els.linkForgotPass.onclick = () => showAuthCard('reset');
  els.linkGoSignup.onclick = () => showAuthCard('signup');
  els.linkGoLogin.onclick = () => showAuthCard('login');
  els.linkResetBackLogin.onclick = () => showAuthCard('login');

  // 6. Navigation items
  els.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switchView(target);
    });
  });

  // Dashboard view specific triggers
  els.btnViewAllTxs.onclick = () => switchView('transactions');
  els.btnEmptyAddTx.onclick = () => openTransactionModal();
  els.btnQuickIncome.onclick = () => {
    openTransactionModal();
    els.txTypeIncome.checked = true;
    populateTxCategoriesDropdown('income');
  };
  els.btnQuickExpense.onclick = () => {
    openTransactionModal();
    els.txTypeExpense.checked = true;
    populateTxCategoriesDropdown('expense');
  };
  els.btnQuickCategories.onclick = openCategoriesModal;

  // Transactions view specific triggers
  els.btnAddTxMain.onclick = () => openTransactionModal();
  els.filterType.onchange = applyFiltersAndRender;
  els.filterCategory.onchange = applyFiltersAndRender;
  els.filterStartDate.onchange = applyFiltersAndRender;
  els.filterEndDate.onchange = applyFiltersAndRender;
  
  els.btnClearFilters.onclick = () => {
    els.filterType.value = 'all';
    els.filterCategory.value = 'all';
    els.filterStartDate.value = '';
    els.filterEndDate.value = '';
    applyFiltersAndRender();
  };

  // 7. Modals events
  els.btnCloseTxModal.onclick = closeTransactionModal;
  els.btnCancelTxModal.onclick = closeTransactionModal;
  
  // Radio change category updater in modal
  els.txTypeIncome.onchange = () => populateTxCategoriesDropdown('income');
  els.txTypeExpense.onchange = () => populateTxCategoriesDropdown('expense');

  els.btnCloseCatModal.onclick = closeCategoriesModal;
  els.btnCloseCatModalOk.onclick = closeCategoriesModal;
  els.btnSaveNewCat.onclick = handleCategorySave;

  // Form Submits
  els.formLogin.onsubmit = handleLogin;
  els.formSignup.onsubmit = handleSignup;
  els.formReset.onsubmit = handleReset;
  els.formTx.onsubmit = handleTransactionSubmit;
  
  // Logout
  els.btnLogout.onclick = handleLogout;

  // 8. Bind Auth Listener Hook
  onAuthChange(async (user) => {
    currentUser = user;
    if (user) {
      // Logged in State
      els.authSection.classList.add('hidden');
      els.appShell.classList.remove('hidden');
      
      // Load user profiles info
      els.userName.textContent = user.displayName || 'Usuário';
      els.userEmail.textContent = user.email;
      
      // Letter avatar
      const firstLetter = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
      els.userAvatar.textContent = firstLetter;
      
      // Load user transactions and categories
      await refreshAppData();
      switchView('dashboard');
    } else {
      // Logged out State
      els.appShell.classList.add('hidden');
      els.authSection.classList.remove('hidden');
      showAuthCard('login');
      allTransactions = [];
      customCategories = [];
    }
  });
});
