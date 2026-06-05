/**
 * LeadForm — the conversion centerpiece (Preact island).
 *
 * - Client-side validation (required: name, business, email).
 * - Optional fields never block submission.
 * - Preselects the "interested plan" from the URL (?plan=growth) or from a
 *   click on any pricing CTA carrying `data-plan` — so "Grow my business"
 *   lands here with Growth chosen.
 * - Delivers via lib/leads.ts (Discord webhook today; swappable channel).
 * - Animated, reassuring success state.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import { submitLead, type Lead } from '../../lib/leads';
import { pricingTiers, type PlanId } from '../../lib/content';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Partial<Record<'name' | 'business' | 'email', string>>;

const PLAN_OPTIONS: { id: PlanId; label: string }[] = pricingTiers.map((t) => ({
  id: t.id,
  label: t.name.replace('Brand ', ''),
}));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(lead: Lead): Errors {
  const e: Errors = {};
  if (!lead.name.trim()) e.name = 'Please enter your name.';
  if (!lead.business.trim()) e.business = 'Please enter your business name.';
  if (!lead.email.trim()) e.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(lead.email)) e.email = 'That email looks off — mind checking it?';
  return e;
}

const empty: Lead = { name: '', business: '', phone: '', email: '', plan: '', message: '' };

export default function LeadForm() {
  const [lead, setLead] = useState<Lead>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Lead>(key: K, value: Lead[K]) =>
    setLead((prev) => ({ ...prev, [key]: value }));

  // Preselect plan from ?plan= and from any pricing CTA carrying data-plan.
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('plan');
    if (fromUrl && PLAN_OPTIONS.some((p) => p.id === fromUrl)) set('plan', fromUrl as PlanId);

    const onPlanClick = (e: Event) => {
      const el = (e.target as HTMLElement).closest('[data-plan]');
      const plan = el?.getAttribute('data-plan');
      if (plan && PLAN_OPTIONS.some((p) => p.id === plan)) set('plan', plan as PlanId);
    };
    document.addEventListener('click', onPlanClick);
    return () => document.removeEventListener('click', onPlanClick);
  }, []);

  async function onSubmit(e: Event) {
    e.preventDefault();
    const found = validate(lead);
    setErrors(found);
    if (Object.keys(found).length) {
      // Focus the first invalid field for keyboard + screen-reader users.
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus('submitting');
    try {
      await submitLead(lead);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        'Something went wrong sending your message. Please try again, or email us directly.'
      );
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  return (
    <div class="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            class="flex min-h-[28rem] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-bg p-8 text-center"
            role="status"
          >
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-accent/12 text-accent">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <h3 class="text-2xl">You're in good hands.</h3>
            <p class="max-w-sm text-muted">
              Thanks, {lead.name.split(' ')[0] || 'there'} — we’ve got your details and we’ll be in touch within one business day. Talk soon!
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            initial={false}
            exit={{ opacity: 0 }}
            class="flex flex-col gap-4 rounded-3xl border border-border bg-bg p-6 sm:p-8"
            aria-label="Get started — contact form"
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <Field
                label="Your name"
                name="name"
                value={lead.name}
                error={errors.name}
                onInput={(v) => set('name', v)}
                autocomplete="name"
                required
              />
              <Field
                label="Business name"
                name="business"
                value={lead.business}
                error={errors.business}
                onInput={(v) => set('business', v)}
                autocomplete="organization"
                required
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                value={lead.phone}
                onInput={(v) => set('phone', v)}
                autocomplete="tel"
                optional
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={lead.email}
                error={errors.email}
                onInput={(v) => set('email', v)}
                autocomplete="email"
                required
              />
            </div>

            {/* Interested plan — accessible radio group styled as pills. */}
            <fieldset class="flex flex-col gap-2">
              <legend class="mb-1 text-sm font-medium text-ink">
                Interested plan <span class="font-normal text-muted">(optional)</span>
              </legend>
              <div class="flex flex-wrap gap-2">
                {PLAN_OPTIONS.map((opt) => {
                  const active = lead.plan === opt.id;
                  return (
                    <label
                      key={opt.id}
                      class={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-bg text-ink hover:border-ink'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={opt.id}
                        checked={active}
                        onChange={() => set('plan', opt.id)}
                        class="sr-only"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Field
              label="Anything we should know?"
              name="message"
              value={lead.message}
              onInput={(v) => set('message', v)}
              optional
              textarea
            />

            {status === 'error' && (
              <p class="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent-deep" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              class="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--color-accent)_75%,transparent)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-70"
            >
              {status === 'submitting' ? 'Sending…' : 'Get Started'}
            </button>

            <p class="text-center text-xs text-muted">
              No spam, ever. We’ll only use your details to get back to you.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field — labelled input/textarea with inline validation messaging.          */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onInput: (value: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  textarea?: boolean;
  autocomplete?: string;
}

function Field({
  label,
  name,
  value,
  onInput,
  type = 'text',
  error,
  required,
  optional,
  textarea,
  autocomplete,
}: FieldProps) {
  const id = `field-${name}`;
  const errId = `${id}-error`;
  const base =
    'w-full rounded-xl border bg-bg px-4 py-3 text-ink placeholder:text-muted/70 transition-colors focus-visible:outline-none focus-visible:border-accent';
  const border = error ? 'border-accent' : 'border-border';

  return (
    <div class={`flex flex-col gap-1.5 ${textarea ? 'sm:col-span-2' : ''}`}>
      <label for={id} class="text-sm font-medium text-ink">
        {label}{' '}
        {optional && <span class="font-normal text-muted">(optional)</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          rows={4}
          onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
          class={`${base} ${border} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          required={required}
          autocomplete={autocomplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errId : undefined}
          onInput={(e) => onInput((e.target as HTMLInputElement).value)}
          class={`${base} ${border}`}
        />
      )}
      {error && (
        <span id={errId} class="text-xs text-accent-deep">
          {error}
        </span>
      )}
    </div>
  );
}
