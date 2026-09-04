# Security Release Notes

## Pre-launch controls

- Платежи закрыты через `PAID_TAKEOVER_ENABLED`.
- NFT mint, KOTS claim и market operations выключены.
- Старый Sentinel остановлен на VPS и заменён fail-closed скриптом.
- Старые reset-скрипты больше не перезаписывают state.
- Старый Pump.fun mint удалён из сайта и исполняемого кода.
- Заявка на экран проходит проверку текста и изображения до сохранения. При отсутствии или сбое внешнего модератора заявка отклоняется, файл не сохраняется.
- Payment intent хранит ID и SHA-256 хеш одобренной заявки. Клиент не передаёт хеш контента для платежа.

## Outstanding security work

- Helius API key, раскрытый в переписке, требует ротации.
- VPS panel и root credentials, раскрытые в переписке, требуют ротации и проверки.
- `npm audit --omit=dev --audit-level=high` сообщает четыре moderate advisory через `@solana/web3.js`. Автоматический fix предлагает breaking downgrade. Обновление требует отдельного compatibility review.
