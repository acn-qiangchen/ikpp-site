import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () { return { send: vi.fn() } }),
  PutObjectCommand: vi.fn(),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3-presigned-url'),
}))

const { POST } = await import('./route')

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'test1234'
  process.env.ADMIN_S3_BUCKET = 'test-bucket'
  process.env.ADMIN_AWS_REGION = 'ap-northeast-1'
  process.env.ADMIN_AWS_ACCESS_KEY_ID = 'AKIATEST'
  process.env.ADMIN_AWS_SECRET_ACCESS_KEY = 'secret'
  process.env.ADMIN_SITE_URL = 'https://example.com'
})

describe('POST /api/admin/upload-url', () => {
  it('returns 401 without session cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename: 'photo.jpg', contentType: 'image/jpeg' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when filename is missing', async () => {
    const req = new NextRequest('http://localhost/api/admin/upload-url', {
      method: 'POST',
      body: JSON.stringify({ contentType: 'image/jpeg' }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'admin-session=test1234',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with url and key for valid inputs', async () => {
    const req = new NextRequest('http://localhost/api/admin/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename: 'photo.jpg', contentType: 'image/jpeg' }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'admin-session=test1234',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://s3-presigned-url')
    expect(body.key).toBe('media/photo.jpg')
  })
})
