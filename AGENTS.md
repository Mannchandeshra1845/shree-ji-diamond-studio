<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Catalog lives in the `products` table (read via `productsQuery` in src/lib/products.ts, preloaded in the root loader); built-in photos are stored as `asset:<name>` keys so bundled images still resolve.
- Cart/wishlist stay in src/lib/store.ts (localStorage) so shoppers need no account.
- Orders are created only by the `placeOrder` server function, which re-reads prices from the database so customers cannot change totals; the customer then sends the order text to the store's WhatsApp (number in `store_settings`).
- Admin access is the `admin` row in `user_roles` (auto-assigned to the owner email on confirmed sign-in); /admin is client-only and all admin data is protected by RLS.
- Product photos live in a private bucket (public buckets are blocked by workspace policy), so uploads store a 10-year signed link.
