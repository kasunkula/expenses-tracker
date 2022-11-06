import Amplify, {API, graphqlOperation} from 'aws-amplify';
import awsConfig from '../aws-exports';
import {withAuthenticator} from "@aws-amplify/ui-react";
import '../App.scss';
import * as React from "react";
import NavBar from "./NavBar";
import SummaryView from "./SummaryView";
import AddExpense from "./AddExpense";
import {createExpense, deleteExpense, updateExpense} from "../graphql/mutations";
import {v4 as uuidv4} from 'uuid';
import {listExpenses} from "../graphql/queries";
import {onCreateExpense} from "../graphql/subscriptions";
import ExpensesGrid from "./ExpensesGrid";
import EditExpense from "./EditExpense";
import {Spinner} from "react-bootstrap";

Amplify.configure(awsConfig);


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            loadingComplete: false,
            displayComponent: "Summary",
            addExpenseCategory: null,
            expensesGridCategory: null,
            year: now.getFullYear(),
            month: now.getMonth(),
            selectedExpense: null
        };
        this.onClickAddExpense = this.onClickAddExpense.bind(this);
        this.onClickExpensesGridView = this.onClickExpensesGridView.bind(this);
        this.onAddExpense = this.onAddExpense.bind(this);
        this.onEditExpense = this.onEditExpense.bind(this);
        this.onExpenseSelectFromExpensesGrid = this.onExpenseSelectFromExpensesGrid.bind(this);
        this.onDeleteExpense = this.onDeleteExpense.bind(this);
        this.goToNextMonth = this.goToNextMonth.bind(this);
        this.goToPreviousMonth = this.goToPreviousMonth.bind(this);
        this.queryExpenses = this.queryExpenses.bind(this)
        this.goBackToDashboard = this.goBackToDashboard.bind(this)
    }

    async componentDidMount() {
        this.subscribeToOnCreateExpense()
        await this.queryExpenses(this.state.year, this.state.month)
    }

    async queryExpenses(year, month) {
        const beginOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        // console.log("Loading Expenses for year [" + beginOfMonth.toDateString() +
        //     "] month [" + endOfMonth.toDateString() + "]")

        this.setState({
            loadingComplete: false,
            allExpenses: null
        })

        let nextToken = null
        let filter = {
            date: {ge: beginOfMonth}
        };
        const allExpense = []
        do {
            let getExpenses = await API.graphql(graphqlOperation(listExpenses, {
                nextToken: nextToken,
                filter: filter
            }))
            const expenses = await getExpenses.data.listExpenses
            nextToken = expenses.nextToken
            allExpense.push(...expenses.items)
        } while (nextToken != null)

        this.setState({
            loadingComplete: true,
            allExpenses: allExpense
        })
    }

    goToNextMonth() {
        this.setState((prevState) => {
                const date = new Date(prevState.year, prevState.month + 1)
                this.queryExpenses(date.getFullYear(), date.getMonth())
                return {
                    year: date.getFullYear(),
                    month: date.getMonth()
                }
            }
        )

    }

    goToPreviousMonth() {
        this.setState((prevState) => {
                const date = new Date(prevState.year, prevState.month - 1)
                this.queryExpenses(date.getFullYear(), date.getMonth())
                return {
                    year: date.getFullYear(),
                    month: date.getMonth()
                }
            }
        )
    }

    subscribeToOnCreateExpense() {
        API.graphql(graphqlOperation(onCreateExpense)).subscribe({
            next: ({provider, value}) => {
                // console.log("[Dashboard|onCreateExpense] Expense - " + value.data.onCreateExpense);
                this.setState((prevState) => ({
                    allExpenses: [...prevState.allExpenses, value.data.onCreateExpense]
                }))
            },
            error: (error) => console.warn(error)
        });
    }

    onClickAddExpense(category) {
        this.setState(() => ({
                    displayComponent: "AddExpense",
                    addExpenseCategory: category,
                    expensesGridCategory: null
                }
            )
        )
    }

    onClickExpensesGridView(category) {
        this.setState({
            displayComponent: "ExpensesGrid",
            addExpenseCategory: null,
            expensesGridCategory: category !== 'Total' ? category : null
        })
    }

    onAddExpense(category, subCategory, amount, comment, date, paymentMethod, claimable) {
        // console.log("[Dashboard|onAddExpense] Add Expense - " +
        //     category + ", " + subCategory + ", " + amount + ", " + comment + ", " +
        //     date + ", " + paymentMethod + ", " + claimable);

        const newExpense = {
            id: uuidv4(),
            category: category,
            subCategory: subCategory,
            date: date,
            amount: amount,
            comment: comment,
            paymentMethod: paymentMethod,
            claimable: claimable
        }

        API.graphql(graphqlOperation(createExpense, {
            input: newExpense
        }));

        this.setState((prevState) => {
                return {
                    displayComponent: "Summary",
                    addExpenseCategory: null,
                    expensesGridCategory: null,
                }
            }
        )
    }

    onExpenseSelectFromExpensesGrid(expense) {
        this.setState((prevState) => {
                return {
                    displayComponent: "EditExpense",
                    addExpenseCategory: null,
                    expensesGridCategory: null,
                    selectedExpense: expense
                }
            }
        )
    }

    onEditExpense(id, amount, comment, date, paymentMethod, claimable) {
        API.graphql(graphqlOperation(updateExpense, {
            input: {
                id: id,
                date: date,
                amount: amount,
                comment: comment,
                paymentMethod: paymentMethod,
                claimable: claimable
            }
        }));

        this.setState((prevState) => {
                return {
                    displayComponent: "Summary",
                    addExpenseCategory: null,
                    expensesGridCategory: null,
                    selectedExpense: null
                }
            }
        )

        this.queryExpenses(this.state.year, this.state.month)
    }

    onDeleteExpense(expenseId) {
        API.graphql(graphqlOperation(deleteExpense, {
            input: {
                id: expenseId,
            }
        }));

        this.setState((prevState) => {
                return {
                    displayComponent: "Summary",
                    addExpenseCategory: null,
                    expensesGridCategory: null,
                    selectedExpense: null
                }
            }
        )

        this.queryExpenses(this.state.year, this.state.month)
    }

    getTotalSpendForCategory(category, expenses) {
        return expenses.filter((exp) => (exp.category === category && exp.claimable === false))
            .reduce((sum, expense) => Math.round(sum + expense.amount), 0)
    }

    getExpensesForMonth(expenses, year, month) {
        return expenses.filter((expense) => {
            const date = new Date(expense.date)
            return date.getFullYear() === year && date.getMonth() === month
        })
    }

    goBackToDashboard(reloadExpenses=true){
        this.setState({
            displayComponent: "Summary",
            addExpenseCategory: null,
            expensesGridCategory: null
        })
    }


    render() {
        if (!this.state.loadingComplete) {
            return (
                <div>
                    <NavBar {...this.props} backToDashboard={() => this.setState({
                        displayComponent: "Summary",
                        addExpenseCategory: null,
                        expensesGridCategory: null
                    })}/>
                    <div>
                        <Spinner style={{
                            padding: "10%",
                            marginLeft: "40%",
                            marginTop: "55%",
                        }} animation="border" />
                    </div>
                </div>
            )
        }

        const categories = [
            "Groceries",
            "Eating Out",
            "Yara",
            "Transport",
            "Misc",
        ]
        const subCategories = {
            "Groceries": ['FairPrice', 'ColdStorage', 'Fruits', 'Vegetables', 'Fish', 'Flowers', 'Bakeries', 'Other'],
            "Eating Out": ['Starbucks', 'Old Chang Kee', 'Meals', 'Snacks', 'KOI Thé', 'Other'],
            "Yara": ['Taekwondo', 'Toys', 'Swimming', 'Rides', 'School Activities', 'Play Area', 'Attractions', 'Shopee', 'Stationary & Books', 'Other', 'Cloths'],
            "Transport": ['Grab', 'Bus/Mrt', 'Gojek', 'Taxi', 'Other'],
            "Misc": ['Medical', 'Disney+', 'Amazon Prime', 'House Maintenance', 'Shopping', 'IKEA', 'Attractions', 'Shopee', 'Entertainment', 'Other'],
        }
        let summary = {
            "Groceries": {
                "allocation": 700,
            },
            "Eating Out": {
                "allocation": 500,
            },
            "Yara": {
                "allocation": 400,
            },
            "Transport": {
                "allocation": 150,
            },
            "Misc": {
                "allocation": 250,
            }
        }

        if (this.state.allExpenses) {
            const expenses = this.getExpensesForMonth(this.state.allExpenses, this.state.year, this.state.month)
            let totalAllocation = 0
            let totalSpend = 0
            for (const category in summary) {
                summary[category]["spent"] = this.getTotalSpendForCategory(category, expenses)
                totalSpend += summary[category]["spent"]
                totalAllocation += summary[category]["allocation"]
            }

            summary = {
                ...summary,
                "Total": {
                    "allocation": totalAllocation,
                    "spent": totalSpend
                }
            }
        }

        return (
            <div>
                <NavBar {...this.props} year={this.state.year} month={this.state.month}
                        goToPreviousMonth={this.goToPreviousMonth} goToNextMonth={this.goToNextMonth}
                        backToDashboard={this.goBackToDashboard}/>

                {this.state.displayComponent === "Summary" &&
                    <SummaryView onAddExpense={this.onClickAddExpense}
                                 categories={categories}
                                 summary={summary}
                                 onExpensesGridView={this.onClickExpensesGridView}
                                 year={this.state.year}
                                 month={this.state.month}
                    />}
                {this.state.displayComponent === "AddExpense" &&
                    <AddExpense
                        category={this.state.addExpenseCategory}
                        subCategories={subCategories[this.state.addExpenseCategory]}
                        user={this.props.user}
                        onAddExpense={this.onAddExpense}
                        backToDashboard={() => this.setState({
                            displayComponent: "Summary",
                            addExpenseCategory: null,
                            expensesGridCategory: null
                        })}
                    />}
                {
                    this.state.displayComponent === "ExpensesGrid" &&
                    <ExpensesGrid
                        category={this.state.expensesGridCategory}
                        onExpenseSelect={this.onExpenseSelectFromExpensesGrid}
                        allocation={summary[this.state.expensesGridCategory != null ?
                            this.state.expensesGridCategory : "Total"]['allocation']}
                        expenses={
                            this.getExpensesForMonth(this.state.allExpenses, this.state.year, this.state.month)
                                .filter((expense) => (
                                    this.state.expensesGridCategory == null ||
                                    expense.category === this.state.expensesGridCategory
                                ))}
                    />
                }
                {
                    this.state.displayComponent === "EditExpense" &&
                    <EditExpense
                        expense={this.state.selectedExpense}
                        onEditSubmit={this.onEditExpense}
                        onDeleteSubmit={this.onDeleteExpense}
                        user={this.props.user}
                        backToDashboard={() => this.setState({
                            displayComponent: "Summary",
                            addExpenseCategory: null,
                            expensesGridCategory: null
                        })}
                    />
                }
            </div>
        )
    }
}

export default withAuthenticator(Dashboard);