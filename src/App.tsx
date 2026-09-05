import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { store } from './app/store/store'
import { queryClient } from './app/api/axiosConfig'
import { AuthBootstrap } from './app/components/AuthBootstrap'
import { AppRoutes } from './app/routes'

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>
  )
}

export default App