/**
 * leads.ts — lead capture + delivery.
 *
 * The lead form (a Preact island) calls `submitLead()`. Today the only delivery
 * channel is a Discord webhook, configured via the PUBLIC_DISCORD_WEBHOOK_URL
 * env var. The channel is abstracted behind `LeadChannel` so an email/CRM
 * delivery can be added later without touching the form component.
 *
 * NOTE: because the site is fully static (no SSR adapter), the webhook URL is
 * read client-side and is therefore visible in the browser bundle. For
 * production hardening, route this through a serverless function / form proxy
 * and point PUBLIC_DISCORD_WEBHOOK_URL — or a new channel — at that instead.
 */
import type { PlanId } from './content';

export interface Lead {
  name: string;
  business: string;
  phone: string;
  email: string;
  plan: PlanId | '';
  message: string;
}

export interface LeadChannel {
  send(lead: Lead): Promise<void>;
}

const PLAN_LABELS: Record<string, string> = {
  startup: 'Brand Startup ($297 one-time)',
  growth: 'Brand Growth ($197/mo)',
  custom: 'Custom (let’s talk)',
  '': 'Not specified',
};

/** Brand tomato (#F55D3E) as the integer Discord expects for embed color. */
const EMBED_COLOR = 0xf55d3e;

/** Discord delivery: posts a clean branded embed to a channel webhook. */
class DiscordChannel implements LeadChannel {
  constructor(private readonly webhookUrl: string) {}

  async send(lead: Lead): Promise<void> {
    const fields = [
      { name: 'Name', value: lead.name || '—', inline: true },
      { name: 'Phone', value: lead.phone || '—', inline: true },
      { name: 'Email', value: lead.email || '—', inline: false },
      { name: 'Interested plan', value: PLAN_LABELS[lead.plan] ?? lead.plan, inline: false },
      { name: 'Message', value: lead.message?.trim() || '—', inline: false },
    ];

    const payload = {
      username: 'MainStreetLander Leads',
      embeds: [
        {
          title: lead.business || 'New website inquiry',
          description: 'New lead from the website 🎉',
          color: EMBED_COLOR,
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Discord webhook responded ${res.status}`);
    }
  }
}

/**
 * Resolve the active delivery channel from env. Add future channels (email,
 * CRM, server proxy) here behind the same `LeadChannel` interface.
 */
function resolveChannel(): LeadChannel {
  const webhook = import.meta.env.PUBLIC_DISCORD_WEBHOOK_URL as string | undefined;
  if (!webhook) {
    throw new Error(
      'PUBLIC_DISCORD_WEBHOOK_URL is not set. Add it to your .env (see README).'
    );
  }
  return new DiscordChannel(webhook);
}

/** Submit a captured lead through the configured channel. */
export async function submitLead(lead: Lead): Promise<void> {
  const channel = resolveChannel();
  await channel.send(lead);
}
