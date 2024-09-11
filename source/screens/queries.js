// queries.js
import { gql } from '@apollo/client';

export const GET_BOOKS = gql`
  query GetBooks($searchQuery: String) {
    books(searchQuery: $searchQuery) {
      id
      userId
      userName
      title
      author
      edition
      content
      imageURL
    }
  }
`;
