import { composePhoneId, DEFAULT_COUNTRY_CODE } from '../core/phoneId';
import { t } from '../i18n/i18n';
import { h } from './dom';

export interface PhoneField {
  el: HTMLElement;
  /** Country + national → digits-only phone ID (throws AuthError). */
  value: () => string;
  focus: () => void;
}

/** Country code (default +82) + national mobile number row. Spaces/dashes allowed. */
export function phoneField(opts: { id?: string; autocomplete?: string } = {}): PhoneField {
  const country = h('input.field.country-code', {
    type: 'tel',
    inputmode: 'tel',
    autocomplete: 'tel-country-code',
    maxlength: 6,
    'aria-label': t('login.countryCode'),
    'data-i18n-aria': 'login.countryCode',
    value: DEFAULT_COUNTRY_CODE,
  });
  country.value = DEFAULT_COUNTRY_CODE;
  const national = h('input.field.phone-national', {
    type: 'tel',
    inputmode: 'tel',
    autocomplete: opts.autocomplete ?? 'tel-national',
    id: opts.id,
    'data-i18n-ph': 'login.phonePlaceholder',
    placeholder: t('login.phonePlaceholder'),
  });
  const el = h('div.phone-row', {}, country, national);
  return {
    el,
    value: () => composePhoneId(country.value, national.value),
    focus: () => national.focus(),
  };
}
