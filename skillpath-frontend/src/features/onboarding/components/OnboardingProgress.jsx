const steps = ["Welcome", "Career Goal", "Experience", "Review"]

export default function OnboardingProgress({ currentStep }) {
    const precentage = (currentStep / (steps.length - 1)) * 100;

    return (
        <div className="onboarding-progress">
            <div className="onboarding-progress-header">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{steps[currentStep]}</span>
            </div>

            <div
                className="onboarding-progress-track"
                role="progressbar"
                aria-label="Onboarding progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(precentage)}
                >
                    <div style={{ width: `${precentage}%`}}/>
                </div>
        </div>
    )
}