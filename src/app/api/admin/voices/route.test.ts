import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () { return { send: mockSend } }),
  GetObjectCommand: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
}))

const { POST } = await import('./route')

const AUTH_COOKIE = 'Cookie: admin-session=test1234'

function makeReq(body: object, withAuth = false) {
  return new NextRequest('http://localhost/api/admin/voices', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(withAuth ? { Cookie: 'admin-session=test1234' } : {}),
    },
  })
}

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'test1234'
  process.env.ADMIN_S3_BUCKET = 'test-bucket'
  process.env.ADMIN_AWS_REGION = 'ap-northeast-1'
  process.env.ADMIN_AWS_ACCESS_KEY_ID = 'AKIATEST'
  process.env.ADMIN_AWS_SECRET_ACCESS_KEY = 'secret'
  vi.clearAllMocks()
  mockSend.mockReset()
})

describe('POST /api/admin/voices — auth', () => {
  it('returns 401 without session cookie', async () => {
    const res = await POST(makeReq({ action: 'list' }))
    expect(res.status).toBe(401)
  })
})

describe('POST /api/admin/voices — list', () => {
  it('returns empty array when no submissions exist', async () => {
    mockSend.mockResolvedValueOnce({ Contents: [] })
    const res = await POST(makeReq({ action: 'list' }, true))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('returns submissions sorted newest first', async () => {
    const sub1 = { id: 'a', relationship: 'r', comment: 'c1', email: '', submittedAt: '2026-08-01T10:00:00.000Z' }
    const sub2 = { id: 'b', relationship: 'r', comment: 'c2', email: '', submittedAt: '2026-08-02T10:00:00.000Z' }
    mockSend
      .mockResolvedValueOnce({ Contents: [{ Key: 'voices/a.json' }, { Key: 'voices/b.json' }] })
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(sub1)) } })
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(sub2)) } })
    const res = await POST(makeReq({ action: 'list' }, true))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].id).toBe('b')
    expect(body[1].id).toBe('a')
  })
})

describe('POST /api/admin/voices — delete', () => {
  it('calls DeleteObjectCommand with correct key', async () => {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    mockSend.mockResolvedValueOnce({})
    const res = await POST(makeReq({ action: 'delete', id: 'test-id-123' }, true))
    expect(res.status).toBe(200)
    const call = vi.mocked(DeleteObjectCommand).mock.calls[0][0] as { Key: string }
    expect(call.Key).toBe('voices/test-id-123.json')
  })
})

describe('POST /api/admin/voices — publish', () => {
  it('adds voice to content.json, deletes submission file', async () => {
    const { PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const submission = { id: 'sub-1', relationship: '近隣住民', comment: '声です', email: '', submittedAt: '2026-08-01T00:00:00.000Z' }
    const existingContent = { photos: [], videos: [], voices: [] }

    mockSend
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(submission)) } }) // GetObject submission
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(existingContent)) } }) // GetObject content.json
      .mockResolvedValueOnce({}) // PutObject content.json
      .mockResolvedValueOnce({}) // DeleteObject submission

    const res = await POST(makeReq({ action: 'publish', id: 'sub-1', attr: '40代・近隣住民' }, true))
    expect(res.status).toBe(200)

    const putCall = vi.mocked(PutObjectCommand).mock.calls[0][0] as { Key: string; Body: string }
    expect(putCall.Key).toBe('content.json')
    const saved = JSON.parse(putCall.Body)
    expect(saved.voices).toHaveLength(1)
    expect(saved.voices[0].comment).toBe('声です')
    expect(saved.voices[0].attr).toBe('40代・近隣住民')

    const delCall = vi.mocked(DeleteObjectCommand).mock.calls[0][0] as { Key: string }
    expect(delCall.Key).toBe('voices/sub-1.json')
  })

  it('falls back to relationship when attr is empty', async () => {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const submission = { id: 'sub-2', relationship: '近隣住民', comment: '声です', email: '', submittedAt: '2026-08-01T00:00:00.000Z' }
    const existingContent = { photos: [], videos: [], voices: [] }

    mockSend
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(submission)) } })
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(existingContent)) } })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})

    await POST(makeReq({ action: 'publish', id: 'sub-2', attr: '' }, true))
    const putCall = vi.mocked(PutObjectCommand).mock.calls[0][0] as { Body: string }
    const saved = JSON.parse(putCall.Body)
    expect(saved.voices[0].attr).toBe('近隣住民')
  })
})

describe('POST /api/admin/voices — unpublish', () => {
  it('removes voice from content.json by id', async () => {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const existingContent = {
      photos: [], videos: [],
      voices: [
        { id: 'v1', comment: 'aaa', attr: 'xxx', publishedAt: '2026-08-01T00:00:00.000Z' },
        { id: 'v2', comment: 'bbb', attr: 'yyy', publishedAt: '2026-08-01T00:00:00.000Z' },
      ],
    }
    mockSend
      .mockResolvedValueOnce({ Body: { transformToString: () => Promise.resolve(JSON.stringify(existingContent)) } })
      .mockResolvedValueOnce({})

    const res = await POST(makeReq({ action: 'unpublish', id: 'v1' }, true))
    expect(res.status).toBe(200)
    const putCall = vi.mocked(PutObjectCommand).mock.calls[0][0] as { Body: string }
    const saved = JSON.parse(putCall.Body)
    expect(saved.voices).toHaveLength(1)
    expect(saved.voices[0].id).toBe('v2')
  })
})

describe('POST /api/admin/voices — unknown action', () => {
  it('returns 400', async () => {
    const res = await POST(makeReq({ action: 'bogus' }, true))
    expect(res.status).toBe(400)
  })
})
