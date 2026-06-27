/**
 * GraphQL queries for Medusa Storefront API.
 *
 * These follow the Medusa.js v2 Storefront GraphQL schema conventions.
 */

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    subtitle
    handle
    description
    material
    originCountry
    thumbnail
    images { url alt }
    variants {
      id
      sku
      title
      inventoryQuantity
      allowBackorder
      options { id name value }
      prices { amount currencyCode }
    }
    categories { id name handle }
    tags { id value }
    type { id name }
    collection { id handle title }
  }
`;

export const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query Products(
    $categoryId: String,
    $search: String,
    $cursor: String,
    $limit: Int = 20,
    $offset: Int,
    $priceGte: Float,
    $priceLte: Float,
    $sortBy: String
  ) {
    products(
      category_id: [$categoryId],
      q: $search,
      after: $cursor,
      first: $limit,
      offset: $offset
    ) {
      edges {
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductsByCategory(
    $categoryHandle: String!,
    $search: String,
    $cursor: String,
    $limit: Int = 20,
    $sortBy: String
  ) {
    products(
      category_id: [$categoryHandle],
      q: $search,
      after: $cursor,
      first: $limit
    ) {
      edges {
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const CATEGORIES_QUERY = `
  query Categories {
    productCategories {
      id
      name
      handle
      description
      parentCategory { id name handle }
      children { id name handle }
    }
  }
`;

export const CATEGORY_BY_HANDLE_QUERY = `
  query CategoryByHandle($handle: String!) {
    productCategory(handle: $handle) {
      id
      name
      handle
      description
      parentCategory { id name handle }
      children { id name handle }
    }
  }
`;
