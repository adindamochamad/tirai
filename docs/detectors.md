# Detector assumptions

Tirai finds three kinds of Indonesian identifiers with regular expressions and small checks. It is a helper, not a guarantee. Nothing in this document is an accuracy, precision, or recall figure. Behavior below is what the tests in this repository enforce.

When a rule was ambiguous, the library redacts less in unlabeled text.

## NIK

An unlabeled run must be exactly 16 digits, not touching another digit. It is kept only when all of these heuristics pass:

- The first two digits are in `PROVINCE_CODES` (`src/constants/provinces.ts`). Checked on 15 October 2026 against the province-code recap in Keputusan Menteri Dalam Negeri Nomor 300.2.2-2138 Tahun 2025. Kepmendagri Nomor 300.2.2-2430 Tahun 2025 changes island data for Aceh and Sumatera Utara only. The codes are 11–19, 21, 31–36, 51–53, 61–65, 71–76, 81–82, and 91–96. Code 99 is a NIT prefix for an Indonesian citizen abroad who has no NIK, not a province code.
- Digits 7–8 are a day from 01–31, or 41–71 (the common +40 offset used for some female records).
- Digits 9–10 are a month from 01–12.

These checks are heuristics. A number can pass them and still not be a NIK.

A label within 20 non-digit characters before the number changes the rule. Labels are `NIK`, `KTP`, `No. KTP`, and `nomor induk kependudukan` (case-insensitive). A labeled 16-digit run is redacted even when the date or province check fails.

The grouped form `dddddd dddddd dddd`, also with `.`, `-`, or `/` between the three groups, is redacted only when one of those labels precedes it. Mixed separators are allowed. An unlabeled grouped number is left alone.

`nikStrict: false` redacts every unlabeled 16-digit run. It does not turn unlabeled grouped numbers into matches.

A run that starts with `0`, or a 16-digit run immediately after `+`, is never a NIK. Those shapes belong to phone numbers, and real province codes do not start with 0.

Normalization is digits only, so `317101 250190 0003` and `3171012501900003` share a token when both are detected. Restore returns the first form that was seen.

### Known false positives

- A 16-digit bank card, order id, or other identifier that happens to pass the province and date heuristics.
- A labeled 16-digit string that is not a NIK. The label forces redaction.

### Known false negatives

- Unlabeled numbers that fail the date or province heuristic, including some real NIKs with an unexpected province code.
- Unlabeled grouped NIKs.
- Numbers glued into a longer digit run (15 digits, or 17 or more).
- A NIK written with the label after the number.
- Anything that starts with 0.

## Telepon

v1 looks for Indonesian mobile numbers only.

Accepted prefixes: `08`, `+62 8`, `62 8`, `(+62) 8`, and `0062 8`. After the `8`, the subscriber number is 9–12 digits long. Written with the trunk `0`, that is a national number of 10–13 digits. The spec names both “9–12 subscriber digits after the leading 8” and “08 numbers are 10–13 digits total”; those two sentences agree if the subscriber form includes the `8`.

A single space, hyphen, or dot may appear before the `8` and before each later digit. Two separators in a row do not match. The match cannot touch another digit.

Normalization is `62` plus the digits, without the trunk `0`. `081234567890` and `+62 812-3456-7890` both become `6281234567890` and share one token. Restore writes back the first surface form, so a text that contains both forms does not round-trip character for character. A text that uses only one form does.

### Known false positives

- A long digit string that merely looks like `628…` or `08…` at a mobile length, such as an internal code.

### Known false negatives

- Landlines, including `021-…` and `+62 21 …`.
- Numbers shorter than 10 or longer than 13 national digits.
- Numbers with doubled spaces or other separators.
- Fullwidth digits and numbers spelled with words.

## Plat

The shape is a region code of 1–2 letters, 1–4 digits, and 0–3 suffix letters. Spaces between the parts are optional. The match must be bounded by non-alphanumeric characters.

The region code must be in `PLATE_REGION_CODES` (`src/constants/plateRegions.ts`). Checked on 15 October 2026 against Lampiran A of Peraturan Kepolisian Negara Republik Indonesia Nomor 7 Tahun 2021. That annex includes DP and DW. PY, PS, and PT are not in the annex. A Korlantas article of 21 August 2024 (updated 2 October 2024) says those codes are used for Papua Barat Daya, Papua Selatan, and Papua Tengah. The regulation leaves later area codes to a Kapolda decision, so they are not on the list. That article gives Papua Pegunungan no separate code. Diplomatic registration codes CD, CC, and CH are not region codes and are not included.

Without a label, the plate must already be uppercase and must have a suffix of 1–3 letters. That avoids eating `A 1` or a list item like `B 12`.

With a label, matching is case-insensitive and the suffix may be empty. Labels are `plat`, `nopol`, `no. pol`, `nomor polisi`, and `kendaraan`, within 20 characters before the plate.

Normalization is uppercase with spaces removed. `b 1234 abc` becomes `B1234ABC`.

Special, diplomatic, and military plates are not a separate format in v1. They are redacted only when they already fit the civilian pattern and the region code is on the list.

### Known false positives

- An allowlisted region, 1–4 digits, and 1–3 letters in ordinary prose or a code, such as `B 1234 ABC` used as an example rather than a plate.
- The word `kendaraan` followed within 20 characters by something plate-shaped.

### Known false negatives

- Lowercase plates with no label.
- Region codes missing from the allowlist, including PY, PS, and PT.
- Plates with no letter suffix, unless a label is present.
- More than 4 digits, or a suffix longer than 3 letters.
- Diplomatic, military, and other special plates that do not fit the pattern.

## Overlap, tokens, and the vault

If two matches overlap, the longer span is kept. If the lengths are equal, NIK wins over TELEPON, which wins over PLAT.

Tokens look like `[NIK_1]`, `[TELEPON_1]`, and `[PLAT_1]`. Counters start at 1 per type, per vault. A normalized value keeps the same token for the life of that vault. Passing `options.vault` continues the counters, which is how a multi-turn paste stays consistent.

If the input already contains a token-shaped string, that number is skipped. `[ telepon_1 ]` counts as `[TELEPON_1]`.

Restore tolerates spaces inside the brackets and a lowercase type. It does not guess at other edits. Unknown tokens stay as they are.

`JSON.stringify(vault)`, `String(vault)`, and Node's `inspect` return `[Vault: N entries]` and do not include the stored text.

## Open questions

- Province codes and plate region codes were checked on 15 October 2026. Sources are named in the NIK and plate sections. PY, PS, and PT stay off the plate list until a Kapolda decision is cited.
- The phone rule uses the 10–13 digit national length described above. Confirm that this is the length you want if a regulator describes subscriber digits differently.
- Two writings of one phone number restore to the first writing. Say if a later milestone should restore each original span instead.
- `kendaraan` is a broad label and will cause some extra plate matches. It can be removed if that is too aggressive.
- The Vite dev server's live reload opens a socket, which the demo's Content-Security-Policy forbids. `npm run build:demo` keeps the strict policy. Use the built page when you want the network tab to stay empty.
