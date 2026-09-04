# Legal Launch Checklist

**Статус:** рабочий документ. Не является юридическим заключением и не разрешает включать оплаты, claim, NFT mint или KOTS liquidity.

## Публичные документы до запуска

1. Terms of Service с названием оператора, адресом для уведомлений, применимым правом, правилами оплаты, возвратов, модерации и споров.
2. Privacy Notice с фактическим списком данных, сроками хранения, провайдерами, контактами для запросов и правилами международной передачи данных.
3. Content Rules и DMCA process с адресом агента, порядком notice и counter-notice.
4. Crown Rules с периодом показа, номером трона, ценой, точным продуктом покупки, правилами отмены и последствиями удаления контента.
5. KOTS Token Policy с mint address, supply, резервами, vesting, claim, wallet addresses, authority status и рисками.
6. Risk Disclosure без заявлений о цене, доходности, ликвидности, выкупе или росте KOTS.

## Что должен утвердить юрист США до запуска

1. Анализ KOTS и Crown Rewards по тесту investment contract с учётом сайта, маркетинга, токеномики и реальных действий Vault.
2. Анализ money transmission, custody и передачи активов. Claim должен быть self-custodial. Команда не хранит ключи пользователей.
3. Санкционная политика, география доступа, ограничения по пользователям и документы для screening.
4. Потребительские правила, реклама, возвраты, contest/auction disclosures и возрастные ограничения.
5. DMCA agent, privacy obligations, права на пользовательский контент и процедура жалоб.

## Неподтверждённые данные, которые нужны от оператора

1. Юридическое лицо или физическое лицо, которое является оператором.
2. Страна и применимое право.
3. Физический адрес или разрешённый адрес для legal notices.
4. Политика возвратов после запуска оплат.
5. Список стран, в которых продукт не будет доступен.
6. Адреса multisig для Treasury, Vault, Crown Rewards и Team Vesting.

## Технические стоп-условия

- `PAID_TAKEOVER_ENABLED` остаётся выключенным.
- Новый KOTS mint не создаётся.
- Старый Pump.fun mint не используется и не рекламируется.
- NFT mint и KOTS claim не создаются.
- Liquidity Vault не проводит рыночные сделки.
- Новый mint требует отдельной подписи оператора после on-chain checklist.
- Старый Sentinel остановлен. Он не запускается до отдельной новой реализации.
- Старый Helius API key был раскрыт в переписке. Его нужно отозвать и выпустить новый ключ до любого запуска.

## Нормативные источники для проверки

- SEC: https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/transactions-involving-crypto-assets
- FinCEN: https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering
- CFTC: https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html
