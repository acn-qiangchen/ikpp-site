import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'test1234'
})

describe('POST /api/admin/verify', () => {
  it('returns 200 for valid session cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/verify', {
      method: 'POST',
      headers: { Cookie: 'admin-session=test1234' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
  })

  it('returns 401 when no cookie is present', async () => {
    const req = new NextRequest('http://localhost/api/admin/verify', {
      method: 'POST',
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 for wrong cookie value', async () => {
    const req = new NextRequest('http://localhost/api/admin/verify', {
      method: 'POST',
      headers: { Cookie: 'admin-session=badvalue' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
