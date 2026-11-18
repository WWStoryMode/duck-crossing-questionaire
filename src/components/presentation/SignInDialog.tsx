import { TeacherLoginForm } from '../TeacherLogin';

/** Teacher access-code prompt (existing server-side login), shown over the presentation. */
export function SignInDialog({ onSuccess, onClose, message }: { onSuccess: () => void; onClose: () => void; message?: string }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-navy shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="signin-title" className="text-2xl font-extrabold">Teacher sign-in</h2>
          <button type="button" className="ctl-btn" onClick={onClose}>Cancel</button>
        </div>
        <p className="mt-2 text-sm">Unlocks answer reveal and submission lock. Uses the same code as the teacher dashboard.</p>
        <TeacherLoginForm onSuccess={onSuccess} message={message} />
      </div>
    </div>
  );
}
