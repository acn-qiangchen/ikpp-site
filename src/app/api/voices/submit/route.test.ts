import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () { return { send: mockSend } }),
  PutObjectCommand: vi.fn(),
}))

const { POST, OPTIONS } = await import('./route')

beforeEach(() => {
  process.env.ADMIN_S3_BUCKET = 'test-bucket'
  process.env.ADMIN_AWS_REGION = 'ap-northeast-1'
  process.env.ADMIN_AWS_ACCESS_KEY_ID = 'AKIATEST'
  process.env.ADMIN_AWS_SECRET_ACCESS_KEY = 'secret'
  process.env.NEXT_PUBLIC_SITE_URL = 'https://ikpp.tink9.com'
  vi.clearAllMocks()
  mockSend.mockResolvedValue({})
})

describe('OPTIONS /api/voices/submit', () => {
  it('returns 204 with CORS headers', async () => {
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://ikpp.tink9.com')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
})

describe('POST /api/voices/submit', () => {
  it('returns 400 when comment is missing', async () => {
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({ relationship: '近隣住民', comment: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 400 when comment is whitespace only', async () => {
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({ comment: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 and writes to S3 with valid data', async () => {
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({
        relationship: '近隣住民',
        comment: 'テストコメント',
        email: 'test@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(mockSend).toHaveBeenCalledOnce()
  })

  it('writes submission file under voices/ prefix', async () => {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({ comment: 'テストコメント' }),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(req)
    const call = vi.mocked(PutObjectCommand).mock.calls[0][0] as { Key: string; Body: string }
    expect(call.Key).toMatch(/^voices\/.+\.json$/)
    const body = JSON.parse(call.Body)
    expect(body.comment).toBe('テストコメント')
    expect(body.id).toBeTruthy()
    expect(body.submittedAt).toBeTruthy()
  })

  it('trims comment before saving', async () => {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({ comment: '  前後の空白  ' }),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(req)
    const call = vi.mocked(PutObjectCommand).mock.calls[0][0] as { Body: string }
    const body = JSON.parse(call.Body)
    expect(body.comment).toBe('前後の空白')
  })

  it('includes CORS header in 200 response', async () => {
    const req = new NextRequest('http://localhost/api/voices/submit', {
      method: 'POST',
      body: JSON.stringify({ comment: 'テスト' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://ikpp.tink9.com')
  })
})
