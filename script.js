// Array of Arabic month names
const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Function to format date and time to 12-hour format
function formatDateTime(date) {
    if (!date) return 'لم يحفظ بعد';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
}

// Global variable to store yearly summary
let yearlySummaries = [];
const MAX_MONTHS = 12; // We want to track the last 12 months

// Set initial dates on page load
document.addEventListener('DOMContentLoaded', () => {
    // Last Modified Date (this is a fixed date for the code itself)
    document.getElementById('lastUpdatedDate').textContent = 'تاريخ آخر تعديل: 2024-07-30';

    // Last Run Date (updated every time the page loads)
    const now = new Date();
    document.getElementById('lastRunDate').textContent = `آخر تشغيل: ${formatDateTime(now)}`;

    // Load data and set last saved date from localStorage
    loadData(); // Attempt to load saved data for the current month
    loadYearlySummaries(); // Load historical monthly summaries
    displayLastSavedDate(); // Update last saved date based on loaded data
    calculateExpenses(); // Perform initial calculation with loaded data

    // Set target month to current month if not already set or loaded
    const targetMonthInput = document.getElementById('targetMonth');
    if (!targetMonthInput.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        targetMonthInput.value = `${year}-${month}`;
    }
});

function displayLastSavedDate() {
    const lastSaved = localStorage.getItem('lastSavedTimestamp');
    if (lastSaved) {
        document.getElementById('lastSavedDate').textContent = `آخر حفظ: ${formatDateTime(new Date(parseInt(lastSaved)))}`;
    } else {
        document.getElementById('lastSavedDate').textContent = 'آخر حفظ: لم يحفظ بعد';
    }
}

function getFloatVal(elementId) {
    const value = parseFloat(document.getElementById(elementId).value);
    return isNaN(value) ? 0 : value;
}

// Function to calculate all expenses
function calculateExpenses() {
    // 1. الدخل الشهري
    const salary = getFloatVal('salary');
    const extraIncome = getFloatVal('extraIncome');
    const totalIncome = salary + extraIncome;
    document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
    document.getElementById('summaryTotalIncome').textContent = totalIncome.toFixed(2);

    // 2. المصاريف الثابتة
    const rent = getFloatVal('rent');
    const electricity = getFloatVal('electricity');
    const water = getFloatVal('water');
    const internet = getFloatVal('internet');
    const mobile = getFloatVal('mobile');
    const loans = getFloatVal('loans');
    const subscriptions = getFloatVal('subscriptions');
    const fixedTransport = getFloatVal('fixedTransport');

    const totalFixedExpenses = rent + electricity + water + internet + mobile + loans + subscriptions + fixedTransport;
    document.getElementById('totalFixedExpenses').textContent = totalFixedExpenses.toFixed(2);
    document.getElementById('summaryTotalFixed').textContent = totalFixedExpenses.toFixed(2);

    // 3. المصاريف المتغيرة
    const groceries = getFloatVal('groceries');
    const restaurants = getFloatVal('restaurants');
    const variableTransport = getFloatVal('variableTransport');
    const healthCare = getFloatVal('healthCare');
    const entertainment = getFloatVal('entertainment');
    const shopping = getFloatVal('shopping');
    const misc = getFloatVal('misc');

    // Calculate custom expenses
    let totalCustomExpenses = 0;
    const customExpenseInputs = document.querySelectorAll('#customExpensesContainer input[type="number"]');
    customExpenseInputs.forEach(input => {
        totalCustomExpenses += parseFloat(input.value) || 0;
    });

    const totalVariableExpenses = groceries + restaurants + variableTransport + healthCare + entertainment + shopping + misc + totalCustomExpenses;
    document.getElementById('totalVariableExpenses').textContent = totalVariableExpenses.toFixed(2);
    document.getElementById('summaryTotalVariable').textContent = totalVariableExpenses.toFixed(2);

    // 4. الملخص الشهري
    const totalAllExpenses = totalFixedExpenses + totalVariableExpenses;
    const remainingBalance = totalIncome - totalAllExpenses;

    document.getElementById('totalAllExpenses').textContent = totalAllExpenses.toFixed(2);
    document.getElementById('remainingBalance').textContent = remainingBalance.toFixed(2);

    // 5. ملاحظات ومراجعة
    const notesMessage = document.getElementById('notesMessage');
    if (remainingBalance < 0) {
        notesMessage.textContent = "ملاحظة: يبدو أن مصاريفك المتوقعة تتجاوز دخلك. قد تحتاج إلى مراجعة نفقاتك.";
        notesMessage.style.color = "red";
    } else if (remainingBalance > 0) {
        notesMessage.textContent = "ملاحظة: لديك رصيد إيجابي متبقي! فكر في ادخاره أو استثماره.";
        notesMessage.style.color = "green";
    } else {
        notesMessage.textContent = "ملاحظة: دخلك ومصاريفك متوازنة تمامًا لهذا الشهر.";
        notesMessage.style.color = "blue";
    }
}

