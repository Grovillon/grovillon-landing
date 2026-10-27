'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Arrow from './Arrow';

// An email link that always does something. It stays a plain mailto: link
// (without script, with a modifier key, middle-click or copy-link); a plain
// click opens a small chooser instead: webmail, the mail app, or the address
// copied, under a quiet line that shows the address (and subject) it writes to.
// A computer with no mail app does nothing visible on a bare mailto:.

const GAP = 6; // px between the link and the chooser
const EDGE = 8; // px the chooser keeps from the viewport's edges
const EXIT_MS = 120;
const COPIED_MS = 1500;
const DRIFT = 48; // px the page may scroll under an open chooser before it closes
const GRACE_MS = 150; // scrolling this soon after opening is the tail of the click, not the reader leaving
const QUIET_MS = 100; // without scrollend, a pause this long between scroll events ends a scroll

// Only one chooser is open at a time: opening one closes the one before.
let current = null;

// Whether the page is still carrying a scroll, so a chooser opened mid-scroll (the
// smooth scroll to the roles still settling, a flick) knows the movement is not the
// reader leaving it. The browser's scrollend says when a scroll is over, even across
// a stalled frame; where there is none, a pause of QUIET_MS between scroll events does.
let lastScrollAt = -Infinity;
let scrolling = false;
let watchingScroll = false;
function watchScroll() {
  if (watchingScroll) return;
  watchingScroll = true;
  const onScroll = () => {
    lastScrollAt = performance.now();
    scrolling = true;
  };
  const onScrollEnd = () => {
    scrolling = false;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', onScrollEnd, { passive: true });
}
const reportsScrollEnd = () => 'onscrollend' in window;
const pageMoving = (now) => (reportsScrollEnd() ? scrolling : now - lastScrollAt < QUIET_MS);

const mailto = (address, subject) =>
  subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;

const gmail = (address, subject) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(address)}` +
  (subject ? `&su=${encodeURIComponent(subject)}` : '');

const outlook = (address, subject) =>
  `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(address)}` +
  (subject ? `&subject=${encodeURIComponent(subject)}` : '');

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (an insecure origin, an older browser, or refused): the old way.
  }
  const back = document.activeElement;
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.append(field);
  let done = false;
  try {
    field.focus({ preventScroll: true });
    field.select();
    done = document.execCommand('copy');
  } catch {
    done = false;
  }
  field.remove();
  back?.focus?.({ preventScroll: true });
  return done;
}

// Place the chooser under the link (above it when there is no room below),
// inside the viewport, and let it grow out of the link's side. A link that sets
// --mail-span: row (a role row on a phone) gets a chooser as wide as itself.
// The chooser sits in page coordinates, so it scrolls with its link; the
// offset from the link is returned for follow() to keep.
function place(menu, trigger, align) {
  const r = trigger.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const span = getComputedStyle(trigger).getPropertyValue('--mail-span').trim() === 'row';
  if (span) {
    menu.dataset.span = 'row';
    menu.style.width = `${r.width}px`;
  } else {
    delete menu.dataset.span;
    menu.style.width = '';
  }
  menu.style.left = '0px';
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;

  let side = 'below';
  let top = r.bottom + GAP;
  if (top + h > vh - EDGE) {
    const above = r.top - GAP - h;
    if (above >= EDGE || r.top > vh - r.bottom) {
      side = 'above';
      top = above;
    }
  }
  top = Math.max(EDGE, Math.min(top, vh - EDGE - h));

  let left = span || align !== 'end' ? r.left : r.right - w;
  if (!span && align === 'start' && left + w > vw - EDGE) left = r.right - w;
  if (!span && align === 'end' && left < EDGE) left = r.left;
  left = Math.max(EDGE, Math.min(left, vw - EDGE - w));

  let originX = r.left + r.width / 2 - left;
  if (r.width > w) originX = align === 'end' ? w : 0;
  originX = Math.max(0, Math.min(originX, w));

  const x = Math.round(left + window.scrollX);
  const y = Math.round(top + window.scrollY);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.transformOrigin = `${Math.round(originX)}px ${side === 'below' ? 'top' : 'bottom'}`;
  menu.dataset.side = side;
  return { dx: x - (r.left + window.scrollX), dy: y - (r.top + window.scrollY) };
}

// Keep the chooser where place() put it relative to its link, after the link has
// moved for any reason other than a resize (page scroll alone leaves it as it is).
function follow(menu, trigger, offset) {
  const r = trigger.getBoundingClientRect();
  menu.style.left = `${Math.round(r.left + window.scrollX + offset.dx)}px`;
  menu.style.top = `${Math.round(r.top + window.scrollY + offset.dy)}px`;
}

const menuItems = (menu) => Array.from(menu?.querySelectorAll('[role="menuitem"]') ?? []);

export default function MailLink({ address, subject, align = 'start', className, children }) {
  const href = mailto(address, subject);
  // What the chooser writes to, shown above its choices; cut short with an ellipsis, the address first.
  const note = subject ? `${address} · ${subject}` : address;
  // The menu is named by its link; the line also describes it when it says more than the link does.
  const describes = !(typeof children === 'string' && children.trim() === note);
  const triggerId = useId();
  const menuId = useId();
  const noteId = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const offset = useRef({ dx: 0, dy: 0 });
  const self = useRef({});
  const phase = useRef('closed');
  const timers = useRef({ exit: 0, copied: 0 });
  const copying = useRef(false);
  const [enhanced, setEnhanced] = useState(false);
  const [state, setState] = useState('closed'); // 'open' | 'closing' | 'closed'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEnhanced(true);
    watchScroll();
    const own = self.current;
    const t = timers.current;
    return () => {
      clearTimeout(t.exit);
      clearTimeout(t.copied);
      if (current === own) current = null;
    };
  }, []);

  const close = (restoreFocus) => {
    if (phase.current !== 'open') return;
    phase.current = 'closing';
    if (current === self.current) current = null;
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    setState('closing');
    clearTimeout(timers.current.exit);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    timers.current.exit = setTimeout(() => {
      if (phase.current !== 'closing') return;
      phase.current = 'closed';
      setState('closed');
      setCopied(false);
    }, reduce ? 0 : EXIT_MS);
  };
  self.current.close = close;

  const open = () => {
    if (current && current !== self.current) current.close(false);
    current = self.current;
    clearTimeout(timers.current.exit);
    const reopening = phase.current === 'closing';
    phase.current = 'open';
    setState('open');
    if (reopening) menuItems(menuRef.current)[0]?.focus({ preventScroll: true });
  };

  // Mounting: place it while hidden, then let it transition in, and move focus in.
  useLayoutEffect(() => {
    if (state !== 'open') return;
    const menu = menuRef.current;
    if (!menu || menu.dataset.mounted) return;
    menu.dataset.mounted = '1';
    menu.dataset.state = 'enter';
    offset.current = place(menu, triggerRef.current, align);
    menu.getBoundingClientRect();
    delete menu.dataset.state;
    menuItems(menu)[0]?.focus({ preventScroll: true });
  }, [state, align]);

  // While open: a press elsewhere or focus elsewhere closes it; so does the page
  // scrolling on more than DRIFT px, or its link leaving the viewport. A smaller
  // scroll (a trackpad's jitter) keeps it with its link, and a resize places it anew.
  useEffect(() => {
    if (state !== 'open') return undefined;
    const inside = (node) => menuRef.current?.contains(node) || triggerRef.current?.contains(node);
    const focusInside = () => menuRef.current?.contains(document.activeElement);
    const close = (restoreFocus) => self.current.close(restoreFocus);
    const onPointerDown = (event) => {
      if (!inside(event.target)) close(false);
    };
    const onFocusIn = (event) => {
      if (!copying.current && !inside(event.target)) close(false);
    };

    let frame = 0;
    let replace = false;
    const update = (again) => {
      replace = replace || again;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const menu = menuRef.current;
        const trigger = triggerRef.current;
        if (menu && trigger) {
          if (replace) offset.current = place(menu, trigger, align);
          else follow(menu, trigger, offset.current);
        }
        replace = false;
      });
    };

    // Drift is measured from where the page was when the chooser opened, or, when
    // it opened while the page was still moving (a smooth scroll to the roles
    // settling, a flick), from where the page comes to rest.
    const openedAt = performance.now();
    const ends = reportsScrollEnd();
    let from = window.scrollY;
    let moving = pageMoving(openedAt);
    let lastAt = lastScrollAt;
    const onScroll = () => {
      const now = performance.now();
      if (moving && !ends && now - lastAt > QUIET_MS) moving = false;
      lastAt = now;
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r || r.bottom <= 0 || r.top >= window.innerHeight) {
        close(focusInside());
        return;
      }
      if (moving || now - openedAt < GRACE_MS) from = window.scrollY;
      else if (Math.abs(window.scrollY - from) > DRIFT) {
        close(focusInside());
        return;
      }
      update(false);
    };
    const onScrollEnd = () => {
      moving = false;
    };
    const onResize = () => update(true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('resize', onResize);
    };
  }, [state, align]);

  const onTriggerClick = (event) => {
    if (!enhanced || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (phase.current === 'open') close(true);
    else open();
  };

  const onTriggerKeyDown = (event) => {
    if (!enhanced) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      if (phase.current !== 'open') open();
    } else if (event.key === 'Escape' && phase.current === 'open') {
      event.preventDefault();
      close(true);
    }
  };

  const onMenuKeyDown = (event) => {
    const list = menuItems(menuRef.current);
    const at = list.indexOf(document.activeElement);
    const go = (i) => list[(i + list.length) % list.length]?.focus({ preventScroll: true });
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        go(at + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        go(at < 0 ? -1 : at - 1);
        break;
      case 'Home':
        event.preventDefault();
        go(0);
        break;
      case 'End':
        event.preventDefault();
        go(-1);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Focus goes back to the link first, so Tab carries on from there.
        close(true);
        break;
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        if (at >= 0) list[at].click();
        break;
      default:
    }
  };

  // A mouse moving over an item focuses it, so only one item is ever lit.
  const onItemPointerMove = (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
  };

  const onCopy = async () => {
    copying.current = true;
    const done = await copyText(address);
    copying.current = false;
    if (!done) return;
    setCopied(true);
    clearTimeout(timers.current.copied);
    timers.current.copied = setTimeout(() => setCopied(false), COPIED_MS);
  };

  const leave = () => close(true);
  const item = { role: 'menuitem', tabIndex: -1, className: 'mail-item', onPointerMove: onItemPointerMove };
  const out = { target: '_blank', rel: 'noopener noreferrer', onClick: leave };

  return (
    <>
      <a
        ref={triggerRef}
        id={triggerId}
        href={href}
        className={className}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup={enhanced ? 'menu' : undefined}
        aria-expanded={enhanced ? state === 'open' : undefined}
        aria-controls={state !== 'closed' ? menuId : undefined}
      >
        {children}
      </a>
      {state !== 'closed' &&
        createPortal(
          <>
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              tabIndex={-1}
              aria-labelledby={triggerId}
              aria-describedby={describes ? noteId : undefined}
              className="mail-menu"
              data-state={state === 'closing' ? 'closed' : undefined}
              onKeyDown={onMenuKeyDown}
            >
              <div role="none" id={noteId} className="mail-note" title={note}>
                {note}
              </div>
              <a {...item} {...out} href={gmail(address, subject)}>
                Gmail
                <Arrow direction="out" className="lo-arrow" />
              </a>
              <a {...item} {...out} href={outlook(address, subject)}>
                Outlook
                <Arrow direction="out" className="lo-arrow" />
              </a>
              <a {...item} href={href} onClick={leave}>
                Email app
                <Arrow direction="out" className="lo-arrow" />
              </a>
              <button {...item} type="button" onClick={onCopy} data-copied={copied || undefined}>
                {copied ? 'Copied' : 'Copy address'}
              </button>
            </div>
            <span role="status" className="sr-only">
              {copied ? 'Copied' : ''}
            </span>
          </>,
          document.body,
        )}
    </>
  );
}
