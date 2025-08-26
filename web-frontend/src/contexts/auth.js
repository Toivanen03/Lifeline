import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import config from '../config/config'
import { SetContextLink } from '@apollo/client/link/context'

const httpLink = new HttpLink({ uri: config() + '/graphql' })

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  }
}

const authLink = new SetContextLink((_, { headers }) => {
  const token = localStorage.getItem('parent-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions
})

export default client