import { createBrowserClient } from '@supabase/ssr';

function createMockClient() {
  // Returns a mock object that silently handles all Supabase calls
  const mockPromise = Promise.resolve({ data: null, error: null });

  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    in: () => mockQuery,
    order: () => mockQuery,
    single: () => mockPromise,
    limit: () => mockQuery,
    textSearch: () => mockQuery,
    then: undefined,
  };
  Object.setPrototypeOf(mockQuery, mockPromise);

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa được cấu hình. Dùng tài khoản dùng thử bên dưới.' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa được cấu hình.' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => mockQuery,
    channel: () => ({ on: () => ({ subscribe: () => {} }), unsubscribe: () => {} }),
  } as any;
}

let _client: any = null;

export function createClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key || url.includes('placeholder')) {
    _client = createMockClient();
    return _client;
  }

  _client = createBrowserClient(url, key);
  return _client;
}
