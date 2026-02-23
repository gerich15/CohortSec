import { useCallback, useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { completeOnboarding, getOnboardingStatus } from "../api/client";
import { useLocale } from "../hooks/useLocale";

function useOnboardingSteps(): Step[] {
  const { t } = useLocale();
  return [
    { target: "body", content: t("onboarding.welcome"), placement: "center", disableBeacon: true },
    { target: '[data-tour="check-security"]', content: t("onboarding.check_security"), placement: "bottom" },
    { target: '[data-tour="security-score"]', content: t("onboarding.security_score"), placement: "top" },
    { target: '[data-tour="family"]', content: t("onboarding.family"), placement: "top" },
    { target: '[data-tour="backup"]', content: t("onboarding.backup"), placement: "top" },
  ];
}

interface OnboardingTourProps {
  run: boolean;
}

export default function OnboardingTour({ run }: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(false);
  const steps = useOnboardingSteps();

  useEffect(() => {
    if (!run) return;
    getOnboardingStatus()
      .then((r) => { if (!r.data.tour_completed) setRunTour(true); })
      .catch(() => setRunTour(false));
  }, [run]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setRunTour(false);
      completeOnboarding().catch(() => {});
    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{ back: "Назад", close: "Закрыть", last: "Готово", next: "Далее", skip: "Пропустить" }}
      styles={{ options: { primaryColor: "#3B82F6", zIndex: 10000 } }}
    />
  );
}
