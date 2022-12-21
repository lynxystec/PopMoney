const btnOpen = document.getElementById('btn-open');
const modal = document.getElementById('modal');
const btnClose = document.getElementById('btn-close');
const form = document.getElementById('form');
const extract = document.getElementById('extract');

btnOpen.addEventListener('click', () => {
  modal.style.display = 'flex';
});

btnClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const transaction = Object.create(null);
  transaction.desc = e.target.desc.value.trim();
  transaction.cost = e.target.cost.value.trim();
  transaction.type = e.target.type.value;
  transaction.date = new Date();

  if (transaction.type === 'select') {
    alert('Por favor, selecione um tipo de lançamento');
  } else {
    addTransaction(transaction);
    form.reset();
    modal.style.display = 'none';
    getTransactions();
    updateTotals();
  }
});

function addTransaction(transaction) {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let id = localStorage.getItem('id') || 1;
  transaction.id = Number(id);
  id++;
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('id', id);
}

const costFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const monthOption = { month: 'long' }
const dayOption = { day: 'numeric' }
const monthFormat = new Intl.DateTimeFormat('pt-BR', monthOption);
const dayFormat = new Intl.DateTimeFormat('pt-BR', dayOption);

function formatCost(cost) {
  return cost.replace('.', '').replace(',', '.');
}

function formatSignal(type) {
  const spanSignal = document.createElement('span');

  if (type === 'entry') {
    spanSignal.textContent = '+';
    spanSignal.classList.add('green');
  } else {
    spanSignal.textContent = '-';
    spanSignal.classList.add('red');
  }

  return spanSignal;
}

function getTransactions() {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  extract.textContent = '';

  if (transactions.length === 0) {
    extract.textContent = '- Não há movimentações -';
  } else {
    transactions.map(transaction => {
      const li = document.createElement('li');
      const div = document.createElement('div');
  
      const spanDesc = document.createElement('span');
      spanDesc.textContent = transaction.desc;
  
      const spanDate = document.createElement('span');
      const i = document.createElement('i');
      i.textContent = `${monthFormat.format(new Date(transaction.date))}, ${dayFormat.format(new Date(transaction.date))}`;
  
      const divCost = document.createElement('div');
      divCost.classList.add('cost');
  
      const spanSignal = formatSignal(transaction.type);
  
      const spanCost = document.createElement('span');
      spanCost.textContent = costFormat.format(formatCost(transaction.cost));
  
      spanDate.append(i);
      div.append(spanDesc, spanDate);
      divCost.append(spanSignal, spanCost);
      li.append(div, divCost);
      extract.append(li);
    });
  }
}

function getTotal(type) {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  return transactions.filter(transaction => transaction.type === type)
  .map(transaction => Number(formatCost(transaction.cost)))
  .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function renderTotal(id, total) {
  const entries = document.getElementById(id);
  entries.textContent = '';
  entries.textContent = costFormat.format(total);
}

function updateTotals() {
  const entriesTotal = getTotal('entry');
  const spendingsTotal = getTotal('spent');
  renderTotal('entries', entriesTotal);
  renderTotal('spendings', spendingsTotal);

  const balance = entriesTotal - spendingsTotal;

  if (Math.round(balance) === 0 || Math.round(balance) === -0) {
    document.getElementById('balance').textContent = 'R$ 0,00';
  } else {
    renderTotal('balance', balance);
  }
}

getTransactions();
updateTotals();