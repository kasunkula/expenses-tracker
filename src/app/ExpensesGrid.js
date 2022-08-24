import * as React from "react";
import Table from 'react-bootstrap/Table';

class ExpensesGrid extends React.Component {
    render() {
        return (
            <div>
                <h3 style={{marginLeft: "15px", marginTop: "10px"}}>{this.props.category != null ? "All expenses for" : "All expenses"} <b>{this.props.category}</b></h3>
                <Table striped bordered hover responsive variant="dark">
                    <thead>
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
                        this.props.expenses.sort((a, b) => a.date > b.date ? -1 : 1).map((expense) => {
                            const date = new Date(expense.date)
                            return (
                                <tr key={expense.id}>
                                    <td>{date.toLocaleString('en-us', { weekday: 'short' })}, {date.toLocaleString('en-us', { day: '2-digit' })}</td>
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