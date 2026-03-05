import { useEffect } from 'react';

/**
 * Sets the document title.
 * Resets to "LOFIVE" on unmount.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | LOFIVE` : 'LOFIVE';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
