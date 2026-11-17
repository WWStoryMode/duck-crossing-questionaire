import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function useJoinUrl() {
  const [url, setUrl] = useState(`${window.location.origin}/`);
  useEffect(() => {
    fetch('/api/join-url')
      .then((r) => r.json())
      .then((b) => b.url && setUrl(b.url))
      .catch(() => {});
  }, []);
  return url;
}

export function JoinQR() {
  const url = useJoinUrl();
  const [big, setBig] = useState(false);
  return (
    <section aria-labelledby="join" className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4 text-center">
      <h2 id="join" className="font-extrabold">Students join here</h2>
      <QRCodeSVG value={url} size={168} marginSize={2} title={`QR code for ${url}`} />
      <p className="break-all font-mono text-sm font-bold">{url}</p>
      <button type="button" onClick={() => setBig(true)} className="rounded-lg border-2 border-navy px-3 py-1 font-bold">
        Show large QR
      </button>
      {big && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Join QR code"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-paper p-6"
          onKeyDown={(e) => e.key === 'Escape' && setBig(false)}
        >
          <p className="text-4xl font-extrabold">Scan to join Duck Crossing</p>
          <QRCodeSVG value={url} size={Math.min(window.innerWidth, window.innerHeight) * 0.6} marginSize={2} />
          <p className="break-all font-mono text-3xl font-bold">{url}</p>
          <button type="button" autoFocus onClick={() => setBig(false)} className="rounded-xl bg-navy px-6 py-3 text-xl font-bold text-paper">
            Close
          </button>
        </div>
      )}
    </section>
  );
}
