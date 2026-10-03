// ======================================
// GET HTML ELEMENTS
// ======================================

const transactionForm = document.getElementById("transactionForm");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const categorySummary = document.getElementById("categorySummary");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const themeBtn = document.getElementById("themeBtn");

const monthlyExpenseElement =
    document.getElementById("monthlyExpense");

const highestExpenseElement =
    document.getElementById("highestExpense");

const highestExpenseNameElement =
    document.getElementById("highestExpenseName");


// ======================================
// TRANSACTION DATA
// ======================================

let transactions = [];

try {

    const savedData =
        localStorage.getItem("transactions");

    if (savedData) {

        const parsedData =
            JSON.parse(savedData);

        if (Array.isArray(parsedData)) {

            transactions = parsedData.map(transaction => {

                return {

                    id: Number(transaction.id),

                    description:
                        String(transaction.description || ""),

                    amount:
                        Number(transaction.amount) || 0,

                    type:
                        transaction.type === "expense"
                            ? "expense"
                            : "income",

                    category:
                        String(transaction.category || "Other"),

                    date:
                        String(transaction.date || "")

                };

            });

        }

    }

} catch (error) {

    console.error(
        "Error loading transactions:",
        error
    );

    transactions = [];

}


let editId = null;


// ======================================
// SET TODAY'S DATE
// ======================================

if (dateInput) {

    dateInput.valueAsDate =
        new Date();

}


// ======================================
// ADD / UPDATE TRANSACTION
// ======================================

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const description =
            descriptionInput.value.trim();

        const amount =
            Number(amountInput.value);

        const type =
            typeInput.value;

        const category =
            categoryInput.value;

        const date =
            dateInput.value;


        // ==================================
        // VALIDATION
        // ==================================

        if (
            description === "" ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            date === ""
        ) {

            alert(
                "Please enter valid transaction details."
            );

            return;

        }


        // ==================================
        // UPDATE EXISTING TRANSACTION
        // ==================================

        if (editId !== null) {

            transactions =
                transactions.map(
                    transaction => {

                        if (
                            Number(transaction.id) ===
                            Number(editId)
                        ) {

                            return {

                                ...transaction,

                                description:
                                    description,

                                amount:
                                    amount,

                                type:
                                    type,

                                category:
                                    category,

                                date:
                                    date

                            };

                        }

                        return transaction;

                    }
                );


            editId = null;


            const button =
                document.querySelector(".add-btn");


            if (button) {

                button.textContent =
                    "+ Add Transaction";

            }

        }


        // ==================================
        // ADD NEW TRANSACTION
        // ==================================

        else {

            const newTransaction = {

                id:
                    Date.now(),

                description:
                    description,

                amount:
                    amount,

                type:
                    type,

                category:
                    category,

                date:
                    date

            };


            transactions.push(
                newTransaction
            );

        }


        // ==================================
        // SAVE + UPDATE UI
        // ==================================

        saveTransactions();

        renderTransactions();

        updateSummary();

        updateAnalytics();

        updateCategorySummary();


        // ==================================
        // RESET FORM
        // ==================================

        transactionForm.reset();

        dateInput.valueAsDate =
            new Date();

    }
);


// ======================================
// SAVE TRANSACTIONS
// ======================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ======================================
// RENDER TRANSACTIONS
// ======================================

function renderTransactions(
    searchTerm = "",
    selectedCategory = "all"
) {

    transactionList.innerHTML = "";


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filteredTransactions =
        transactions.filter(
            transaction => {

                const description =
                    String(
                        transaction.description || ""
                    ).toLowerCase();


                const matchesSearch =
                    description.includes(search);


                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    // ==================================
    // NO TRANSACTIONS
    // ==================================

    if (
        filteredTransactions.length === 0
    ) {

        transactionList.innerHTML = `

            <div class="empty-state">

                <p>📭 No transactions found.</p>

                <span>
                    Add your first transaction above.
                </span>

            </div>

        `;

        return;

    }


    // ==================================
    // SHOW TRANSACTIONS
    // ==================================

    filteredTransactions
        .slice()
        .reverse()
        .forEach(
            transaction => {

                const item =
                    document.createElement("div");


                item.className =
                    "transaction-item";


                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const sign =
                    transaction.type === "income"
                        ? "+"
                        : "-";


                const amountClass =
                    transaction.type === "income"
                        ? "income-text"
                        : "expense-text";


                item.innerHTML = `

                    <div class="transaction-info">

                        <span class="transaction-title">
                            ${escapeHTML(
                                transaction.description
                            )}
                        </span>

                        <span class="transaction-meta">
                            ${escapeHTML(
                                transaction.category
                            )}
                            •
                            ${formatDate(
                                transaction.date
                            )}
                        </span>

                    </div>


                    <div class="transaction-right">

                        <span class="${amountClass}">
                            ${sign} ₹${amount.toFixed(2)}
                        </span>


                        <button
                            class="edit-btn"
                            onclick="editTransaction(${transaction.id})">
                            ✏️
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteTransaction(${transaction.id})">
                            🗑️
                        </button>

                    </div>

                `;


                transactionList.appendChild(
                    item
                );

            }
        );

}


// ======================================
// DELETE TRANSACTION
// ======================================

function deleteTransaction(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmation) {

        return;

    }


    transactions =
        transactions.filter(
            transaction =>
                Number(transaction.id) !==
                Number(id)
        );


    saveTransactions();

    renderTransactions(
        searchInput.value,
        categoryFilter.value
    );

    updateSummary();

    updateAnalytics();

    updateCategorySummary();

}


// ======================================
// EDIT TRANSACTION
// ======================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            transaction =>
                Number(transaction.id) ===
                Number(id)
        );


    if (!transaction) {

        return;

    }


    descriptionInput.value =
        transaction.description;


    amountInput.value =
        Number(transaction.amount);


    typeInput.value =
        transaction.type;


    categoryInput.value =
        transaction.category;


    dateInput.value =
        transaction.date;


    editId =
        transaction.id;


    const button =
        document.querySelector(".add-btn");


    if (button) {

        button.textContent =
            "💾 Update Transaction";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================
// UPDATE DASHBOARD SUMMARY
// ======================================

function updateSummary() {

    let income = 0;

    let expense = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type === "income"
            ) {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );


    const balance =
        income - expense;


    balanceElement.textContent =
        `₹${balance.toFixed(2)}`;


    incomeElement.textContent =
        `₹${income.toFixed(2)}`;


    expenseElement.textContent =
        `₹${expense.toFixed(2)}`;

}


