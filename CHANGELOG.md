# Changelog

All notable changes to the **Sukuu Mu** school management platform will be documented in this file.

## [1.0.0] - Full Backend API integration into the frontend

### Added
- **Password Visibility Toggle**: Integrated an interactive `<Eye />` and `<EyeOff />` toggle directly into the main `login` user interface input for revealing/hiding password characters properly during authentication attempts.
- **Server Logging Improvements**: Greatly enhanced the Node.js Express server backend's `logger.middleware.js` to visibly output consistent, readable ANSI color-coded system event streams for incoming traffic metrics. Included specific parameters for `HTTP method status code formatting`, `Response processing duration`, and `Client request IPs`.

### Changed
- **Client Session Persistence Migration**: Fully refactored `@/lib/auth-context.tsx` and underlying state hooks. Token persistence has been explicitly hard-shifted from `localStorage` to the far stricter `sessionStorage` scope.
- **API Authentication Flow**: Eradicated persisted local user caching dependencies limiting session security validation. Standardized `auth-context.tsx` application setups to natively pull fully verified user records synchronously from the backend's `/auth/me` on every reload occurrence instead of relying purely on UI memory states.
- **Backend Login Verification Extensibility**: Broadened Express API configurations allowing authenticating operators (including the `System Administrator`) the capability to log in not exclusively requiring explicit column `email` address formulations, but optionally matching directly against raw configured username strings by remapping the backend to query `u.email = ? OR u.name = ?`. 
- **CORS API Adjustments**: Refactored `express-cors` placement directly proceeding standard system preflight implementations inside backend initialization, permitting completely separated Next.JS frontend frameworks to bypass native Helmet browser origin blocks automatically on standard HTTP requests.

### Fixed
- **Order Loading Race Conditions (TypeScript Error)**: Discovered critical NextJS crash sequence throwing `TypeError: Cannot read properties of undefined (reading 'reduce')` tied specifically to missing UI properties inside the `useClasses()` and `useSubjects()` data models rendering loop. Initialized fallback logic onto UI computations guarding cached metrics preventing frontend crash loops.
- **Type Mismatch Inaccuracies**: Safely rewired numerical mismatch typings tied to core update parameters natively mapped on the `Teacher` and `Class` interfaces. Resolved specific issues concerning:
  - Teacher forms explicitly requiring array formulations of `subjectIds`.
  - Class instances lacking standard structured `code`, `level`, `capacity` parameters on post.
  - Active toggle identifiers mapping against raw numbers instead of null strings properly inside `app\dashboard\classes\page.tsx`.
- **Global Logout Infinite Recursion Redirection Bugs**: Re-orchestrated HTTP-level token expiration intercepts from standard `api-client` endpoints avoiding strict `window.location.href = '/login'` hard browser page reloads previously locking API users out of the native un-mounted NextJS client router state sequences. Explicitly implemented dispatching standard react-query `cache clear()` commands preventing lingering, in-flight token verification components kicking off race conditions immediately after user log out sequences.
- **Database Password Consistency Sync Bugs**: Isolated mismatched bcrypt hash states embedded manually into the system during stale seeding workflows preventing matching configurations derived from current dot-environment standard credentials. Re-processed internal SQL table data forcing database alignments to perfectly coordinate the expected backend seed `Admin@2026!` configurations seamlessly.
