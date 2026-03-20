document.addEventListener('DOMContentLoaded', () => {
  const descIn = document.getElementById('el-desc');
  const amtIn = document.getElementById('el-amount');
  const catIn = document.getElementById('el-cat');
  const dateIn = document.getElementById('el-date');
  const addBtn = document.getElementById('el-add-btn');
  
  const tbody = document.getElementById('el-tbody');
  const totalOut = document.getElementById('el-total');
  
  const exportBtn = document.getElementById('el-export');
  const clearBtn = document.getElementById('el-clear');
  const toast = document.getElementById('toast');

  let expenses = JSON.parse(localStorage.getItem('uv_expense_logger')) || [];

  const getTodayStr = () => new Date().toLocaleDateString('en-CA');
  dateIn.value = getTodayStr();

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const getCatColor = (cat) => {
    const map = {
      'Food & Dining': '#f59e0b',
      'Transport': '#3b82f6',
      'Shopping': '#ec4899',
      'Health': '#10b981',
      'Entertainment': '#8b5cf6',
      'Bills': '#ef4444',
      'Other': '#6b7280'
    };
    return map[cat] || '#6b7280';
  };

  const render = () => {
    tbody.innerHTML = '';
    let total = 0;
    
    // Sort by date DESC
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(ex => {
      total += ex.amount;
      const tr = document.createElement('tr');
      
      const cColor = getCatColor(ex.cat);
      
      tr.innerHTML = `
        <td><strong>${ex.desc}</strong></td>
        <td><span class="cat-badge" style="background:${cColor}20;color:${cColor};"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> ${ex.cat}</span></td>
        <td style="font-weight:700;">$${ex.amount.toFixed(2)}</td>
        <td style="color:var(--text-secondary);">${ex.date}</td>
        <td style="text-align:right;"><button class="del-btn" data-id="${ex.id}"><i class="fa-solid fa-trash"></i></button></td>
      `;
      tbody.appendChild(tr);
    });

    totalOut.textContent = `$${total.toFixed(2)}`;

    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        expenses = expenses.filter(x => x.id !== id);
        saveAndRender();
      });
    });
  };

  const saveAndRender = () => {
    localStorage.setItem('uv_expense_logger', JSON.stringify(expenses));
    render();
  };

  addBtn.addEventListener('click', () => {
    const desc = descIn.value.trim() || 'Expense';
    const amount = parseFloat(amtIn.value);
    const cat = catIn.value;
    const date = dateIn.value || getTodayStr();

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    expenses.push({
      id: Date.now().toString(),
      desc,
      amount,
      cat,
      date
    });

    descIn.value = '';
    amtIn.value = '';
    saveAndRender();
    showToast('Expense added');
  });

  clearBtn.addEventListener('click', () => {
    if(expenses.length === 0) return;
    if(confirm('Are you sure you want to clear ALL expenses?')) {
      expenses = [];
      saveAndRender();
      showToast('All data cleared');
    }
  });

  exportBtn.addEventListener('click', () => {
    if(expenses.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = expenses.map(e => [e.date, `"${e.desc}"`, `"${e.cat}"`, e.amount.toFixed(2)]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${getTodayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV Exported');
  });

  render();
});