// ======================================
// MONTHLY + HIGHEST EXPENSE
// ======================================

function updateAnalytics() {

    // Check HTML elements

    if (
        !monthlyExpenseElement ||
        !highestExpenseElement ||
        !highestExpenseNameElement
    ) {

        console.warn(
            "Analytics elements not found in HTML."
        );

        return;

    }


    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentYear =
        today.getFullYear();


    // ==================================
    // ALL EXPENSES
    // ==================================

    const allExpenses =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    // ==================================
    // CURRENT MONTH EXPENSES
    // ==================================

    const monthlyExpenses =
        allExpenses.filter(
            transaction => {

                if (!transaction.date) {

                    return false;

                }


                const transactionDate =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );


                return (

                    transactionDate.getMonth() ===
                    currentMonth

                    &&

                    transactionDate.getFullYear() ===
                    currentYear

                );

            }
        );


    // ==================================
    // MONTHLY TOTAL
    // ==================================

    const monthlyTotal =
        monthlyExpenses.reduce(
            (total, transaction) => {

                return (
                    total +
                    (Number(
                        transaction.amount
                    ) || 0)
                );

            },
            0
        );


    monthlyExpenseElement.textContent =
        `₹${monthlyTotal.toFixed(2)}`;


    // ==================================
    // HIGHEST EXPENSE
    // ==================================

    if (
        allExpenses.length === 0
    ) {

        highestExpenseElement.textContent =
            "₹0.00";


        highestExpenseNameElement.textContent =
            "No expense yet";


        return;

    }


    const highestExpense =
        allExpenses.reduce(
            (highest, transaction) => {

                const currentAmount =
                    Number(
                        transaction.amount
                    ) || 0;


                const highestAmount =
                    Number(
                        highest.amount
                    ) || 0;


                if (
                    currentAmount >
                    highestAmount
                ) {

                    return transaction;

                }


                return highest;

            }
        );


    highestExpenseElement.textContent =
        `₹${(
            Number(
                highestExpense.amount
            ) || 0
        ).toFixed(2)}`;


    highestExpenseNameElement.textContent =
        highestExpense.description;

}


// ======================================
// SEARCH
// ======================================

searchInput.addEventListener(
    "input",
    function () {

        renderTransactions(
            searchInput.value,
            categoryFilter.value
        );

    }
);


// ======================================
// CATEGORY FILTER
// ======================================

categoryFilter.addEventListener(
    "change",
    function () {

        renderTransactions(
            searchInput.value,
            categoryFilter.value
        );

    }
);


// ======================================
// CATEGORY SUMMARY
// ======================================

function updateCategorySummary() {

    categorySummary.innerHTML = "";


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    const categories = {};


    expenses.forEach(
        transaction => {

            const category =
                transaction.category ||
                "Other";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                !categories[category]
            ) {

                categories[category] =
                    0;

            }


            categories[category] +=
                amount;

        }
    );


    Object.keys(categories)
        .forEach(
            category => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "category-item";


                item.innerHTML = `

                    <span class="category-name">
                        ${escapeHTML(category)}
                    </span>

                    <span class="category-amount">
                        ₹${categories[
                            category
                        ].toFixed(2)}
                    </span>

                `;


                categorySummary.appendChild(
                    item
                );

            }
        );


    if (
        Object.keys(categories).length ===
        0
    ) {

        categorySummary.innerHTML =
            "<p>No expense data available.</p>";

    }

}


// ======================================
// DATE FORMAT
// ======================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    const dateObject =
        new Date(
            date + "T00:00:00"
        );


    if (
        isNaN(
            dateObject.getTime()
        )
    ) {

        return date;

    }


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================
// DARK MODE
// ======================================

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        if (
            document.body.classList.contains(
                "dark"
            )
        ) {

            themeBtn.textContent =
                "☀️";


            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            themeBtn.textContent =
                "🌙";


            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);


// ======================================
// LOAD THEME
// ======================================

const savedTheme =
    localStorage.getItem(
        "theme"
    );


if (
    savedTheme === "dark"
) {

    document.body.classList.add(
        "dark"
    );


    themeBtn.textContent =
        "☀️";

}


// ======================================
// SECURITY HELPER
// ======================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// INITIAL LOAD
// ======================================

renderTransactions();

updateSummary();

updateAnalytics();

updateCategorySummary();

