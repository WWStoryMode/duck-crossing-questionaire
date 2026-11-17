import { ANSWERS, ANSWER_LABELS, type Answer } from '../../shared/types.js';

type Props = {
  name: string;
  labelledBy: string;
  value: Answer | undefined;
  onChange: (a: Answer) => void;
  disabled?: boolean;
};

/**
 * Four large options built on native radio inputs, so arrow keys,
 * Tab and Space work as expected and screen readers announce a radio group.
 */
export function AnswerPicker({ name, labelledBy, value, onChange, disabled }: Props) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ANSWERS.map((a) => {
        const checked = value === a;
        return (
          <label
            key={a}
            className={`relative flex min-h-[52px] items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-base font-bold transition-colors focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-navy ${
              checked ? 'border-navy bg-navy text-paper' : 'border-navy/25 bg-white text-navy'
            } ${disabled ? `cursor-not-allowed ${checked ? '' : 'opacity-75'}` : 'cursor-pointer hover:border-navy'}`}
          >
            <input
              type="radio"
              name={name}
              value={a}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(a)}
              className="sr-only"
            />
            {checked && <span aria-hidden className="mr-1">✓</span>}
            {ANSWER_LABELS[a]}
          </label>
        );
      })}
    </div>
  );
}