// Add event listeners for instant calculation on input change
document.querySelectorAll('input[type="number"], input[type="month"]').forEach(input => {
    input.addEventListener('input', calculateExpenses);
});
// Also listen for changes in custom expense inputs (will be added dynamically)
document.getElementById('customExpensesContainer').addEventListener('input', (event) => {
    if (event.target.type === 'number') {
        calculateExpenses();
    }
});


// --- Functions for Custom Expenses ---
let customExpenseCounter = 0; // To give unique IDs

function addCustomExpenseField(name = '', value = 0) {
    customExpenseCounter++;
    const container = document.getElementById('customExpensesContainer');
    const div = document.createElement('div');
    div.classList.add('custom-expense-item');
    div.innerHTML = `
        <label for="customExpenseName${customExpenseCounter}">اسم الصنف:</label>
        <input type="text" id="customExpenseName${customExpenseCounter}" value="${name}" placeholder="اسم الصنف"><br>
        <label for="customExpenseValue${customExpenseCounter}">قيمة (₪):</label>
        <input type="number" id="customExpenseValue${customExpenseCounter}" value="${value}" min="0"><br>
        <button class="remove-btn" onclick="removeCustomExpenseField(this)">حذف</button>
    `;
    container.appendChild(div);

    // Add event listener for the new number input field
    document.getElementById(`customExpenseValue${customExpenseCounter}`).addEventListener('input', calculateExpenses);
    calculateExpenses(); // Recalculate after adding a new field
}

function removeCustomExpenseField(button) {
    button.closest('.custom-expense-item').remove();
    calculateExpenses(); // Recalculate after removing a field
}


// --- Data Management Functions (Save, Load, Export, Import) ---

function collectData() {
    const data = {
        targetMonth: document.getElementById('targetMonth').value,
        income: {
            salary: getFloatVal('salary'),
            extraIncome: getFloatVal('extraIncome')
        },
        fixedExpenses: {
            rent: getFloatVal('rent'),
            electricity: getFloatVal('electricity'),
            water: getFloatVal('water'),
            internet: getFloatVal('internet'),
            mobile: getFloatVal('mobile'),
            loans: getFloatVal('loans'),
            subscriptions: getFloatVal('subscriptions'),
            fixedTransport: getFloatVal('fixedTransport')
        },
        variableExpenses: {
            groceries: getFloatVal('groceries'),
            restaurants: getFloatVal('restaurants'),
            variableTransport: getFloatVal('variableTransport'),
            healthCare: getFloatVal('healthCare'),
            entertainment: getFloatVal('entertainment'),
            shopping: getFloatVal('shopping'),
            misc: getFloatVal('misc')
        },
        customExpenses: []
    };

    const customExpenseItems = document.querySelectorAll('#customExpensesContainer .custom-expense-item');
    customExpenseItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const valueInput = item.querySelector('input[type="number"]');
        if (nameInput && valueInput) {
            data.customExpenses.push({
                name: nameInput.value,
                value: parseFloat(valueInput.value) || 0
            });
        }
    });

    return data;
}

