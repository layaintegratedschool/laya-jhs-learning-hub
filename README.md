# Laya JHS Learning Hub — Fresh Setup

Scope: Junior High School only (Grades 7, 8, 9, and 10).

## Important setup order

1. Create a new GitHub repository and upload the website files.
2. Create the administrator account in Supabase Authentication > Users. Use your own email and a strong password.
3. Copy the administrator user's UUID from Authentication > Users.
4. In `supabase/setup.sql`, replace every occurrence of `00000000-0000-0000-0000-000000000000` with that UUID.
5. Run the edited `setup.sql` once in Supabase SQL Editor. Do not run it before replacing the UUID, and do not rerun it unchanged.
6. In `index.html`, replace `REPLACE_WITH_YOUR_SUPABASE_AUTH_USER_ID` with the administrator UUID. The Supabase URL and publishable key are already filled in for the new project.
7. The Edge Function CORS origin is already set to `https://layaintegratedschool.github.io`.
8. Deploy `supabase/functions/get-protected-module/index.ts` as the Edge Function named `get-protected-module`.
9. In Edge Function secrets, ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Never put the service role key in GitHub.
10. Enable GitHub Pages for the repository (Deploy from branch: `main`, folder `/root`).

## Security notes

- The `learning-materials` bucket is private.
- The public catalog contains metadata only; access codes and storage paths are in the private table.
- The Edge Function validates codes and returns a 15-minute signed URL.
- Rate limiting is enforced server-side through `record_module_access_attempt`.
- Replace the admin UUID placeholders in SQL before relying on administrator policies.
- Use a unique administrator password and do not share it.
- A PDF downloaded by an authorized student can be copied. Access codes control access, not DRM.

## Offline notes

The website shell and PDFs previously unlocked on that browser/device are available offline. A PDF must be unlocked while online at least once on each device/browser before it can be opened offline. The current simple shell uses the Supabase JS CDN, so first-time app loading still requires internet; for a fully self-contained offline shell, bundle a pinned Supabase JS build locally before production launch.
