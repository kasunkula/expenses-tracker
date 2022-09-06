import * as React from "react";
import CategorySummary from "./CategorySummary";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class SummaryView extends React.Component {
    render() {
        const rowStyleOverride = {
            flexWrap: "nowrap",
            marginRight: "2px",
            marginLeft: "2px",
            justifyContent: "space-between",
        };
        return (
            <div>
                <div className="row" style={rowStyleOverride}>
                    <CategorySummary name={'Total'}
                                     allocation={this.props.summary['Total']['allocation']}
                                     spent={this.props.summary['Total']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                    <CategorySummary name={'Eating Out'} onClick={() => this.props.onAddExpense('Eating Out')}
                                     allocation={this.props.summary['Eating Out']['allocation']}
                                     spent={this.props.summary['Eating Out']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                </div>
                <div className="row" style={rowStyleOverride}>
                    <CategorySummary name={'Yara'} onClick={() => this.props.onAddExpense('Yara')}
                                     allocation={this.props.summary['Yara']['allocation']}
                                     spent={this.props.summary['Yara']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                    <CategorySummary name={'Transport'} onClick={() => this.props.onAddExpense('Transport')}
                                     allocation={this.props.summary['Transport']['allocation']}
                                     spent={this.props.summary['Transport']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                </div>
                <div className="row" style={rowStyleOverride}>
                    <CategorySummary name={'Groceries'} onClick={() => this.props.onAddExpense('Groceries')}
                                     allocation={this.props.summary['Groceries']['allocation']}
                                     spent={this.props.summary['Groceries']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                    <CategorySummary name={'Misc'} onClick={() => this.props.onAddExpense('Misc')}
                                     allocation={this.props.summary['Misc']['allocation']}
                                     spent={this.props.summary['Misc']['spent']}
                                     onExpensesGridView={this.props.onExpensesGridView}
                                     year={this.props.year} month={this.props.month}/>
                </div>
            </div>
        )
    }

}

export default SummaryView;