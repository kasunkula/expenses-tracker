import * as React from "react";
import Table from 'react-bootstrap/Table';
import {Button} from "react-bootstrap";

class ExpensesGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sortBy: "Date",
        };
    }

    getSortKeyValue(item, state) {
        switch (state.sortBy) {
            case "Date":
                return item.date;
            case "Amount":
                return item.amount;
            case "PaymentMethod":
                return item.paymentMethod;
            default:
                return item.date;
        }
    }

    renderSummaryAndSortByOptions() {
        return (
            <tr key="total">
                <td colSpan={2}><b>Total : {
                    this.props.expenses.filter((exp) => (exp.claimable === false))
                        .reduce((sum, expense) => Math.round(sum + expense.amount), 0)
                } </b> ({this.props.allocation})
                </td>
                <td colSpan={4} style={{ }}>
                    <b>Sort By :</b> {"    "}
                    <Button variant="primary" onClick={() => this.setState((prevState) => ({
                        sortBy: "Amount",
                    }))}>
                        {"$"}
                    </Button>
                    <Button variant="primary" onClick={() => this.setState((prevState) => ({
                        sortBy: "Date",
                    }))}>
                        {"Date"}
                    </Button>
                    <Button variant="primary" onClick={() => this.setState((prevState) => ({
                        sortBy: "PaymentMethod",
                    }))}>
                        {"Paid By"}
                    </Button>
                </td>
            </tr>
        )
    }

    render() {
        return (
            <div>
                <h3 style={{marginLeft: "15px", marginTop: "10px"}}>
                    {this.props.category != null ? "All expenses for " : "All expenses"}
                    <b>{this.props.category} </b>
                    ({this.props.expenses.length})
                </h3>
                <Table striped bordered hover responsive variant="dark">
                    <thead>
                    {this.renderSummaryAndSortByOptions()}
                    <tr>
                        <th>Date</th>
                        {this.props.category == null ? <th>Category</th> : ""}
                        <th>Sub Category</th>
                        <th>Amount</th>
                        <th>Paid</th>
                        <th>Comment</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.expenses.sort((a, b) => this.getSortKeyValue(a, this.state) > this.getSortKeyValue(b, this.state) ? -1 : 1).map((expense) => {
                            const date = new Date(expense.date)
                            return (
                                <tr key={expense.id} onClick={() => this.props.onExpenseSelect(expense)}>
                                    <td>{date.toLocaleString('en-us', {weekday: 'short'})}, {date.toLocaleString('en-us', {day: '2-digit'})}</td>
                                    {this.props.category == null ? <td>{expense.category}</td> : ""}
                                    <td>{expense.subCategory}</td>
                                    <td>{expense.amount}</td>
                                    <td>{expense.paymentMethod}</td>
                                    <td>{expense.comment}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default ExpensesGrid;