import React from 'react';
import {CircularProgressbarWithChildren} from 'react-circular-progressbar';

class CategorySummary extends React.Component {
    getPercentage(totalAllocation, totalSpend) {
        return Math.round((totalSpend * 100) / totalAllocation);
    }

    getExpectedSpendPercentage(year, month) {
        const now = new Date();
        const beginOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const diffInMs = Math.abs(now - beginOfMonth);
        const daysElapsed = Math.round(diffInMs / (1000 * 60 * 60 * 24));
        const daysInMonth = Math.abs(endOfMonth - beginOfMonth) / (1000 * 60 * 60 * 24);
        const expectedSpentPerc = Math.round(daysElapsed * 100 / daysInMonth)
        // console.log("Year, Month [" + year + "," + month + "] begin [" + beginOfMonth + "] end [" + endOfMonth + "] current [" + now + "]")
        return expectedSpentPerc < 100 ? expectedSpentPerc : 100
    }

    getColourCode(allocation, spent, year, month, category) {
        const percentage = this.getPercentage(allocation, spent)
        const colourCodes = {
            underSpent: ["progress-order", "#1579ff", "#7922e5", "blue"],
            onBudget: ["progress-visitors", "#b4ec51", "#429321", "green"],
            slightlyOverSpent: ["progress-impressions", "#fad961", "#f76b1c", "yellow"],
            extremelyOverSpent: ["progress-followers", "#f5515f", "#9f041b", "red"],
        }

        let colourCode
        const expectedSpentPercentage = this.getExpectedSpendPercentage(year, month)
        // console.log("[" + category + "] Allocation [" + allocation + "] " +
        //     "Spend [" + spent + "] expectedSpentPercentage [" + expectedSpentPercentage + "] " +
        //     "spendPerc [" + percentage + "]")
        if (percentage <= this.getAdjustedPercentage(expectedSpentPercentage, 0.85)) {
            colourCode = colourCodes['underSpent']
        } else if (percentage <= this.getAdjustedPercentage(expectedSpentPercentage, 1)) {
            colourCode = colourCodes['onBudget']
        } else if (percentage < this.getAdjustedPercentage(expectedSpentPercentage, 1.15)) {
            colourCode = colourCodes['slightlyOverSpent']
        } else {
            colourCode = colourCodes['extremelyOverSpent']
        }
        return colourCode
    }

    getAdjustedPercentage(percentage, adjustmentRatio) {
        const adjustedRatio = Math.round(percentage * adjustmentRatio);
        return adjustedRatio < 100 ? adjustedRatio : 100;
    }

    onAddExpense() {
        this.props.onClick(this.props.name)
    }

    render() {
        let colourCode = ["", "", "", ""]
        if (this.props.name != null) {
            colourCode =
                this.getColourCode(this.props.allocation, this.props.spent,
                    this.props.year, this.props.month, this.props.name)
        }

        return (
            <div className="card" style={{}}>
                <div className="card-body text-center" style={{
                    visibility: this.props.name == null ? "hidden" : "visible",
                    padding: "0.6rem"
                }}>
                    <h3 className="mb-2 text-dark font-weight-bold"
                        onClick={() => this.props.onExpensesGridView(this.props.name)}>{this.props.name}</h3>
                    <div className="px-4 d-flex align-items-center">
                        <svg width="0" height="0">
                            <defs>
                                <linearGradient id={colourCode[0]} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={colourCode[1]}/>
                                    <stop offset="100%" stopColor={colourCode[2]}/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <CircularProgressbarWithChildren className={colourCode[0]}
                                                         value={this.getPercentage(this.props.allocation, this.props.spent)}>
                            <div>
                                {
                                    this.props.onClick &&
                                    <i className="mdi mdi-plus icon-md absolute-center text-dark"
                                       onClick={() => this.onAddExpense()}></i>
                                }
                            </div>
                        </CircularProgressbarWithChildren>
                    </div>
                    <h6 className="mb-0 font-weight-bold mt-2 text-dark">
                        {Math.abs(Math.round(this.props.allocation - this.props.spent))}
                        {Math.round(this.props.allocation - this.props.spent) > 0 ? " remaining of " : " overspent over "}
                        {this.props.allocation}</h6>
                </div>
            </div>
        )
    }
}

export default CategorySummary;