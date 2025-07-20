"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import StepOneCapture from "@/components/report-issue/step-one-capture"
import StepTwoUploadImage from "@/components/report-issue/step-two-upload-image"
import StepThreeAnalyzing from "@/components/report-issue/step-three-analyzing"
import StepFourReview from "@/components/report-issue/step-four-review"
import StepFiveSummary from "@/components/report-issue/step-five-summary"
import { useRouter } from "next/navigation"

export default function ReportIssuePage() {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const router = useRouter();
  
  const handleSubmit = () => {
    router.push('/dashboard');
  }

  const nextStep = () => {
    if (step < 5) {
      setStep((prev) => prev + 1)
      setProgress((prev) => prev + 20)
    }
  }

  const goToStep = (stepNumber: number) => {
    setStep(stepNumber)
    setProgress(stepNumber * 20)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Quick Report Progress</h2>
          <span className="text-sm text-gray-400">Step {step} of 4</span>
        </div>
        <Progress value={progress} className="w-full h-2 bg-gray-700" />
      </div>

      <div className="flex items-center justify-center">
        {step === 1 && <StepOneCapture onNext={nextStep} />}
        {step === 2 && (
          <StepTwoUploadImage
            onNext={(file: File) => {
              setUploadedImage(file)
              nextStep()
            }}
          />
        )}
        {step === 3 && <StepThreeAnalyzing onAnalysisComplete={nextStep} image={uploadedImage} />}
        {step === 4 && <StepFourReview onNext={nextStep} />}
        {step === 5 && <StepFiveSummary onSubmit={handleSubmit} />}
      </div>
    </div>
  )
}
