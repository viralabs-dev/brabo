---
traducao_de: 7bf8a146ef78bd026afbb4d0c878f43485496bff
---

# ADR 0239 — Local CSP `frame-src` for the deliverable's Web preview

- **Status:** accepted
- **Date:** 2026-11-02
- **Revises:** the CSP of `docker/web/nginx.conf` (inherited from [ADR 0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md)), only where it touches frames.

## Context

AT-685 shows the project's deliverable, running on the user's machine, in an
`iframe` inside Brabo. Without `frame-src`, the CSP falls back to
`default-src 'self'` and the browser blocks the frame.

## Decision

1. The web nginx's CSP gains `frame-src http://localhost:* http://127.0.0.1:*`.
   No `https:` and no external domain.
2. The component only accepts a URL that passes `urlLocalSegura`; an external
   URL is refused and the screen says why in text.
3. The frame's `sandbox` is minimal: `allow-scripts allow-same-origin`. The two
   together are only safe because the frame's origin (`localhost:<port>`)
   differs from Brabo's: the frame reaches neither Brabo's DOM, cookies nor
   storage. `allow-forms`, `allow-popups` and `allow-top-navigation` stay out.
4. `frame-ancestors 'none'` and `X-Frame-Options: DENY` do not change: they
   still forbid OTHERS from framing Brabo.

## Consequences

- Residual risk: the framed local page runs arbitrary code from the user's own
  project, on their machine, with its origin. If Brabo is served on `localhost`
  on the SAME port as the deliverable, the origin exemption disappears; so the
  deliverable cannot take Brabo's port.
- An installation with Brabo on a remote server will see the `iframe` point to
  the browser's `localhost`, not the server's; that is the intended semantics.
