/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getExpense = /* GraphQL */ `
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
      id
      category
      subCategory
      date
      amount
      comment
      claimable
      paymentMethod
      createdAt
      updatedAt
    }
  }
`;
export const listExpenses = /* GraphQL */ `
  query ListExpenses(
    $filter: ModelExpenseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExpenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        category
        subCategory
        date
        amount
        comment
        claimable
        paymentMethod
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
