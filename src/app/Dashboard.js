import Amplify, {API, graphqlOperation} from 'aws-amplify';
import awsConfig from '../aws-exports';
import {withAuthenticator} from "@aws-amplify/ui-react";
import '../App.scss';
import * as React from "react";
import NavBar from "./NavBar";
import SummaryView from "./SummaryView";
import AddExpense from "./AddExpense";
import {createExpense} from "../graphql/mutations";
import {v4 as uuidv4} from 'uuid';
import {listExpenses} from "../graphql/queries";
import {onCreateExpense} from "../graphql/subscriptions";
import ExpensesGrid from "./ExpensesGrid";

Amplify.configure(awsConfig);


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            loadingComplete: false,
            showSummary: true,
            showAddExpense: false,
            showExpensesGrid: false,
            addExpenseCategory: null,
            expensesGridCategory: null,
            year: now.getFullYear(),
            month: now.getMonth()
        };
        this.onClickAddExpense = this.onClickAddExpense.bind(this);
        this.onClickExpensesGridView = this.onClickExpensesGridView.bind(this);
        this.onAddExpense = this.onAddExpense.bind(this);
        this.goToNextMonth = this.goToNextMonth.bind(this);
        this.goToPreviousMonth = this.goToPreviousMonth.bind(this);
    }

    async componentDidMount() {
        const beginOfMonth = new Date(this.state.year, this.state.month, 1);
        const endOfMonth = new Date(this.state.year, this.state.month + 1, 0);
        // console.log("[Dashboard|componentDidMount] - Querying expenses from " +
        //     beginOfMonth.toLocaleString() + " to " + endOfMonth.toLocaleString())

        let nextToken = null
        const allExpense = []
        do {
            let getExpenses = await API.graphql(graphqlOperation(listExpenses, {
                nextToken: nextToken
            }))
            const expenses = await getExpenses.data.listExpenses
            nextToken = expenses.nextToken
            allExpense.push(...expenses.items)
        } while (nextToken != null)

        this.subscribeToOnCreateExpense()

        this.setState({
            loadingComplete: true,
            allExpenses: allExpense
        })
    }

    async queryExpenses(year, month) {

    }

    goToNextMonth() {
        this.setState((prevState) => {
                const date = new Date(prevState.year, prevState.month + 1)
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
                    showSummary: false,
                    showAddExpense: true,
                    showExpensesGrid: false,
                    addExpenseCategory: category,
                    expensesGridCategory: null
                }
            )
        )
    }

    onClickExpensesGridView(category) {
        this.setState({
            showSummary: false,
            showAddExpense: false,
            showExpensesGrid: true,
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
                // const expenses = prevState.allExpenses
                // expenses.push(newExpense)
                return {
                    showSummary: true,
                    showAddExpense: false,
                    showExpensesGrid: false,
                    addExpenseCategory: null,
                    expensesGridCategory: null,
                    // allExpenses: expenses
                }
            }
        )
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

    render() {
        if (!this.state.loadingComplete) {
            return (
                <div>
                    <NavBar {...this.props} backToDashboard={() => this.setState({
                        showSummary: true,
                        showAddExpense: false,
                        showExpensesGrid: false,
                        addExpenseCategory: null,
                        expensesGridCategory: null
                    })}/>
                    {/*<div>*/}
                    {/*    <Spinner animation="border" />*/}
                    {/*</div>*/}
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
                "spent": 0
            },
            "Eating Out": {
                "allocation": 500,
                "spent": 0
            },
            "Yara": {
                "allocation": 400,
                "spent": 0
            },
            "Transport": {
                "allocation": 150,
                "spent": 0
            },
            "Misc": {
                "allocation": 250,
                "spent": 0
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
                        backToDashboard={() => this.setState({
                            showSummary: true,
                            showAddExpense: false,
                            showExpensesGrid: false,
                            addExpenseCategory: null,
                            expensesGridCategory: null
                        })}/>

                {this.state.showSummary &&
                    <SummaryView onAddExpense={this.onClickAddExpense}
                                 categories={categories}
                                 summary={summary}
                                 onExpensesGridView={this.onClickExpensesGridView}
                                 year={this.state.year}
                                 month={this.state.month}
                    />}
                {this.state.showAddExpense &&
                    <AddExpense
                        category={this.state.addExpenseCategory}
                        subCategories={subCategories[this.state.addExpenseCategory]}
                        user={this.props.user}
                        onAddExpense={this.onAddExpense}
                        backToDashboard={() => this.setState({
                            showSummary: true,
                            showAddExpense: false,
                            showExpensesGrid: false,
                            addExpenseCategory: null,
                            expensesGridCategory: null
                        })}
                    />}
                {
                    this.state.showExpensesGrid &&
                    <ExpensesGrid
                        category={this.state.expensesGridCategory}
                        expenses={
                            this.getExpensesForMonth(this.state.allExpenses, this.state.year, this.state.month)
                                .filter((expense) => (
                                    this.state.expensesGridCategory == null ||
                                    expense.category === this.state.expensesGridCategory
                                ))}
                    />
                }
            </div>
        )
    }
}

export default withAuthenticator(Dashboard);