"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import StepOneCapture from "@/components/report-issue/step-one-capture"
import StepTwoAnalyzing from "@/components/report-issue/step-two-analyzing"
import StepThreeReview from "@/components/report-issue/step-three-review"
import StepFourSummary from "@/components/report-issue/step-four-summary"

export default function ReportIssuePage() {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)

  const nextStep = () => {
    if (step < 4) {
      setStep((prev) => prev + 1)
      setProgress((prev) => prev + 25)
    }
  }

  const goToStep = (stepNumber: number) => {
    setStep(stepNumber)
    setProgress(stepNumber * 25)
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
        {step === 2 && <StepTwoAnalyzing onAnalysisComplete={nextStep} />}
        {step === 3 && <StepThreeReview onNext={nextStep} />}
        {step === 4 && <StepFourSummary onSubmit={() => alert("Report Submitted!")} />}
      </div>
    </div>
  )
}
