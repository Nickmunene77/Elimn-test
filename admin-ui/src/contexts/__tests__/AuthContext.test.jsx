import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Test component that uses the auth context
function TestComponent() {
  const { isAuthenticated, user } = useAuth()
  return (
    <div>
      <span data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="user-role">{user?.role}</span>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  test('loads user from localStorage', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN')
  })
})