function applyData(data) {
    document.getElementById('targetMonth').value = data.targetMonth || ''; // Allow empty for initial load
    document.getElementById('salary').value = data.income.salary || 0;
    document.getElementById('extraIncome').value = data.income.extraIncome || 0;

    document.getElementById('rent').value = data.fixedExpenses.rent || 0;
    document.getElementById('electricity').value = data.fixedExpenses.electricity || 0;
    document.getElementById('water').value = data.fixedExpenses.water || 0;
    document.getElementById('internet').value = data.fixedExpenses.internet || 0;
    document.getElementById('mobile').value = data.fixedExpenses.mobile || 0;
    document.getElementById('loans').value = data.fixedExpenses.loans || 0;
    document.getElementById('subscriptions').value = data.fixedExpenses.subscriptions || 0;
    document.getElementById('fixedTransport').value = data.fixedExpenses.fixedTransport || 0;

    document.getElementById('groceries').value = data.variableExpenses.groceries || 0;
    document.getElementById('restaurants').value = data.variableExpenses.restaurants || 0;
    document.getElementById('variableTransport').value = data.variableExpenses.variableTransport || 0;
    document.getElementById('healthCare').value = data.variableExpenses.healthCare || 0;
    document.getElementById('entertainment').value = data.variableExpenses.entertainment || 0;
    document.getElementById('shopping').value = data.variableExpenses.shopping || 0;
    document.getElementById('misc').value = data.variableExpenses.misc || 0;

    // Clear existing custom expenses
    document.getElementById('customExpensesContainer').innerHTML = '';
    // Add custom expenses from data
    if (data.customExpenses && Array.isArray(data.customExpenses)) {
        data.customExpenses.forEach(item => {
            addCustomExpenseField(item.name, item.value);
        });
    }

    calculateExpenses(); // Recalculate after applying loaded data
}

// Save data to localStorage
function saveData() {
    const data = collectData();
    localStorage.setItem('monthlyExpensesData', JSON.stringify(data));
    localStorage.setItem('lastSavedTimestamp', new Date().getTime());
    displayLastSavedDate();

    // --- Update Yearly Summaries ---
    updateYearlySummary(data); // Add or update the current month's summary
    saveYearlySummaries(); // Save the updated yearly summaries to localStorage
    displayYearlySummaries(); // Refresh the display of yearly summaries

    alert('تم حفظ البيانات بنجاح!');
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('monthlyExpensesData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            applyData(data);
            console.log('تم تحميل بيانات الشهر الحالي بنجاح.');
        } catch (e) {
            console.error('خطأ في تحميل البيانات المحفوظة للشهر الحالي:', e);
            alert('حدث خطأ أثناء تحميل البيانات المحفوظة للشهر الحالي. قد تكون البيانات تالفة.');
        }
    } else {
        console.log('لا توجد بيانات محفوظة مسبقاً للشهر الحالي.');
    }
}

