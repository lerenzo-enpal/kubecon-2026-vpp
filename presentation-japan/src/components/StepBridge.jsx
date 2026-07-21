import { useSteps } from 'spectacle';

export default function StepBridge({ count, children }) {
  const { step: rawStep, placeholder } = useSteps(count);
  const step = rawStep ?? 0;
  return (
    <>
      {placeholder}
      {children(step)}
    </>
  );
}
