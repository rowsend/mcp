# Rowsend plugin

[Rowsend](https://rowsend.com) is a desktop app for marketing email. It reads contacts from your own database (Postgres on Supabase or Neon, MySQL, PlanetScale, MongoDB or Firebase Auth) and sends through your own provider (SES, Postmark, Mailgun or SMTP). This plugin lets your agent set Rowsend up and draft campaigns in it.

## Requirements

- macOS, with Rowsend 1.4.2 or later in Applications. [Download it from rowsend.com](https://rowsend.com).
- Node.js 18 or later.

## What it includes

- **The Rowsend MCP server.** `server/rowsend-mcp.mjs` finds `Rowsend.app` and starts it with `--mcp-stdio`. That connects your agent to the MCP server inside the app, which listens only on `127.0.0.1`. The first time the agent connects, Rowsend asks you to allow it.
- **The `rowsend-setup` skill.** It walks your agent through connecting your database and sender, adding a mailing address and drafting a first campaign.

## What it runs, sends and fetches

- It runs one program: the Rowsend app already installed on your computer. If the app is missing, too old or not on macOS, the launcher prints why and exits.
- The plugin itself sends nothing over the network and fetches nothing. Your agent talks to the app on your own computer.
- The setup skill may ask your agent to download Rowsend from `github.com/rowsend/releases` if it isn't installed, and it tells you before it does.
- Rowsend keeps contacts, campaigns and keys on your computer. Your agent can read contacts and draft campaigns, but it can't send a campaign, delete anything or see passwords and API keys. You click Send in the app.

## Example prompts

- "Set up Rowsend for this project."
- "Draft a campaign announcing our latest release."
- "How did my last campaign do?"

## Privacy and support

- Privacy policy: https://rowsend.com/privacy
- Terms: https://rowsend.com/terms
- Docs: https://rowsend.com/docs/agents/mcp/
- Issues: https://github.com/rowsend/mcp/issues

## License

MIT. This license covers the plugin. The Rowsend app has its own [terms](https://rowsend.com/terms).
