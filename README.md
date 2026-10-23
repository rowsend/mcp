# Rowsend MCP server

[Rowsend](https://rowsend.com) is a desktop app for marketing email. It reads contacts from your own database (Postgres on Supabase or Neon, MySQL, PlanetScale, MongoDB or Firebase Auth) and sends through your own provider (SES, Postmark, Mailgun or SMTP). Contacts and keys stay on your computer.

This package connects an MCP client such as Claude Desktop, Cursor or Claude Code to the Rowsend app. Agents can connect your database, write campaigns in your brand, preview them and send you a test. You click Send in the app.

## Requirements

- macOS, with Rowsend installed in Applications. [Download it from rowsend.com](https://rowsend.com).
- Node.js 18 or later.

## Install

Claude Desktop, Cursor or any client with an `mcpServers` setting:

```json
{
  "mcpServers": {
    "rowsend": { "command": "npx", "args": ["-y", "@rowsend/mcp"] }
  }
}
```

Claude Code:

```bash
claude mcp add rowsend -- npx -y @rowsend/mcp
```

## Plugins for Claude Code and Codex

The plugin adds the MCP server and a `rowsend-setup` skill. The skill walks your agent through connecting your database and sender and drafting a first campaign.

Claude Code:

```bash
claude plugin marketplace add rowsend/mcp
claude plugin install rowsend@rowsend
```

Codex:

```bash
codex plugin marketplace add rowsend/mcp
codex plugin add rowsend@rowsend
```

The first time the client connects, Rowsend asks you to allow it. Click **Allow**. Rowsend keeps that client's token encrypted on your computer, so it asks only once. To cut a client off, revoke it in Rowsend → Settings → MCP.

If Rowsend is somewhere other than Applications, set `ROWSEND_APP` to its path, such as `/Users/you/Apps/Rowsend.app`.

## What agents can do

| Area | Tools |
| --- | --- |
| Projects | `list_projects`, `create_project` |
| Database | `prepare_database_setup`, `complete_database_setup`, `open_database_setup`, `get_pending_setup`, `list_database_fields`, `set_contact_fields`, `get_data_source_status`, `sync_contacts`, `set_sync_interval` |
| Sending setup | `open_sender_setup`, `get_sender`, `verify_sender`, `setup_ses_bounce`, `setup_postmark_webhook`, `set_sending_limits` |
| Contacts | `list_contacts`, `list_segments`, `create_segment`, `preview_audience`, `add_suppression` |
| Topics | `list_topics`, `create_topic` |
| Content | `get_brand`, `list_templates`, `get_template`, `create_template`, `update_template`, `list_images`, `upload_image`, `preview_email` |
| Campaigns | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `duplicate_campaign`, `send_test`, `get_campaign_stats`, `pause_campaign`, `resume_campaign`, `cancel_campaign`, `retry_failures` |

## What agents can't do

- Send or schedule a campaign. Only you can, in the app.
- Delete anything.
- See or type a password or API key. Rowsend opens its own screens for you to paste them.
- Turn off the unsubscribe footer, edit a segment or undo an unsubscribe.

The full guide is at [rowsend.com/docs/agents/mcp](https://rowsend.com/docs/agents/mcp/).

## How it works

Rowsend runs its MCP server inside the app, on `127.0.0.1` only. This package finds the app and starts it with `--mcp-stdio`, which passes messages between your client's stdin and stdout and that local server. If Rowsend isn't running, it opens in the background.

## License

MIT. This license covers this launcher. The Rowsend app has its own [terms](https://rowsend.com/terms).
