'use client';

import { useEffect, useRef } from 'react';

// The open roles, folded under their label (a native disclosure: keyboard,
// screen readers and find in page work as they do everywhere). A link to the
// roles (#roles: "Join the team") opens it, so the reader who asked for the
// roles finds them already open.
export default function RolesDisclosure({ summary, children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const open = () => {
      if (ref.current) ref.current.open = true;
    };
    if (window.location.hash === '#roles') open();
    const onHash = () => {
      if (window.location.hash === '#roles') open();
    };
    const onClick = (event) => {
      if (event.target instanceof Element && event.target.closest('a[href="#roles"]')) open();
    };
    window.addEventListener('hashchange', onHash);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <details ref={ref} className={className}>
      {summary}
      {children}
    </details>
  );
}
