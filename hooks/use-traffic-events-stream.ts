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
 * useTrafficEventsStream opens a streaming POST to the Connect-Go endpoint for
 * TrafficUpdate events using the Connect-JSON protocol. It continuously
 * appends received events to the returned array.
 */
export interface TrafficDigestEntry {
  timestamp: string
  location: string
  summary: string
  severityReason: string   // ← camel-case exactly as it comes off the wire
  delay: string
  advice: string
}

export interface WeatherSummary {
  location: string
  temperature: string
  conditions: string
  precipitation: string
  wind: string
}

export interface StreamTrafficUpdateEventsResponse {
  id: string
  timestamp: number
  bengaluru_traffic_digest: TrafficDigestEntry[]
  location_weather: WeatherSummary[]
}

export function useTrafficEventsStream(
  center: { lat: number, lng: number }
): [TrafficDigestEntry[], WeatherSummary[]] {
  const [trafficEvents, setTrafficEvents] = useState<TrafficDigestEntry[]>([])
  const [weatherEvents, setWeatherEvents] = useState<WeatherSummary[]>([])
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    const endpoint =
      (process.env.NEXT_PUBLIC_GRPC_HOST || "http://localhost:8080") +
      "/trafficupdaterevents.v1.TrafficUpdateEventsService/StreamTrafficUpdateEvents"

    const frame = buildConnectFrame({ })
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
            if (!value) {
              readChunk()
              return
            }
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

                  // ───── CHANGE #1 – use current field names ─────
                  if (json.trafficDigest && Array.isArray(json.trafficDigest)) {
                    setTrafficEvents(prev => [
                      ...prev,
                      ...(json.trafficDigest as TrafficDigestEntry[]),
                    ])
                  }

                  // Alternative snake_case used by backend
                  if (json.bengaluru_traffic_digest && Array.isArray(json.bengaluru_traffic_digest)) {
                    setTrafficEvents(prev => [
                      ...prev,
                      ...(json.bengaluru_traffic_digest as TrafficDigestEntry[]),
                    ])
                  }

                  if (json.bengaluruTrafficDigest && Array.isArray(json.bengaluruTrafficDigest)) {
                    setTrafficEvents(prev => [
                      ...prev,
                      ...(json.bengaluruTrafficDigest as TrafficDigestEntry[]),
                    ])
                  }

                  if (json.weather && Array.isArray(json.weather)) {
                    setWeatherEvents(prev => [
                      ...prev,
                      ...(json.weather as WeatherSummary[]),
                    ])
                  }
                  // Support alternative field names used by backend (locationWeather / location_weather)
                  if (json.locationWeather && Array.isArray(json.locationWeather)) {
                    setWeatherEvents(prev => [
                      ...prev,
                      ...(json.locationWeather as WeatherSummary[]),
                    ])
                  }

                  if (json.location_weather) {
                    let parsed: any = json.location_weather
                    // If the field is a JSON-encoded string, parse it first
                    if (typeof parsed === "string") {
                      try {
                        parsed = JSON.parse(parsed)
                      } catch {
                        // fallback: attempt to convert single quotes to double quotes
                        try {
                          const dbl = parsed.replace(/'/g, '"')
                          parsed = JSON.parse(dbl)
                        } catch {
                          parsed = null
                        }
                      }
                    }
                    if (parsed && Array.isArray(parsed)) {
                      // Some backends nest the summary under `weather_summary`
                      const summaries: WeatherSummary[] = parsed.map((w: any) =>
                        w.weather_summary ?? w.weatherSummary ?? w,
                      )
                      setWeatherEvents(prev => [...prev, ...summaries])
                    }
                  }
                  // ───────────────────────────────────────────────
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
        console.error("Traffic and weather events stream error", err)
      })

    return () => {
      controller.abort()
    }
  }, [center])

  return [trafficEvents, weatherEvents];
} 