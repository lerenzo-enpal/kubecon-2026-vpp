import { useContext } from 'react';
import { SlideContext } from 'spectacle';

export default function LazyContent({ children }) {
  const slideContext = useContext(SlideContext);
  if (!slideContext?.isSlideActive) return null;
  return <>{children}</>;
}
