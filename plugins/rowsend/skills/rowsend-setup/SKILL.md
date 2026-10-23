---
name: rowsend-setup
description: Set up Rowsend, a desktop app for marketing email, for the person you work with. Connects their own database and email provider, then drafts a first campaign. Use when they want to email their product's users, send a newsletter or product update, or set up or check Rowsend.
---

You're setting up Rowsend for the person you're working with. Rowsend is a desktop app for marketing email. It reads contacts from the person's own database and sends through their own email provider. By the end, the person has a project with their contacts synced, a sender set up and a draft campaign waiting for them to review.

## Rules

- **Never ask for, read, type or store a password, API key, token or private key.** The person types those into Rowsend themselves. Rowsend's tools never return them, and you don't need them.
- **Never send a campaign.** You can't. You draft it, send the person a test, and they click Send in the app when they're ready.
- **Stop and wait when a step needs the person.** Tell them exactly what to do and where, then wait for them to say it's done before you check.
- **Report only what you checked.** If a step fails or the person skips it, say so plainly and carry on with the steps that don't depend on it.
- **Each step starts with a check.** If you run this again, skip whatever is already done.

## 1. Reach Rowsend

This plugin connects you to Rowsend's MCP server. Check: call `list_projects`. If it works, skip to step 2.

If Rowsend's tools are missing or return an error, the error says why. Work through these in order:

- **Not a Mac.** Rowsend runs on macOS only. Tell the person and stop.
- **Rowsend isn't installed.** Check `/Applications/Rowsend.app`. If it's missing, ask the person to download Rowsend from https://rowsend.com, drag it into Applications and open it. Wait for them to say it's done. Rowsend opens with a free trial and needs no card or account.
- **Rowsend is too old.** It needs version 1.4.2 or later. Ask the person to update it in **Rowsend → Settings → Updates**.
- **Rowsend asked to allow this app.** The first time you connect, Rowsend asks the person to allow it. If they missed it or clicked Deny, ask them to watch for the dialog.

After any of these, the person has to restart you so the MCP server connects again. Tell them how, and ask them to say "continue" when you're back:

| You run in  | How to restart                                                |
| ----------- | ------------------------------------------------------------- |
| Claude Code | Type `/exit`, then run `claude --continue` in the same folder |
| Codex CLI   | Quit, then run `codex resume`                                 |

Then call `list_projects`. If it works, you're connected.

## 2. Create a project

A project is one product or brand, with its own database, sender, contacts and campaigns.

Check: `list_projects`. If the person's product is already there, use its id.

Otherwise ask the person what the product is called and call `create_project` with that name. If the person clicked **Let my agent set it up** in Rowsend, the app is waiting for exactly this and opens the project as soon as you create it.

Then call `get_setup_status`. It lists what the project still needs before its first send, the same steps the app's **Get started** page shows, where the person watches each one tick off. Call it again after each step below. A step with `needsPerson: true` is one only the person can finish; its `how` says where.

## 3. Connect their database

Contacts come only from the person's own database: the users who signed up for their product. Rowsend reads it with a read-only login and never writes to it. There is no CSV import.

Check: `get_data_source_status`. If `connected` is true, skip to step 4.

Find out where their users live. Look at the project you're working in (an ORM schema, `.env` names, a `supabase/` folder) and ask the person if it isn't clear. Then follow one path.

**Supabase, Postgres, MySQL or MariaDB.** You can do this one end to end.

1. Read the database's schema with your own tools (Supabase's MCP server, a Postgres MCP server, the project's migrations or ORM schema) and find the table with the users' emails.
2. Call `prepare_database_setup` with `platform`, the `connectionString` (or a Supabase `projectRef` and `region`) and a `mapping` that picks the table and its id, email and last-updated columns, plus any columns worth personalizing with, such as name or plan. The password in the connection string is ignored, so use a placeholder rather than the real one.
3. Run the `setupSql` it returns against the database: with `execute_sql` from Supabase's MCP server, or another database tool you have. If you have none, give the person the SQL and the `sqlEditorUrl`, and wait while they run it.
4. Call `complete_database_setup`.

