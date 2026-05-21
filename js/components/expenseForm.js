(function () {
  function readExpenseForm(elements, editingId, createId) {
    return {
      id: editingId || createId(),
      title: elements.expenseTitle.value.trim(),
      amount: Number(elements.expenseAmount.value),
      category: elements.expenseCategory.value,
      date: elements.expenseDate.value,
    };
  }

  function validateExpense(expense) {
    return Boolean(
      expense.title &&
        expense.category &&
        expense.date &&
        Number.isFinite(expense.amount) &&
        expense.amount > 0
    );
  }

  function fillExpenseForm(elements, expense) {
    elements.expenseTitle.value = expense.title;
    elements.expenseAmount.value = expense.amount;
    elements.expenseCategory.value = expense.category;
    elements.expenseDate.value = expense.date;
    elements.formTitle.textContent = "Edit Expense";
    elements.submitExpense.textContent = "Update Expense";
    elements.cancelEdit.classList.remove("hidden");
    elements.formError.textContent = "";
    elements.expenseTitle.focus();
  }

  function resetExpenseForm(elements) {
    elements.expenseForm.reset();
    elements.expenseDate.valueAsDate = new Date();
    elements.formTitle.textContent = "Add Expense";
    elements.submitExpense.textContent = "Add Expense";
    elements.cancelEdit.classList.add("hidden");
    elements.formError.textContent = "";
  }

  window.FinanceTracker.expenseForm = {
    fillExpenseForm,
    readExpenseForm,
    resetExpenseForm,
    validateExpense,
  };
})();
