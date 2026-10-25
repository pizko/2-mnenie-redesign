'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IS_PREVIEW, LEAD_ENDPOINT } from '@/lib/config';
import { track } from '@/lib/analytics';
import { service } from '@/content/service';
import { BotCta } from './BotCta';

/**
 * Заявка на второе мнение: одна модальная форма на сайт, открывается любой кнопкой <LeadButton>.
 * Отправка — multipart/form-data на LEAD_ENDPOINT (адрес приёмника задаётся при сборке).
 * В превью и без настроенного приёмника ничего не отправляется.
 * В Метрику уходят только факты «открыл форму» / «отправил» и место кнопки — без содержимого полей.
 */

const OPEN_EVENT = 'lead-form-open';
const MAX_FILES = 10;
const MAX_FILE_MB = 20;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,.webp,application/pdf,image/*';

export function openLeadForm(place: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: place }));
}

export function LeadButton({
  place,
  className = 'btn btn-primary',
  children = <>Получить второе мнение — {service.priceLabel}</>,
}: {
  place: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => openLeadForm(place)} aria-haspopup="dialog">
      {children}
    </button>
  );
}

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'story' | 'files' | 'consent', string>>;

function validate(f: FormData, files: File[]): Errors {
  const e: Errors = {};
  const name = String(f.get('name') ?? '').trim();
  const email = String(f.get('email') ?? '').trim();
  const phone = String(f.get('phone') ?? '').replace(/[^\d+]/g, '');
  const story = String(f.get('story') ?? '').trim();
  if (name.length < 2) e.name = 'Укажите имя';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Проверьте адрес почты';
  if (phone.replace(/\D/g, '').length < 10) e.phone = 'Укажите телефон с кодом, например +7 900 000-00-00';
  if (story.length < 20) e.story = 'Опишите ситуацию хотя бы в паре предложений';
  if (files.length > MAX_FILES) e.files = `Не больше ${MAX_FILES} файлов`;
  else if (files.some((x) => x.size > MAX_FILE_MB * 1024 * 1024)) e.files = `Каждый файл — не больше ${MAX_FILE_MB} МБ`;
  if (!f.get('consent')) e.consent = 'Без согласия мы не сможем обработать заявку';
  return e;
}

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} МБ` : `${Math.ceil(b / 1024)} КБ`);

export function LeadDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const opener = useRef<Element | null>(null);
  const [place, setPlace] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const onOpen = (e: Event) => {
      opener.current = document.activeElement;
      setPlace((e as CustomEvent<string>).detail);
      if (state === 'done') {
        setState('idle');
        setFiles([]);
        form.current?.reset();
      }
      dialog.current?.showModal();
      track('lead_form_open', { place: (e as CustomEvent<string>).detail });
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [state]);

  const close = () => dialog.current?.close();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.delete('files');
    const errs = validate(data, files);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (String(data.get('company') ?? '')) return; // скрытое поле от ботов
    if (IS_PREVIEW || !LEAD_ENDPOINT) {
      setState('error');
      setMessage(
        IS_PREVIEW
          ? 'Это превью: заявка никуда не отправлена. На рабочем сайте здесь будет отправка.'
          : 'Приём заявок временно недоступен. Оформите обращение в Telegram-боте.',
      );
      return;
    }
    files.forEach((f) => data.append('files', f, f.name));
    data.append('source', place);
    data.append('landing_path', window.location.pathname);
    setState('sending');
    setMessage('');
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.detail || 'Не удалось отправить заявку');
      setState('done');
      track('lead_form_submit', { place });
    } catch (err) {
      setState('error');
      setMessage(`${err instanceof Error ? err.message : 'Ошибка отправки'}. Попробуйте ещё раз или оформите обращение в Telegram.`);
    }
  }

  const field = (name: keyof Errors) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `lead-${name}-err` : undefined,
  });
  const err = (name: keyof Errors) =>
    errors[name] ? (
      <span id={`lead-${name}-err`} className="field-err">
        {errors[name]}
      </span>
    ) : null;

  return (
    <dialog
      ref={dialog}
      className="lead-dialog"
      aria-labelledby="lead-title"
      onClose={() => (opener.current as HTMLElement | null)?.focus?.()}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="lead-inner">
        <button type="button" className="lead-close" onClick={close} aria-label="Закрыть форму">
          <span aria-hidden="true">×</span>
        </button>

        {state === 'done' ? (
          <div className="lead-done" role="status">
            <p className="eyebrow">Заявка отправлена</p>
            <h2 id="lead-title">Спасибо! Мы получили вашу заявку</h2>
            <p>Мы свяжемся с вами по почте или телефону, которые вы указали.</p>
            <p className="note-amber">
              Если состояние питомца резко ухудшилось — не ждите ответа, езжайте в круглосуточную клинику.
            </p>
            <button type="button" className="btn btn-primary" onClick={close}>
              Закрыть
            </button>
          </div>
        ) : (
          <form
            ref={form}
            onSubmit={submit}
            noValidate
            onChange={(e) => {
              // исправленное поле сразу теряет сообщение об ошибке
              const name = (e.target as unknown as HTMLInputElement).name as keyof Errors;
              if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
            }}
          >
            <p className="eyebrow">Второе мнение · {service.priceLabel}</p>
            <h2 id="lead-title">Заявка на второе мнение ветеринара</h2>
            <p className="lead-sub">
              Расскажите о ситуации и приложите документы, если они под рукой. Поля со звёздочкой обязательны.
            </p>

            <div className="lead-grid">
              <label className="field">
                <span>
                  Имя <b aria-hidden="true">*</b>
                </span>
                <input name="name" autoComplete="name" required maxLength={80} {...field('name')} />
                {err('name')}
              </label>
              <label className="field">
                <span>
                  Почта <b aria-hidden="true">*</b>
                </span>
                <input name="email" type="email" autoComplete="email" inputMode="email" required maxLength={120} {...field('email')} />
                {err('email')}
              </label>
              <label className="field">
                <span>
                  Телефон <b aria-hidden="true">*</b>
                </span>
                <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={30} placeholder="+7" {...field('phone')} />
                {err('phone')}
              </label>
            </div>

            <label className="field">
              <span>
                Что случилось <b aria-hidden="true">*</b>
              </span>
              <textarea
                name="story"
                rows={5}
                required
                maxLength={4000}
                placeholder="Вид и возраст питомца, что беспокоит, какой диагноз поставили и что назначили, какой вопрос вы хотите задать врачу"
                {...field('story')}
              />
              {err('story')}
            </label>

            <div className="field">
              <span id="lead-files-label">Вложения</span>
              <label className={`dropzone ${errors.files ? 'is-invalid' : ''}`}>
                <input
                  type="file"
                  name="files"
                  multiple
                  accept={ACCEPT}
                  aria-labelledby="lead-files-label"
                  aria-describedby={`lead-files-hint${errors.files ? ' lead-files-err' : ''}`}
                  onChange={(e) => {
                    // список читаем сразу: после сброса value он опустеет
                    const picked = Array.from(e.target.files ?? []);
                    setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES + 1));
                    setErrors(({ files: _, ...rest }) => rest);
                    e.target.value = '';
                  }}
                />
                <span>
                  <b>Выбрать файлы</b> или перетащить сюда
                </span>
              </label>
              <span id="lead-files-hint" className="fine">
                PDF или фото (JPG, PNG, HEIC) — до {MAX_FILES} файлов, до {MAX_FILE_MB} МБ каждый. Необязательно: документы
                можно будет прислать позже.
              </span>
              {err('files')}
              {files.length > 0 && (
                <ul className="file-list">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`}>
                      <span>{f.name}</span>
                      <small>{fmtSize(f.size)}</small>
                      <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Убрать файл ${f.name}`}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ловушка для спам-ботов: людям не видна */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

            <label className={`check ${errors.consent ? 'is-invalid' : ''}`}>
              <input type="checkbox" name="consent" value="yes" {...field('consent')} />
              <span>
                Я даю{' '}
                <Link href="/documents/consent" target="_blank">
                  согласие на обработку персональных данных
                </Link>{' '}
                <b aria-hidden="true">*</b>
              </span>
            </label>
            {err('consent')}

            <p className="fine lead-legal">
              Нажимая «Отправить заявку», вы подтверждаете, что ознакомились с{' '}
              <Link href="/documents/privacy" target="_blank">
                политикой конфиденциальности
              </Link>{' '}
              и{' '}
              <Link href="/documents/offer" target="_blank">
                офертой
              </Link>
              . Заявка ни к чему не обязывает: оплата {service.priceLabel} — только после того, как мы свяжемся с вами.
            </p>

            <div className="lead-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={state === 'sending'}>
                {state === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <BotCta source={`form_${place}`.slice(0, 60)} className="link-quiet">
                Удобнее в Telegram →
              </BotCta>
            </div>
            <p role="status" className={`form-status ${state}`}>
              {state === 'error' && message}
            </p>
            <p className="fine">При угрозе жизни питомца — сразу в круглосуточную клинику: онлайн-сервис не оказывает экстренную помощь.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}
