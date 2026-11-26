import { useNavigation } from 'react-router-dom';

/** Thin top bar shown while a route's code or data is loading. */
export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;

  return (
    <div role="progressbar" aria-label="Loading page" className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-accent/15">
      <div className="animate-progress h-full w-2/5 bg-accent" />
    </div>
  );
}
