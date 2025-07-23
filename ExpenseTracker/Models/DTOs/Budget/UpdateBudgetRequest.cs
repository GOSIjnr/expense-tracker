using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Enums;

namespace ExpenseTracker.Models.DTOs.Budget;

/// <summary>
/// Represents a request to update specific properties of an existing budget.
/// </summary>
public class UpdateBudgetRequest
{
	/// <summary>
	/// The unique identifier of the budget to update.
	/// </summary>
	[Required(ErrorMessage = "Budget ID is required.")]
	public Guid? BudgetId { get; set; }

	/// <summary>
	/// The new expense category for the budget (optional).
	/// </summary>
	public ExpenseCategory? Category { get; set; }

	/// <summary>
	/// The new period (month and year) for the budget (optional).
	/// </summary>
	public DateOnly? Period { get; set; }

	/// <summary>
	/// The new spending limit for the budget (optional).
	/// </summary>
	[Range(0.01, double.MaxValue, ErrorMessage = "Limit must be greater than zero.")]
	public double? NewLimit { get; set; }
}
