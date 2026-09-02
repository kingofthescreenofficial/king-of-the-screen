const fs = require('fs');
let pageCode = fs.readFileSync('web/app/page.tsx', 'utf8');

// Inject useEffect for PAGE_VIEW
if (!pageCode.includes('PAGE_VIEW')) {
    pageCode = pageCode.replace(
        'export default function Home() {',
        `export default function Home() {
  React.useEffect(() => {
    fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ type: 'USER', event: 'PAGE_VIEW', details: { source: 'Home' }}) }).catch(()=>{});
  }, []);`
    );
    // ensure React is imported if missing
    if (!pageCode.includes('import React')) {
        pageCode = `import React from 'react';\n` + pageCode;
    }
    fs.writeFileSync('web/app/page.tsx', pageCode);
    console.log("Patched page.tsx");
}

let modalCode = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');
if (!modalCode.includes('CLICK_TAKEOVER_MODAL')) {
    // When the modal opens
    modalCode = modalCode.replace(
        'if (isOpen) {',
        `if (isOpen) {
      fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ type: 'USER', event: 'CLICK_TAKEOVER_MODAL', details: { action: 'Opened Takeover Modal' }}) }).catch(()=>{});`
    );
    // When wallet connects
    modalCode = modalCode.replace(
        'if (publicKey) {',
        `if (publicKey) {
      fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ type: 'USER', event: 'WALLET_CONNECTED', details: { pubkey: publicKey.toBase58() }}) }).catch(()=>{});`
    );
    // When payment starts
    modalCode = modalCode.replace(
        'setLoading(true);',
        `setLoading(true);
        fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ type: 'USER', event: 'PAYMENT_STARTED', details: { amountUsd }}) }).catch(()=>{});`
    );
    fs.writeFileSync('web/components/TakeoverModal.tsx', modalCode);
    console.log("Patched TakeoverModal.tsx");
}

