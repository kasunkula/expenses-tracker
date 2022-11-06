import * as React from "react";
import {Form, Button, ButtonGroup, ToggleButton, Alert} from 'react-bootstrap';

class AddExpense extends React.Component {
    constructor(props) {
        super(props);
        this.EditExpense = this.EditExpense.bind(this);
        this.onFormElementValueChange = this.onFormElementValueChange.bind(this);
        this.onDeleteExpense = this.onDeleteExpense.bind(this);
        this.state = {
            id: props.expense.id,
            category: props.expense.category,
            subCategory: props.expense.subCategory,
            date: props.expense.date,
            amount: props.expense.amount,
            comment: props.expense.comment,
            paymentMethod: props.expense.paymentMethod,
            claimable: props.expense.claimable,
            formError: "",
            showFormError: false
        }
    }

    EditExpense(e) {
        e.preventDefault();
        if (this.state.category == null ||
            this.state.subCategory == null ||
            this.state.amount == null || this.state.amount == "" ||
            this.state.date == null ||
            this.state.paymentMethod == null ||
            this.state.claimable == null) {
            this.setState({
                showFormError: true,
                formError: (this.state.amount == null || this.state.amount == "") ? "Amount missing...!" : "Invalid inputs...!"
            })
        } else if (!this.props.user.attributes.zoneinfo || this.props.user.attributes.zoneinfo != "Home") {
            this.setState({
                showFormError: true,
                formError: "User not permitted to Edit expenses (view Only)"
            })
        } else {
            this.props.onEditSubmit(this.state.id, this.state.amount, this.state.comment, this.state.date, this.state.paymentMethod,
                this.state.claimable)
        }
    }

    onFormElementValueChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onDeleteExpense(id){
        if (!this.props.user.attributes.zoneinfo || this.props.user.attributes.zoneinfo != "Home") {
            this.setState({
                showFormError: true,
                formError: "User not permitted to Delete expenses (view Only)"
            })
        } else {
            this.props.onDeleteSubmit(this.state.id)
        }
    }

    render() {
        const rowStyleOverride = {
            flexWrap: "nowrap",
            marginRight: "auto",
            marginLeft: "auto",
            justifyContent: "space-between"
        };

        const paymentMethods = ["Citi", "SC", "DBS", "Cash"]

        return (
            <div style={{
                marginTop: "10px"
            }}>
                {
                    this.state.subCategory != null &&
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <h4 className="card-title">Edit/Delete Expense</h4>
                                    <div className="form-check">
                                        <label className="form-check-label text-muted">
                                            <input type="checkbox" className="form-check-input" name="claimable"
                                                   value={this.state.claimable}
                                                   onChange={() => {
                                                       this.setState((prevState) => ({
                                                           claimable: !prevState.claimable
                                                       }))
                                                   }}/>
                                            <i className="input-helper"></i>
                                            Claimable
                                        </label>
                                    </div>
                                </div>
                                <Form onSubmit={this.EditExpense}>
                                    <Form.Group>
                                        <div className="input-group">
                                            <Form.Control type="text" className="form-control" disabled={true}
                                                          value={this.state.category} name="category"
                                                          aria-label="category" aria-describedby="basic-addon1"
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <div className="input-group">
                                            <Form.Control type="text" className="form-control" disabled={true}
                                                          value={this.state.subCategory} name="subCategory"
                                                          aria-label="subCategory" aria-describedby="basic-addon1"
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <div className="input-group">
                                            <Form.Control type="date" className="form-control"
                                                          aria-label="date" name="date"
                                                          value={this.state.date}
                                                          onChange={this.onFormElementValueChange}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <div className="input-group">
                                            <Form.Control type="number" className="form-control" placeholder="Amount"
                                                          aria-label="Amount" name="amount" step="0.01"
                                                          value={this.state.amount}
                                                          onChange={this.onFormElementValueChange}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group style={{
                                        marginBottom: "0.5rem"
                                    }}>
                                        <ButtonGroup className="mb-2">
                                            {paymentMethods.map((paymentMethod) => {
                                                return <ToggleButton
                                                    key={paymentMethod}
                                                    id={`radio-${paymentMethod}`}
                                                    type="radio"
                                                    variant="secondary"
                                                    name="radio"
                                                    value={paymentMethod}
                                                    checked={this.state.paymentMethod === paymentMethod}
                                                    onChange={(e) => this.setState({
                                                        paymentMethod: e.currentTarget.value
                                                    })}> {paymentMethod} </ToggleButton>
                                            })}
                                        </ButtonGroup>
                                    </Form.Group>
                                    <Form.Group>
                                        <div className="input-group">
                                            <Form.Control type="text" className="form-control"
                                                          placeholder="Comment" name="comment"
                                                          value={this.state.comment}
                                                          aria-label="Comment" aria-describedby="basic-addon1"
                                                          onChange={this.onFormElementValueChange}
                                            />
                                        </div>
                                    </Form.Group>
                                    <div style={{
                                        display: "flex",
                                    }}>
                                        <Button variant="primary" type="submit">
                                            Edit
                                        </Button>
                                        <Button variant="primary" onClick={() => this.onDeleteExpense(this.state.id)}>
                                            Delete
                                        </Button>
                                        <Button variant="primary" onClick={() => this.props.backToDashboard()}>
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                }
                {
                    this.state.showFormError && <Alert variant="danger">
                        {this.state.formError}
                    </Alert>
                }
            </div>
        )
    }
}

export default AddExpense;