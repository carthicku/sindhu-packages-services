import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
  MapPin,
  PlugZap,
  RotateCcw,
} from 'lucide-react';
import { lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { SceneFallback } from '../components/illustrations/Illustrations';
import { LazyScene } from '../components/three/LazyScene';
import { Button } from '../components/ui/Button';
import { RouteGlyph } from '../components/ui/Section';
import {
  enabledMoveTypes,
  homeSizes,
  moveTypeLabel,
  packingScopes,
  propertyKinds,
  requirementLabels,
  requirementsByType,
  workstationRanges,
  yesNoUnsure,
  type MoveType,
} from '../config/planner';
import { services } from '../config/services';
import { hasContactDetails, primaryPhone, site } from '../config/site';
import { useMove } from '../context/MoveContext';
import { isEnquiryConfigured, submitEnquiry, summarizeEnquiry } from '../lib/enquiry';
import { needsDestination, plannerDefaults, plannerSchema, stepFields, todayISO, type PlannerValues } from '../lib/plannerSchema';

const PlannerScene = lazy(() => import('../components/three/scenes/PlannerScene'));

const STEPS = ['Type of move', 'Property', 'Locations', 'Requirements', 'Date & contact'];

type Status = 'idle' | 'submitting' | 'sent' | 'not-configured' | 'error';

const vehicleEnabled = services.some((s) => s.id === 'vehicle' && s.enabled);

/** Drops answers that don't apply to the chosen move type before sending. */
function sanitize(v: PlannerValues): PlannerValues {
  const t = v.moveType as MoveType;
  const allowed = requirementsByType[t] ?? [];
  const out: PlannerValues = { ...v, requirements: v.requirements.filter((r) => allowed.includes(r)) };
  const isHomeLike = t === 'home' || t === 'packing' || ((t === 'local' || t === 'long-distance') && v.propertyKind === 'home');
  const isOfficeLike = t === 'office' || ((t === 'local' || t === 'long-distance') && v.propertyKind === 'office');
  if (!isHomeLike) out.homeSize = '';
  if (!isOfficeLike) out.workstations = '';
  if (t !== 'office') Object.assign(out, { officeSize: '', meetingRooms: '', itEquipment: '', storageAreas: '', companyName: '' });
  if (t !== 'local' && t !== 'long-distance') out.propertyKind = '';
  if (t !== 'packing') out.packingScope = '';
  if (t !== 'other') out.description = '';
  if (!out.requirements.includes('other')) out.otherRequirement = '';
  if (out.dateFlexible) out.date = '';
  return out;
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

type Opt = { id: string; label: string };

function OptionGroup({
  name,
  legend,
  options,
  register,
  errors,
  cols = 'sm:grid-cols-3',
  hint,
}: {
  name: keyof PlannerValues;
  legend: string;
  options: readonly Opt[];
  register: UseFormRegister<PlannerValues>;
  errors: FieldErrors<PlannerValues>;
  cols?: string;
  hint?: string;
}) {
  const err = errors[name]?.message as string | undefined;
  return (
    <fieldset aria-describedby={err ? `${name}-error` : undefined}>
      <legend className="field-label">
        {legend} {hint && <span className="font-medium text-navy-400">{hint}</span>}
      </legend>
      <div className={`grid grid-cols-2 gap-2.5 ${cols}`}>
        {options.map((o) => (
          <label key={o.id} className="choice">
            <input type="radio" value={o.id} className="peer sr-only" {...register(name)} />
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-navy-900/20 peer-checked:border-[5px] peer-checked:border-amber-500"
              aria-hidden="true"
            />
            {o.label}
          </label>
        ))}
      </div>
      <ErrorText id={`${name}-error`} message={err} />
    </fieldset>
  );
}

function TextField({
  name,
  label,
  register,
  errors,
  hint,
  type = 'text',
  ...rest
}: {
  name: keyof PlannerValues;
  label: ReactNode;
  register: UseFormRegister<PlannerValues>;
  errors: FieldErrors<PlannerValues>;
  hint?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  min?: string;
}) {
  const err = errors[name]?.message as string | undefined;
  const ids = [hint ? `${name}-hint` : '', err ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <input id={`f-${name}`} type={type} className="field" aria-invalid={!!err} aria-describedby={ids} {...register(name)} {...rest} />
      {hint && (
        <p id={`${name}-hint`} className="mt-1.5 text-sm text-navy-400">
          {hint}
        </p>
      )}
      <ErrorText id={`${name}-error`} message={err} />
    </div>
  );
}

function TextArea({
  name,
  label,
  register,
  errors,
  placeholder,
}: {
  name: keyof PlannerValues;
  label: ReactNode;
  register: UseFormRegister<PlannerValues>;
  errors: FieldErrors<PlannerValues>;
  placeholder?: string;
}) {
  const err = errors[name]?.message as string | undefined;
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <textarea
        id={`f-${name}`}
        rows={3}
        className="field resize-y"
        placeholder={placeholder}
        aria-invalid={!!err}
        aria-describedby={err ? `${name}-error` : undefined}
        {...register(name)}
      />
      <ErrorText id={`${name}-error`} message={err} />
    </div>
  );
}

function Summary({ values }: { values: PlannerValues }) {
  const rows: [string, string][] = [
    ['Move', moveTypeLabel(values.moveType as MoveType)],
    ['Size', homeSizes.find((h) => h.id === values.homeSize)?.label ?? ''],
    ['Workstations', workstationRanges.find((w) => w.id === values.workstations)?.label ?? ''],
    ['From', values.pickup],
    ['To', values.destination],
    ['Needs', values.requirements.map((r) => requirementLabels[r]).filter(Boolean).join(', ')],
    ['Date', values.dateFlexible ? 'Flexible' : values.date],
  ];
  const filled = rows.filter(([, v]) => v);
  return (
    <div className="rounded-3xl border border-navy-900/5 bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">Your plan so far</p>
      {filled.length ? (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {filled.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-semibold text-navy-400">{k}</dt>
              <dd className="font-semibold text-navy-800">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-navy-500">Your selections will appear here as you build your plan.</p>
      )}
    </div>
  );
}

export function MovePlanner() {
  const { plannerRequest } = useMove();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<PlannerValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: plannerDefaults,
    mode: 'onTouched',
  });

  const values = watch();
  const t = values.moveType as MoveType | '';
  const isOffice = t === 'office';

  // Apply prefills from CTAs elsewhere on the page.
  useEffect(() => {
    const req = plannerRequest;
    if (!req) return;
    const current = getValues('moveType');
    if (req.silent) {
      if (req.moveType && (current === '' || current === 'home' || current === 'office')) setValue('moveType', req.moveType);
      return;
    }
    if (req.moveType) setValue('moveType', req.moveType);
    if (req.requirement) {
      const reqs = getValues('requirements');
      if (!reqs.includes(req.requirement)) setValue('requirements', [...reqs, req.requirement]);
    }
    if (req.pickup) setValue('pickup', req.pickup);
    if (req.destination) setValue('destination', req.destination);
    setStatus('idle');
    const type = req.moveType ?? getValues('moveType');
    setStep(!type ? 0 : req.pickup || req.destination ? 2 : 1);
  }, [plannerRequest, getValues, setValue]);

  useEffect(() => {
    if (shouldFocus.current) {
      stepHeading.current?.focus();
      shouldFocus.current = false;
    }
  }, [step]);

  const goTo = (s: number) => {
    shouldFocus.current = true;
    setStep(s);
  };

  const next = async () => {
    const fields = stepFields[step];
    const ok = await trigger(fields, { shouldFocus: true });
    if (ok) goTo(step + 1);
  };

  const onSubmit = async (raw: PlannerValues) => {
    setStatus('submitting');
    const result = await submitEnquiry(sanitize(raw));
    setStatus(result.status);
    if (result.status === 'error') setErrorMessage(result.message);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const onInvalid = () => {
    // Errors can only exist in the current step's fields at this point; RHF focuses the first one.
    const first = stepFields[4].find((f) => errors[f]);
    if (first) setFocus(first);
  };

  const startOver = () => {
    reset(plannerDefaults);
    setStatus('idle');
    setShowDetails(false);
    goTo(0);
  };

  const summaryText = useMemo(() => summarizeEnquiry(sanitize(values)), [values]);

  // Only rebuild the 3D preview when an input it depicts changes, not on every keystroke.
  const scene = useMemo(
    () => <PlannerScene moveType={t} homeSize={values.homeSize} workstations={values.workstations} propertyKind={values.propertyKind} />,
    [t, values.homeSize, values.workstations, values.propertyKind],
  );

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const requirementOptions = (t ? requirementsByType[t] : []).filter((r) => r !== 'vehicle' || vehicleEnabled);

  const stepBody: Record<number, ReactNode> = {
    0: (
      <fieldset aria-describedby={errors.moveType ? 'moveType-error' : undefined}>
        <legend className="sr-only">Select the type of move</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {enabledMoveTypes.map((m) => (
            <label key={m.id} className="choice items-start !py-4">
              <input type="radio" value={m.id} className="peer sr-only" {...register('moveType')} />
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900/5 text-navy-700 peer-checked:bg-amber-500 peer-checked:text-white">
                <m.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold text-navy-900">{m.label}</span>
                <span className="mt-0.5 block text-sm font-medium text-navy-500">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
        <ErrorText id="moveType-error" message={errors.moveType?.message} />
      </fieldset>
    ),
    1: (
      <div className="space-y-7">
        {t === 'home' && <OptionGroup name="homeSize" legend="Approximate home size" options={homeSizes} register={register} errors={errors} />}
        {t === 'office' && (
          <>
            <OptionGroup name="workstations" legend="Approximate number of workstations" options={workstationRanges} register={register} errors={errors} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="officeSize" label={<>Office size or area <span className="font-medium text-navy-400">(if known)</span></>} placeholder="e.g. 2,500 sq ft" register={register} errors={errors} />
              <TextField name="meetingRooms" label={<>Meeting rooms <span className="font-medium text-navy-400">(optional)</span></>} placeholder="e.g. 2" inputMode="numeric" register={register} errors={errors} />
            </div>
            <OptionGroup name="itEquipment" legend="IT equipment to move?" hint="(optional)" options={yesNoUnsure} register={register} errors={errors} />
            <OptionGroup name="storageAreas" legend="Storage or document areas?" hint="(optional)" options={yesNoUnsure} register={register} errors={errors} />
          </>
        )}
        {(t === 'local' || t === 'long-distance') && (
          <>
            <OptionGroup name="propertyKind" legend="What are you moving?" options={propertyKinds} register={register} errors={errors} />
            {values.propertyKind === 'home' && (
              <OptionGroup name="homeSize" legend="Approximate home size" hint="(optional)" options={homeSizes} register={register} errors={errors} />
            )}
            {values.propertyKind === 'office' && (
              <OptionGroup name="workstations" legend="Approximate number of workstations" hint="(optional)" options={workstationRanges} register={register} errors={errors} />
            )}
          </>
        )}
        {t === 'packing' && (
          <>
            <OptionGroup name="packingScope" legend="What help do you need?" options={packingScopes} register={register} errors={errors} />
            <OptionGroup name="homeSize" legend="Approximate property size" hint="(optional)" options={homeSizes} register={register} errors={errors} />
          </>
        )}
        {t === 'other' && (
          <TextArea name="description" label="Describe your requirement" placeholder="Tell us what you need help with…" register={register} errors={errors} />
        )}
      </div>
    ),
    2: (
      <div className="space-y-5">
        <TextField
          name="pickup"
          label={isOffice ? 'Current office location' : 'Pickup location'}
          placeholder="City or area"
          autoComplete="address-level2"
          register={register}
          errors={errors}
        />
        <TextField
          name="destination"
          label={
            needsDestination(t) ? (
              'Destination location'
            ) : (
              <>
                Destination location <span className="font-medium text-navy-400">(optional)</span>
              </>
            )
          }
          placeholder="City or area"
          autoComplete="address-level2"
          register={register}
          errors={errors}
        />
        {t === 'long-distance' && (
          <p className="flex items-start gap-2 rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            Availability for your route is confirmed after your enquiry is reviewed.
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            aria-expanded={showDetails}
            aria-controls="address-details"
            className="text-sm font-bold text-navy-700 underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            {showDetails ? 'Hide address details' : 'Add more address details (optional)'}
          </button>
          {showDetails && (
            <div id="address-details" className="mt-4 grid gap-5 sm:grid-cols-2">
              <TextArea name="pickupDetails" label="Pickup address details" placeholder="Building, floor, landmark…" register={register} errors={errors} />
              <TextArea name="destinationDetails" label="Destination address details" placeholder="Building, floor, landmark…" register={register} errors={errors} />
            </div>
          )}
        </div>
      </div>
    ),
    3: (
      <div className="space-y-6">
        <fieldset>
          <legend className="field-label">
            {isOffice ? 'Packing and relocation requirements' : 'What do you need help with?'}{' '}
            <span className="font-medium text-navy-400">(select any)</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {requirementOptions.map((r) => (
              <label key={r} className="choice">
                <input type="checkbox" value={r} className="peer sr-only" {...register('requirements')} />
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-navy-900/20 text-transparent peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-checked:text-white"
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {requirementLabels[r]}
              </label>
            ))}
          </div>
        </fieldset>
        {values.requirements.includes('other') && (
          <TextField name="otherRequirement" label="Other requirement" placeholder="Briefly describe it" register={register} errors={errors} />
        )}
        <TextArea
          name="notes"
          label={
            <>
              Additional instructions <span className="font-medium text-navy-400">(optional)</span>
            </>
          }
          placeholder={isOffice ? 'Access, timings, items that need special attention…' : 'Floor and lift access, fragile items, anything else we should know…'}
          register={register}
          errors={errors}
        />
      </div>
    ),
    4: (
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <TextField name="date" label="Preferred moving date" type="date" min={todayISO()} register={register} errors={errors} />
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-navy-700">
              <input type="checkbox" className="h-4 w-4 rounded accent-amber-500" {...register('dateFlexible')} />
              My date is flexible
            </label>
          </div>
          {isOffice && <TextField name="companyName" label="Company or organization name" autoComplete="organization" register={register} errors={errors} />}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label={isOffice ? 'Contact person' : 'Your name'} autoComplete="name" register={register} errors={errors} />
          <TextField name="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" register={register} errors={errors} />
        </div>
        <TextField
          name="email"
          label={
            <>
              Email address <span className="font-medium text-navy-400">(optional)</span>
            </>
          }
          type="email"
          inputMode="email"
          autoComplete="email"
          register={register}
          errors={errors}
        />
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-amber-500"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'consent-error' : undefined}
              {...register('consent')}
            />
            <span>
              I agree to be contacted by {site.name} about this enquiry. Read the{' '}
              <a href="/privacy" target="_blank" rel="noopener" className="font-semibold underline decoration-amber-500 underline-offset-2">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <ErrorText id="consent-error" message={errors.consent?.message} />
        </div>
        {!isEnquiryConfigured() && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-navy-700">
            <PlugZap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            Online enquiry submission is still being connected. You can review and copy your moving plan in the next step.
          </p>
        )}
      </div>
    ),
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <section id="planner" aria-labelledby="planner-heading" className="section overflow-hidden bg-gradient-to-b from-warm-100 to-[#EEE9E1]">
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <RouteGlyph />
            Move Planner
          </p>
          <h2 id="planner-heading" tabIndex={-1} className="mt-4 text-3xl font-extrabold leading-[1.1] focus:outline-none sm:text-4xl lg:text-[2.75rem]">
            Let’s Build Your Moving Plan.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-600 sm:text-lg">
            Five short steps. Your answers stay in place while you move back and forth, and the scene updates as your plan takes shape.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="card overflow-hidden">
              {status === 'idle' || status === 'submitting' ? (
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
                  {/* Progress */}
                  <div className="border-b border-navy-900/5 px-6 pb-5 pt-6 sm:px-8">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-navy-900">
                        Step {step + 1} of {STEPS.length}
                      </span>
                      <span className="text-navy-400">{STEPS[step]}</span>
                    </div>
                    <div
                      className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-900/5"
                      role="progressbar"
                      aria-valuemin={1}
                      aria-valuemax={STEPS.length}
                      aria-valuenow={step + 1}
                      aria-label="Planner progress"
                    >
                      <motion.div className="h-full rounded-full bg-amber-500" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    <ol className="mt-4 hidden gap-2 sm:flex">
                      {STEPS.map((s, i) => (
                        <li key={s} className="flex-1">
                          <button
                            type="button"
                            disabled={i > step}
                            onClick={() => goTo(i)}
                            aria-current={i === step ? 'step' : undefined}
                            className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-bold transition ${
                              i === step ? 'bg-navy-900 text-white' : i < step ? 'text-navy-700 hover:bg-navy-900/5' : 'text-navy-300'
                            }`}
                          >
                            {i < step ? <Check className="mr-1 inline h-3 w-3 text-amber-500" aria-hidden="true" /> : `${i + 1}. `}
                            {s}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="px-6 py-7 sm:px-8">
                    <h3 ref={stepHeading} tabIndex={-1} className="mb-5 text-xl font-extrabold text-navy-900 focus:outline-none">
                      {step === 0 && 'Select the type of move'}
                      {step === 1 && (t === 'office' ? 'Tell us about the office' : t === 'other' ? 'Tell us about your requirement' : 'Tell us about the property')}
                      {step === 2 && 'Where are you moving from and to?'}
                      {step === 3 && 'Choose your requirements'}
                      {step === 4 && 'Preferred date and contact details'}
                    </h3>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.22 }}
                      >
                        {stepBody[step]}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-navy-900/5 bg-warm-50 px-6 py-5 sm:px-8">
                    {step > 0 ? (
                      <Button variant="ghost" size="md" onClick={() => goTo(step - 1)} className="!px-2">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                      </Button>
                    ) : (
                      <span />
                    )}
                    {step < STEPS.length - 1 ? (
                      <Button size="md" onClick={next} icon={<ArrowRight className="h-4 w-4" />}>
                        Continue
                      </Button>
                    ) : (
                      <Button size="md" type="submit" disabled={status === 'submitting'}>
                        {status === 'submitting' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                          </>
                        ) : (
                          <>
                            Send My Enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div ref={resultRef} tabIndex={-1} className="p-6 focus:outline-none sm:p-8" role="status">
                  {status === 'sent' && (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
                      <h3 className="mt-4 text-2xl font-extrabold text-navy-900">Thank you — your enquiry has been sent.</h3>
                      <p className="mt-2 text-navy-600">
                        The team will review your details and contact you to discuss your move. Here is a copy of what you shared:
                      </p>
                    </>
                  )}
                  {status === 'not-configured' && (
                    <>
                      <PlugZap className="h-12 w-12 text-amber-600" aria-hidden="true" />
                      <h3 className="mt-4 text-2xl font-extrabold text-navy-900">Your plan is ready — but it has not been sent.</h3>
                      <p className="mt-2 text-navy-600">
                        Online enquiry submission is not connected yet, so nothing was sent. Copy your moving plan below
                        {hasContactDetails ? ' and share it with us directly' : ' to keep it for when you contact us'}.
                      </p>
                      {hasContactDetails && (
                        <p className="mt-3 font-semibold text-navy-800">
                          {primaryPhone && <a href={`tel:${primaryPhone.tel}`} className="underline decoration-amber-500 underline-offset-4">{primaryPhone.display}</a>}
                          {primaryPhone && site.contact.email && ' · '}
                          {site.contact.email && <a href={`mailto:${site.contact.email}?subject=Moving enquiry&body=${encodeURIComponent(summaryText)}`} className="underline decoration-amber-500 underline-offset-4">{site.contact.email}</a>}
                        </p>
                      )}
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <AlertCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
                      <h3 className="mt-4 text-2xl font-extrabold text-navy-900">Your enquiry could not be sent.</h3>
                      <p className="mt-2 text-navy-600">{errorMessage} Your details are still here — please try again.</p>
                    </>
                  )}

                  <pre data-lenis-prevent className="mt-6 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-warm-100 p-5 font-sans text-sm leading-relaxed text-navy-800">
                    {summaryText}
                  </pre>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {status === 'error' && (
                      <Button size="md" onClick={handleSubmit(onSubmit)}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
                      </Button>
                    )}
                    {status !== 'sent' && (
                      <Button size="md" variant={status === 'error' ? 'secondary' : 'primary'} onClick={copySummary}>
                        <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> {copied ? 'Copied' : 'Copy my plan'}
                      </Button>
                    )}
                    {status !== 'sent' && (
                      <Button size="md" variant="secondary" onClick={() => setStatus('idle')}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Edit details
                      </Button>
                    )}
                    {status === 'sent' && (
                      <Button size="md" variant="secondary" onClick={startOver}>
                        Start another enquiry
                      </Button>
                    )}
                  </div>
                  <p className="sr-only" aria-live="polite">
                    {copied ? 'Moving plan copied to clipboard.' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5" aria-label="Plan preview">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-navy-900/5 bg-gradient-to-b from-[#EDF1F6] to-[#F5F0E8] shadow-soft">
                <LazyScene
                  className="!absolute inset-0"
                  label={`Preview of your move: ${moveTypeLabel(t as MoveType) || 'choose a move type to begin'}.`}
                  fallback={<SceneFallback variant={t === 'office' ? 'office' : 'planner'} />}
                >
                  {scene}
                </LazyScene>
                <p className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-navy-800 shadow-soft">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                  {moveTypeLabel(t as MoveType) || 'Your move'}
                </p>
              </div>
              <Summary values={values} />
              <p className="px-1 text-xs leading-relaxed text-navy-400">
                No price is calculated here. Quotations are prepared after your requirements are reviewed and discussed with you.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
