"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle, FileText, Bot } from "lucide-react"

const steps = ["Personal Details", "Document Upload", "Verification", "Approval"]

const FileUploadRow = ({
  label,
  description,
  onFileChange,
  fileName,
  isVerifying,
  isVerified,
  verificationText,
  onVerify,
}: {
  label: string
  description: string
  onFileChange: (file: File | null) => void
  fileName: string | null
  isVerifying?: boolean
  isVerified?: boolean
  verificationText?: string
  onVerify?: () => void
}) => (
  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" /> {label}
        </h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Choose File
            <Input type="file" className="sr-only" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
          </Label>
        </Button>
        {onVerify && (
          <Button size="sm" onClick={onVerify} disabled={!fileName || isVerifying || isVerified}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        )}
      </div>
    </div>
    {fileName && <p className="text-xs text-green-400 mt-2 ml-1">✓ {fileName}</p>}
    {isVerified && verificationText && (
      <div className="mt-2 p-3 rounded-lg bg-green-900/50 border border-green-500/30">
        <p className="text-sm font-semibold text-green-300 flex items-center gap-2">
          <Bot className="h-4 w-4" /> AI Document Analysis
        </p>
        <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
          <CheckCircle className="h-3 w-3" /> {verificationText}
        </p>
      </div>
    )}
  </div>
)

export function AmbulanceRegistrationFlow({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [dlFile, setDlFile] = useState<File | null>(null)
  const [rcFile, setRcFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [isVerifyingRc, setIsVerifyingRc] = useState(false)
  const [isRcVerified, setIsRcVerified] = useState(false)

  const handleVerifyRc = () => {
    if (!rcFile) return
    setIsVerifyingRc(true)
    setTimeout(() => {
      setIsVerifyingRc(false)
      setIsRcVerified(true)
    }, 2500)
  }

  const handleSubmitForVerification = () => {
    setStep(3) // Move to verification step
    setTimeout(() => {
      setStep(4) // Move to approval step
      setTimeout(() => {
        onComplete() // Final completion
      }, 2000)
    }, 2000)
  }

  return (
    <Card className="bg-[#111113] border-gray-800 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Ambulance Registration</CardTitle>
        <CardDescription>Complete your ambulance service registration.</CardDescription>
        <div className="flex items-center justify-between pt-4">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-grow">
              <div className="flex items-center w-full">
                <div
                  className={`h-1 w-full ${step > i + 1 ? "bg-blue-500" : "bg-gray-700"} ${i === 0 ? "opacity-0" : ""}`}
                ></div>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > i ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step > i ? "✓" : i + 1}
                </div>
                <div
                  className={`h-1 w-full ${
                    step > i ? "bg-blue-500" : "bg-gray-700"
                  } ${i === steps.length - 1 ? "opacity-0" : ""}`}
                ></div>
              </div>
              <p className={`text-xs mt-2 ${step >= i + 1 ? "text-white" : "text-gray-500"}`}>{s}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal & Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="dlNumber">Driving License Number</Label>
                <Input id="dlNumber" placeholder="DL-XX-XXXXXXXXXX" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vehicleReg">Vehicle Registration</Label>
                <Input id="vehicleReg" placeholder="KA-XX-XXXX" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hospital">Hospital/Organization</Label>
                <Input id="hospital" placeholder="Hospital Name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)}>Continue to Document Upload</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Document Upload</h3>
            <FileUploadRow
              label="Driving License"
              description="Upload a clear photo of your driving license"
              onFileChange={setDlFile}
              fileName={dlFile?.name || null}
            />
            <FileUploadRow
              label="Vehicle Registration Certificate"
              description="Upload your ambulance vehicle RC for AI verification"
              onFileChange={setRcFile}
              fileName={rcFile?.name || null}
              onVerify={handleVerifyRc}
              isVerifying={isVerifyingRc}
              isVerified={isRcVerified}
              verificationText="Vehicle Type: AMBULANCE (95% confidence)"
            />
            <FileUploadRow
              label="Hospital Affiliation Certificate"
              description="Upload certificate from your hospital/organization"
              onFileChange={setCertFile}
              fileName={certFile?.name || null}
            />
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmitForVerification} disabled={!dlFile || !rcFile || !certFile || !isRcVerified}>
                Submit for Verification
              </Button>
            </div>
          </div>
        )}
        {(step === 3 || step === 4) && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold">
              {step === 3 ? "Submitting for Verification..." : "Finalizing Approval..."}
            </h3>
            <p className="text-gray-400">Please wait while we process your application.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
