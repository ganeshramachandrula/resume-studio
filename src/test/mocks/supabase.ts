import { vi } from 'vitest'

/**
 * Chainable mock for Supabase query builder.
 * Usage:
 *   const mock = createMockSupabaseClient()
 *   mock.__setQueryResult({ data: [...], error: null })
 *   // Now any chain like mock.from('x').select().eq('id', '1').single() returns the result
 */
export function createMockSupabaseClient() {
  let queryResult: { data: unknown; error: unknown } = { data: null, error: null }
  let rpcResult: { data: unknown; error: unknown } = { data: null, error: null }
  let authUser: { data: { user: unknown }; error: unknown } = {
    data: { user: null },
    error: null,
  }

  const chainable: Record<string, unknown> = {}

  // All chainable methods return the same proxy
  const chainMethods = [
    'from', 'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'in', 'is', 'not', 'or', 'and', 'filter',
    'order', 'limit', 'range', 'maybeSingle',
    'textSearch', 'match', 'contains', 'containedBy',
    'overlaps', 'csv',
  ]

  for (const method of chainMethods) {
    chainable[method] = vi.fn().mockReturnValue(chainable)
  }

  // Terminal methods return the result
  chainable.single = vi.fn().mockImplementation(() => Promise.resolve(queryResult))
  chainable.then = undefined // Make it thenable by default via Promise.resolve

  // Override from to be chainable AND thenable
  const originalFrom = chainable.from
  chainable.from = vi.fn((...args: unknown[]) => {
    ;(originalFrom as (...a: unknown[]) => unknown)(...args)
    // Return a proxy that is both chainable and thenable
    return new Proxy(chainable, {
      get(target, prop) {
        if (prop === 'then') {
          return (resolve: (v: unknown) => void) => resolve(queryResult)
        }
        return target[prop as string]
      },
    })
  })

  chainable.rpc = vi.fn().mockImplementation(() => Promise.resolve(rpcResult))

  chainable.auth = {
    getUser: vi.fn().mockImplementation(() => Promise.resolve(authUser)),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  }

  // Test control methods
  chainable.__setQueryResult = (result: { data: unknown; error: unknown }) => {
    queryResult = result
  }
  chainable.__setRpcResult = (result: { data: unknown; error: unknown }) => {
    rpcResult = result
  }
  chainable.__setAuthUser = (user: unknown, error: unknown = null) => {
    authUser = { data: { user }, error }
  }

  return chainable as Record<string, ReturnType<typeof vi.fn>> & {
    __setQueryResult: (r: { data: unknown; error: unknown }) => void
    __setRpcResult: (r: { data: unknown; error: unknown }) => void
    __setAuthUser: (user: unknown, error?: unknown) => void
    auth: {
      getUser: ReturnType<typeof vi.fn>
      signOut: ReturnType<typeof vi.fn>
      signInWithPassword: ReturnType<typeof vi.fn>
    }
  }
}
