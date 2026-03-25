import { useSteps } from 'spectacle';

/**
 * StepBridge — Registers steps with Spectacle so arrow keys work,
 * then passes the current step to children as a render prop.
 *
 * Unlike putting components inside Spectacle's <Stepper>, this
 * doesn't cause remounting — React reconciles the same component
 * tree with updated props.
 *
 * Usage:
 *   <StepBridge count={22}>
 *     {(step) => <TexasMapHUD step={step} />}
 *   </StepBridge>
 */
export default function StepBridge({ count, children }) {
  const { step: rawStep, placeholder } = useSteps(count);
  const step = rawStep + 1;

  return (
    <>
      {placeholder}
      {children(step)}
    </>
  );
}
