import { useEffect, useRef, useState } from "react"

// Utility: build a single Connect HTTP-streaming frame (no compression)
function buildConnectFrame(jsonObj: unknown): Uint8Array {
  const encoder = new TextEncoder()
  const jsonBytes = encoder.encode(JSON.stringify(jsonObj))
  const header = new Uint8Array(5)
  header[0] = 0 // compression = 0 (none)
  const len = jsonBytes.length
  header[1] = (len >>> 24) & 0xff
  header[2] = (len >>> 16) & 0xff
  header[3] = (len >>> 8) & 0xff
  header[4] = len & 0xff

  const body = new Uint8Array(header.length + jsonBytes.length)
  body.set(header)
  body.set(jsonBytes, header.length)
  return body
}

/**
 * useSummaryStream opens a streaming POST to the Connect-Go endpoint using the
 * Connect-JSON protocol (framed JSON messages). This avoids all grpc-web
 * content-type quirks.
 */
export function useSummaryStream(
  lat: number,
  long: number,
  areas: string[] = [],
) {
  const [summary, setSummary] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Wait until we have at least one area before opening the stream
    if (!areas || areas.length === 0) {
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    const endpoint =
      (process.env.NEXT_PUBLIC_GRPC_HOST || "http://localhost:8080") +
      "/summary.v1.SummaryService/StreamSummary"

    const frame = buildConnectFrame({ lat, long, areas })
    const reqBody = frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength) as ArrayBuffer

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/connect+json; charset=utf-8",
        Accept: "application/connect+json; charset=utf-8",
      },
      body: reqBody,
      signal: controller.signal,
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        if (!resp.body) throw new Error("No response body")

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buf = new Uint8Array()

        const readChunk = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) return
            // concat
            const tmp = new Uint8Array(buf.length + value.length)
            tmp.set(buf)
            tmp.set(value, buf.length)
            buf = tmp

            let offset = 0
            while (buf.length >= offset + 5) {
              const msgLen =
                (buf[offset + 1] << 24) |
                (buf[offset + 2] << 16) |
                (buf[offset + 3] << 8) |
                buf[offset + 4]
              if (buf.length >= offset + 5 + msgLen) {
                const msgBytes = buf.slice(offset + 5, offset + 5 + msgLen)
                offset += 5 + msgLen
                const text = decoder.decode(msgBytes)
                try {
                  const json = JSON.parse(text)
                  if (json.summary) {
                    setSummary(json.summary as string)
                  }
                } catch (e) {
                  console.warn("Invalid JSON frame", e)
                }
              } else {
                break
              }
            }
            buf = buf.slice(offset)
            readChunk()
          })
        }

        readChunk()
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        console.error("Summary stream error", err)
      })

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, long, JSON.stringify(areas)])

  return summary
} 