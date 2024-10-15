let incomes = {
    pg1: [],
    pg2: []
};

// Initialize the page and load incomes
window.onload = function () {
    initializeMonthFilter();    // Initialize the month filter dropdown
    loadIncomes();              // Load saved incomes from localStorage
    setupIncomeChart();         // Set up the chart for income
    displayIncomeSummary();     // Display summary for the selected month
    displayPaidIncomeDetails(); // Display details of paid incomes
    updateIncomeChart();        // Update the income chart for the selected month
};

// Function to initialize the month filter
function initializeMonthFilter() {
    const monthFilter = document.getElementById('monthFilter');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonthIndex = new Date().getMonth();

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        if (index === currentMonthIndex) {
            option.selected = true;  // Set current month as default
        }
        monthFilter.appendChild(option);
    });

    // Update summary and chart when the month filter changes
    monthFilter.addEventListener('change', function () {
        displayIncomeSummary();
        displayPaidIncomeDetails();
        updateIncomeChart();
    });
}

// Function to display the details of people who have paid
function displayPaidIncomeDetails() {
    const paidIncomeList = document.getElementById('paidIncomeList');
    const selectedMonth = document.getElementById('monthFilter').value;
    paidIncomeList.innerHTML = '';

    // Combine PG1 and PG2 incomes
    const allIncomes = [...incomes.pg1, ...incomes.pg2];

    // Filter incomes for selected month and with payment status "Paid"
    const paidIncomes = allIncomes.filter(income => income.paymentStatus === 'Paid' && income.month === selectedMonth);

    if (paidIncomes.length === 0) {
        paidIncomeList.innerHTML = '<p>No payments made for the selected month.</p>';
        return;
    }

    paidIncomes.forEach(income => {
        paidIncomeList.innerHTML += `
            <div class="paid-entry">
                <strong>Name:</strong> ${income.name}<br>
                <strong>Room Number:</strong> ${income.room}<br>
                <strong>Amount:</strong> ₹${income.amount.toFixed(2)}<br>
                <strong>Date:</strong> ${income.date}<br>
                <strong>PG:</strong> ${incomes.pg1.includes(income) ? 'PG 1' : 'PG 2'}<br>
            </div>
            <hr>
        `;
    });
}

// Function to add a new income
document.getElementById('incomeForm').addEventListener('submit', addIncome);

function addIncome(event) {
    event.preventDefault();
    const pg = document.getElementById('pg').value;
    const name = document.getElementById('guestName').value;
    const room = document.getElementById('roomNumber').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const date = document.getElementById('incomeDate').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const month = document.getElementById('monthFilter').value;

    if (isNaN(amount) || amount <= 0) {
        showToast('Invalid amount!');
        return;
    }

    const income = { name, room, amount, date, paymentStatus, month };

    // Store income based on PG
    if (pg === 'PG 1') {
        incomes.pg1.push(income);
    } else if (pg === 'PG 2') {
        incomes.pg2.push(income);
    }

    saveIncomes();  // Save to localStorage
    displayIncomeSummary();  // Update income summary
    displayPaidIncomeDetails();  // Update payment details
    updateIncomeChart();  // Update the chart
    showToast('Income added successfully!');
    document.getElementById('incomeForm').reset();  // Reset the form
}

// Function to load incomes from localStorage
function loadIncomes() {
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) {
        incomes = JSON.parse(savedIncomes);
    }
    displayIncomeSummary();
    displayPaidIncomeDetails();
}

// Function to save incomes to localStorage
function saveIncomes() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
}

// Function to display income summary for the selected month
function displayIncomeSummary() {
    const selectedMonth = document.getElementById('monthFilter').value;
    
    // Calculate total income for PG 1 and PG 2 for the selected month
    const totalIncomePG1 = incomes.pg1
        .filter(income => income.month === selectedMonth)
        .reduce((sum, income) => sum + income.amount, 0);

    const totalIncomePG2 = incomes.pg2
        .filter(income => income.month === selectedMonth)
        .reduce((sum, income) => sum + income.amount, 0);

    document.getElementById('totalIncomePG1').textContent = `₹${totalIncomePG1.toFixed(2)}`;
    document.getElementById('totalIncomePG2').textContent = `₹${totalIncomePG2.toFixed(2)}`;
}

// Function to show a toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Function to set up the income chart
function setupIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    window.incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['PG 1', 'PG 2'],
            datasets: [{
                label: 'Income',
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#FF9800'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to update the income chart based on the selected month
function updateIncomeChart() {
    const selectedMonth = document.getElementById('monthFilter').value;

    // Calculate total income for PG 1 and PG 2 for the selected month
    const totalIncomePG1 = incomes.pg1
        .filter(income => income.month === selectedMonth)
        .reduce((sum, income) => sum + income.amount, 0);

    const totalIncomePG2 = incomes.pg2
        .filter(income => income.month === selectedMonth)
        .reduce((sum, income) => sum + income.amount, 0);

    // Update the chart data
    window.incomeChart.data.datasets[0].data = [totalIncomePG1, totalIncomePG2];
    window.incomeChart.update();
}
