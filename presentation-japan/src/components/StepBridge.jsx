import { useSteps } from 'spectacle';

export default function StepBridge({ count, children }) {
  const { step: rawStep, placeholder } = useSteps(count);
  // Spectacle exposes user-facing steps starting at 1; sequences use a 0-based index.
  const step = Math.max(0, (rawStep ?? 1) - 1);
  return (
    <>
      {placeholder}
      {children(step)}
    </>
  );
}
