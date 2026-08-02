import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () { return { send: mockSend } }),
  GetObjectCommand: vi.fn(),
  PutObjectCommand: vi.fn(),
}))

const { POST } = await import('./route')

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'test1234'
  process.env.ADMIN_S3_BUCKET = 'test-bucket'
  process.env.ADMIN_AWS_REGION = 'ap-northeast-1'
  process.env.ADMIN_AWS_ACCESS_KEY_ID = 'AKIATEST'
  process.env.ADMIN_AWS_SECRET_ACCESS_KEY = 'secret'
  mockSend.mockReset()
})

describe('POST /api/admin/content', () => {
  it('returns 401 for read action without auth', async () => {
    const req = new NextRequest('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ action: 'read' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 for write action without auth', async () => {
    const req = new NextRequest('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ action: 'write', content: { photos: [], videos: [] } }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 with content for read action with valid session', async () => {
    const fakeContent = { photos: [{ id: '1' }], videos: [] }
    mockSend.mockResolvedValueOnce({
      Body: { transformToString: () => Promise.resolve(JSON.stringify(fakeContent)) },
    })
    const req = new NextRequest('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ action: 'read' }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'admin-session=test1234',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(fakeContent)
  })

  it('returns 200 ok:true for write action with valid session', async () => {
    mockSend.mockResolvedValueOnce({})
    const req = new NextRequest('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ action: 'write', content: { photos: [], videos: [] } }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'admin-session=test1234',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
  })
})
