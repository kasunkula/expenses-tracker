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
        this.state = {
            loadingComplete: false,
            showSummary: true,
            showAddExpense: false,
            showExpensesGrid: false,
            addExpenseCategory: null,
            expensesGridCategory: null
        };
        this.onClickAddExpense = this.onClickAddExpense.bind(this);
        this.onClickExpensesGridView = this.onClickExpensesGridView.bind(this);
        this.onAddExpense = this.onAddExpense.bind(this);
    }

    async componentDidMount() {
        console.log("[Dashboard|componentDidMount] - Querying expenses")
        const getAllExpenseList = await API.graphql(graphqlOperation(listExpenses))
        const expenses = await getAllExpenseList.data.listExpenses

        API.graphql(graphqlOperation(onCreateExpense)).subscribe({
            next: ({provider, value}) => {
                console.log("[Dashboard|onCreateExpense] Expense - " + value.data.onCreateExpense);
                this.setState((prevState) => ({
                    allExpenses: [...prevState.allExpenses, value.data.onCreateExpense]
                }))
            },
            error: (error) => console.warn(error)
        });

        this.setState({
            loadingComplete: true,
            allExpenses: expenses.items
        })
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
        console.log("[Dashboard|onAddExpense] Add Expense - " +
            category + ", " + subCategory + ", " + amount + ", " + comment + ", " +
            date + ", " + paymentMethod + ", " + claimable);

        API.graphql(graphqlOperation(createExpense, {
            input: {
                id: uuidv4(),
                category: category,
                subCategory: subCategory,
                date: date,
                amount: amount,
                comment: comment,
                paymentMethod: paymentMethod,
                claimable: false
            }
        }));
        this.setState({
            showSummary: true,
            showAddExpense: false,
            showExpensesGrid: false,
            addExpenseCategory: null,
            expensesGridCategory: null
        })
    }


    getTotalSpendForCategory(category, expenses) {
        return expenses.filter((exp) => (exp.category === category && exp.claimable === false)).reduce((sum, expense) => sum + expense.amount, 0)
    }

    getExpensesForCurrentMonth(expenses) {
        return expenses.filter((expense) => {
            const now = new Date();
            const date = new Date(expense.date)
            return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
        })
    }

    render() {
        if (!this.state.loadingComplete){
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
            "Yara": ['Taekwondo', 'Toys', 'Swimming', 'Rides', 'School Activities', 'Play Area', 'Attractions', 'Shopee', 'Stationary & Books', 'Other'],
            "Transport": ['Grab', 'Bus/Mrt', 'Gojek', 'Taxi', 'Other'],
            "Misc": ['Medical', 'Disney+', 'Amazon Prime', 'House Maintenance', 'Shopping', 'IKEA', 'Attractions', 'Shopee', 'Entertainment', 'Other'],
        }
        let summary = {
            "Groceries": {
                "allocation": 800,
                "spent": 0
            },
            "Eating Out": {
                "allocation": 400,
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
            const expenses = this.getExpensesForCurrentMonth(this.state.allExpenses)
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
                <NavBar {...this.props} backToDashboard={() => this.setState({
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
                        expenses={this.getExpensesForCurrentMonth(this.state.allExpenses).filter((expense) => (
                            this.state.expensesGridCategory == null || expense.category === this.state.expensesGridCategory
                        ))}
                    />
                }
            </div>
        )
    }
}

export default withAuthenticator(Dashboard);