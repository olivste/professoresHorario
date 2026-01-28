import type { NextApiRequest, NextApiResponse } from 'next'

const TARGET = process.env.API_REWRITE_TARGET || 'http://api:8000'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const path = (req.query.path as string[] || []).join('/')
    const originalUrl = req.url || ''
    const hasTrailingSlash = originalUrl.split('?')[0].endsWith('/')
    const search = originalUrl.includes('?') ? originalUrl.slice(originalUrl.indexOf('?')) : ''
    const targetPath = hasTrailingSlash ? `${path}/` : path
    const url = `${TARGET}/${targetPath}${search}`

    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && !['host'].includes(key)) {
        headers[key] = value
      }
    }

    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)),
      redirect: 'follow',
    })

    const text = await upstream.text()
    res.status(upstream.status)
    upstream.headers.forEach((value, key) => {
      if (!['set-cookie', 'transfer-encoding'].includes(key)) {
        res.setHeader(key, value)
      }
    })
    res.send(text)
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Proxy error' })
  }
}