**Neon, PlanetScale, MongoDB or Firebase.** These need a read-only login the person creates, so they paste it into Rowsend and you take over after that.

1. Call `open_database_setup` with the `platform`. Rowsend opens the connect dialog with steps for creating the login.
2. Tell the person to follow those steps and paste the connection string (or choose the Firebase key file) into the dialog. Wait for them.
3. Call `get_pending_setup`. For Neon or PlanetScale it returns `setupSql`, which creates the view Rowsend reads; change what it reads with `prepare_database_setup` and a `mapping`, then run the SQL with Neon's or PlanetScale's MCP server if you have one, or ask the person to run it. For MongoDB, look at the `tables` and `suggestedMapping`.
4. Call `complete_database_setup`, with a `mapping` for MongoDB or a `profile` for Firebase if you want Firestore fields.

Then check `get_data_source_status` until `sync.state` is no longer `running`, and confirm `contactCount` looks right to the person. If it's an error, read the message: it says what to fix.

## 4. Choose where sending runs

Check: the `companion` step in `get_setup_status` is done. If so, skip to step 5.

The person picks this on the **Get started** page, and you can't. Explain the three choices in a sentence each, then ask them to pick one:

- **This computer**: free, nothing to set up. Recipients can't open unsubscribe links and SMTP bounces aren't caught, so it suits trying Rowsend out.
- **Rowsend Cloud**: working unsubscribe links, bounce tracking and image hosting, with no server to run. It's a paid plan (a license comes with a free month), and the step stays open until the account has its free month or a subscription.
- **Their own server**: the same as Cloud, on a server they run.

Setting up the sender waits for this, because SES bounce tracking and the Postmark webhook depend on it.

## 5. Set up sending

Rowsend sends through the person's own provider: Amazon SES, Postmark, Mailgun or any SMTP server.

Check: `get_sender`. If it has a `verifiedAt`, skip to step 6.

1. Ask the person which provider they use and the address mail should come from. If they have none, suggest one and let them sign up themselves.
2. Call `open_sender_setup` with a `prefill` of what you know that isn't secret: the provider, from name and address, and the SES region, Postmark message stream, Mailgun domain or SMTP host.
3. Tell the person to type the key, token or password into Rowsend and save. Wait for them, then poll `get_sender` until it shows the secret is saved.
4. Call `verify_sender`. For SES, also call `setup_ses_bounce` so bounces and complaints are recorded.

If verification fails, show the person the message. It usually means the domain or address isn't verified with the provider yet.

## 6. Add a mailing address

Check: the `brand` step in `get_setup_status` is done. If so, skip to step 7.

Marketing email needs a postal address by law in the US and Canada, and Rowsend won't send without one. Ask the person to add it in **Project settings → Brand**. The `brand` step turns done once it's saved.

## 7. Draft a first campaign

Check: `list_campaigns`. If there's already a draft the person wants, use it.

1. Ask the person what to announce, or suggest something from what you know about their product. Keep it short and plain.
2. Pick the audience with `list_segments`, or `create_segment` if they want a subset, and check its size with `preview_audience`.
3. Call `create_campaign`. Personalize with `{{name}}` or any custom field from `list_contacts`. Don't write an unsubscribe footer; Rowsend adds one.
4. Check it with `preview_email` and fix anything it flags.
5. Call `send_test` to the person's own address, and ask them to look at it in their inbox.

Leave it as a draft. The person reviews it in Rowsend and sends or schedules it themselves.

## 8. Report back

Finish with a short summary, one line per step, each marked done, skipped or blocked:

```
Rowsend setup
- Connected:        done
- Project:          done (Acme)
- Database:         done (Supabase, 1,204 contacts)
- Sending runs on:  done (Rowsend Cloud)
- Sender:           blocked (SES domain not verified yet)
- Mailing address:  done
- First campaign:   done (draft "We shipped team workspaces", test sent to you@acme.com)

Next: verify acme.com in SES, then open the draft in Rowsend and click Send.
```

Say what's left for the person to do, if anything, and where to do it.
