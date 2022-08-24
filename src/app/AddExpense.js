import * as React from "react";
import {Form, Button, ButtonGroup, ToggleButton, Alert} from 'react-bootstrap';

class AddExpense extends React.Component {
    constructor(props) {
        super(props);
        this.addExpense = this.addExpense.bind(this);
        this.onFormElementValueChange = this.onFormElementValueChange.bind(this);
        this.state = {
            subCategory: null,
            date: new Date().toISOString().slice(0, 10),
            comment: "",
            paymentMethod: "Citi",
            claimable: false,
            formError: false,
            showFormError: false
        }
    }

    addExpense(e) {
        e.preventDefault();
        if (this.props.category == null ||
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
                formError: "User not permitted to add expenses (view Only)"
            })
        } else
            this.props.onAddExpense(this.props.category, this.state.subCategory, this.state.amount,
                this.state.comment, this.state.date, this.state.paymentMethod, this.state.claimable)
    }

    onFormElementValueChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
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
                {this.state.subCategory == null &&
                    <h3 style={{marginLeft: "15px"}}>Add an expense under <b>{this.props.category}</b></h3>}
                {this.state.subCategory != null && <h3 style={{marginLeft: "15px"}}>Add
                    for <b>{this.props.category}</b> under <b>{this.state.subCategory}</b></h3>}
                <div className="col" style={rowStyleOverride}>
                    {
                        this.state.subCategory == null &&
                        this.props.subCategories.sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).map((subCategory) => {
                            return (
                                <button type="button" className="btn btn-dark btn-lg btn-block" key={subCategory}
                                        onClick={() => this.setState({subCategory: subCategory})}>
                                    {subCategory}
                                </button>
                            )
                        })
                    }
                </div>
                {
                    this.state.subCategory != null &&
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <h4 className="card-title">Details</h4>
                                    <div className="form-check">
                                        <label className="form-check-label text-muted">
                                            <input type="checkbox" className="form-check-input" name="claimable"
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
                                <Form onSubmit={this.addExpense}>
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
                                                          aria-label="Comment" aria-describedby="basic-addon1"
                                                          onChange={this.onFormElementValueChange}
                                            />
                                        </div>
                                    </Form.Group>
                                    <div style={{
                                        display: "flex",
                                    }}>
                                        <Button variant="primary" type="submit">
                                            Add
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