// Export data as JSON file
function exportData() {
    const currentMonthData = collectData();
    const allDataToExport = {
        currentMonth: currentMonthData,
        yearlySummaries: yearlySummaries // Include historical data in export
    };

    const dataStr = JSON.stringify(allDataToExport, null, 4); // Pretty print JSON
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_expenses_backup_${new Date().toISOString().slice(0, 10)}.json`; // Filename with date
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('تم تصدير النسخة الاحتياطية بنجاح!');
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            // Basic validation to ensure it's the correct data structure
            if (importedData.currentMonth && importedData.currentMonth.income && importedData.currentMonth.fixedExpenses && importedData.currentMonth.variableExpenses) {
                applyData(importedData.currentMonth); // Apply current month's data
                if (importedData.yearlySummaries && Array.isArray(importedData.yearlySummaries)) {
                    yearlySummaries = importedData.yearlySummaries; // Load historical data
                    saveYearlySummaries(); // Persist imported historical data
                    displayYearlySummaries(); // Update historical display
                }
                alert('تم استيراد البيانات بنجاح!');
            } else {
                alert('الملف المستورد ليس بتنسيق البيانات المتوقع.');
            }
        } catch (error) {
            alert('خطأ في قراءة الملف: تأكد أنه ملف JSON صالح.');
            console.error('Error importing file:', error);
        }
    };
    reader.readAsText(file);
}

// --- Yearly Summary Functions ---

function loadYearlySummaries() {
    const savedSummaries = localStorage.getItem('yearlyExpensesSummaries');
    if (savedSummaries) {
        try {
            yearlySummaries = JSON.parse(savedSummaries);
            // Sort to ensure chronological order for display if needed
            yearlySummaries.sort((a, b) => new Date(b.monthYear) - new Date(a.monthYear));
            // Keep only the latest MAX_MONTHS
            if (yearlySummaries.length > MAX_MONTHS) {
                yearlySummaries = yearlySummaries.slice(0, MAX_MONTHS);
            }
            console.log('تم تحميل ملخصات الشهور السابقة بنجاح.');
        } catch (e) {
            console.error('خطأ في تحميل ملخصات الشهور السابقة:', e);
        }
    }
    displayYearlySummaries();
}

function saveYearlySummaries() {
    localStorage.setItem('yearlyExpensesSummaries', JSON.stringify(yearlySummaries));
}

function updateYearlySummary(currentMonthData) {
    const monthYear = currentMonthData.targetMonth; // e.g., "2025-07"
    if (!monthYear) {
        alert("يرجى تحديد الشهر المستهدف لحفظ ملخصه.");
        return;
    }

    const totalExpenses = parseFloat(document.getElementById('totalAllExpenses').textContent);
    const remaining = parseFloat(document.getElementById('remainingBalance').textContent);

    const newSummary = {
        monthYear: monthYear,
        totalExpenses: totalExpenses,
        remainingBalance: remaining,
        // Determine surplus/deficit
        surplus: remaining > 0 ? remaining : 0,
        deficit: remaining < 0 ? Math.abs(remaining) : 0
    };

    // Check if this month already exists in summaries
    const existingIndex = yearlySummaries.findIndex(s => s.monthYear === monthYear);

    if (existingIndex !== -1) {
        yearlySummaries[existingIndex] = newSummary; // Update existing
    } else {
        yearlySummaries.unshift(newSummary); // Add new to the beginning
    }

    // Keep only the latest MAX_MONTHS (ensure chronological order is maintained for this logic)
    // First, sort by date (descending) to ensure we slice the latest
    yearlySummaries.sort((a, b) => new Date(b.monthYear) - new Date(a.monthYear));
    if (yearlySummaries.length > MAX_MONTHS) {
        yearlySummaries = yearlySummaries.slice(0, MAX_MONTHS);
    }
}


function displayYearlySummaries() {
    const container = document.getElementById('monthlySummaries');
    container.innerHTML = ''; // Clear previous entries

    if (yearlySummaries.length === 0) {
        container.innerHTML = '<p>لا توجد ملخصات شهرية سابقة.</p>';
        return;
    }

    // Sort to display chronologically from oldest to newest in the sidebar
    // Or newest to oldest, current request implies specific order (1st to 12th month)
    // Let's display newest first, as it's more common for "last 12 months"
    // The `yearlySummaries` array is already sorted by `updateYearlySummary`

    yearlySummaries.forEach(summary => {
        const div = document.createElement('div');
        div.classList.add('monthly-summary-item');

        const [year, monthNum] = summary.monthYear.split('-');
        const monthName = arabicMonths[parseInt(monthNum) - 1]; // Convert month number to Arabic name

        let balanceText = '';
        let balanceClass = '';

        if (summary.remainingBalance > 0) {
            balanceText = `المتبقي: <span class="positive-balance">${summary.remainingBalance.toFixed(2)} ₪</span>`;
            balanceClass = 'positive-balance';
        } else if (summary.remainingBalance < 0) {
            balanceText = `الزائد: <span class="negative-balance">${Math.abs(summary.remainingBalance).toFixed(2)} ₪</span>`;
            balanceClass = 'negative-balance';
        } else {
            balanceText = `متوازن`;
            balanceClass = '';
        }

        div.innerHTML = `
            <strong>${monthName} ${year}:</strong><br>
            المجموع: <span class="total">${summary.totalExpenses.toFixed(2)} ₪</span><br>
            ${balanceText}
        `;
        container.appendChild(div);
    });
}