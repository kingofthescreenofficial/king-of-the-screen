# KOTS v1.2 Mint Runbook

**Статус:** не выполнять. Новый mint не создаётся до закрытия `OPERATOR_INPUT_REQUIRED.md` и письменного юридического разрешения.

## Цель

Создать один проверяемый SPL Token mint с полным supply 1,000,000,000 KOTS и без последующего mint или freeze контроля.

## Перед началом

1. Создать отдельный deployer wallet. Не использовать hot wallet сайта.
2. Подготовить небольшой баланс SOL только для сетевых комиссий, rent и публикации metadata.
3. Подтвердить три signer address для 2-of-3 multisig.
4. Создать четыре адреса резервов: Crown Rewards, Community Utility, Product Treasury, Team Vesting.
5. Подготовить финальные metadata: name, symbol, description, image, website, legal links.
6. Проверить, что Terms, Token Policy, Risk Disclosure и addresses опубликованы.

## On-chain последовательность

1. Создать standard SPL Token mint с 6 decimals.
2. Выпустить ровно 1,000,000,000 KOTS в контролируемый distribution wallet.
3. Перевести 100,000,000 KOTS в Crown Rewards reserve.
4. Перевести 400,000,000 KOTS в Community Utility reserve.
5. Перевести 300,000,000 KOTS в Product Treasury reserve.
6. Перевести 200,000,000 KOTS в Team Vesting wallet или vesting contract.
7. Создать и опубликовать metadata.
8. Удалить Mint Authority.
9. Удалить Freeze Authority.
10. Проверить supply, authorities и все четыре адреса через два независимых Solana explorer.
11. Опубликовать transaction signatures, mint address и distribution table.
12. Не включать claim или liquidity в тот же день. Они требуют отдельных условий и отдельного решения.

## Проверка перед публикацией

- Supply равен 1,000,000,000 KOTS.
- Mint Authority отсутствует.
- Freeze Authority отсутствует.
- Сумма четырёх резервов равна полному supply.
- Crown Rewards reserve содержит 100,000,000 KOTS.
- Ни один сайт, пост или интерфейс не обещает цену, доходность или выкуп.
- Старый Pump.fun mint отсутствует на сайте.

## Что не делаем

- Не отправляем KOTS на старый Pump.fun mint.
- Не используем hot wallet для mint или резервов.
- Не покупаем KOTS для влияния на цену.
- Не создаём ликвидность до появления фактического SOL в Vault и отдельной юридической проверки.
