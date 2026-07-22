import { useSteps } from 'spectacle';

export default function StepBridge({ count, children }) {
  const { step: rawStep, placeholder } = useSteps(count);
  // Spectacle starts at -1 before the first advance; sequences use a 0-based index.
  const step = Math.max(0, (rawStep ?? -1) + 1);
  return (
    <>
      {placeholder}
      {children(step)}
    </>
  );
}
