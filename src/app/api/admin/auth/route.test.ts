import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'test1234'
})

describe('POST /api/admin/auth', () => {
  it('returns 200 and sets cookie for correct password', async () => {
    const req = new NextRequest('http://localhost/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ password: 'test1234' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const cookie = res.cookies.get('admin-session')
    expect(cookie?.value).toBe('test1234')
  })

  it('returns 401 for wrong password', async () => {
    const req = new NextRequest('http://localhost/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(res.cookies.get('admin-session')).toBeUndefined()
  })

  it('returns 401 when password field is missing', async () => {
    const req = new NextRequest('http://localhost/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
