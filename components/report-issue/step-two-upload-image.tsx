"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StepTwoUploadImageProps {
  onNext: (file: File) => void
}

export default function StepTwoUploadImage({ onNext }: StepTwoUploadImageProps) {
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError("Only PNG, JPG, or JPEG files are allowed.")
      setPreview(null)
      return
    }
    if (file.size > 1024 * 1024) {
      setError("File size must be less than 1MB.")
      setPreview(null)
      return
    }
    setError("")
    setPreview(URL.createObjectURL(file))
    onNext(file)
  }

  return (
    <Card className="w-full max-w-md bg-[#1A1A1C] border-gray-700 text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Upload an Image</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 mb-4">Upload a clear photo of the issue (PNG, JPG, JPEG, max 1MB).</p>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
        >
          Choose Image
        </Button>
        {preview && (
          <div className="mb-4 flex justify-center">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg border border-gray-700" />
          </div>
        )}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      </CardContent>
    </Card>
  )
} 