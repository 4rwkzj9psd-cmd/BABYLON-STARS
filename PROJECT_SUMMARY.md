# BABYLON STARS — Povzetek projekta

**Kaj je to:** Babylon Stars (ROYAL ALBATROSS d.o.o.) je casting/talent agencija. Zgrajena je popolna spletna stran, mobilna aplikacija in začet razvoj v pravo platformo, ki jo bo mogoče prodajati tudi drugim agencijam.

**Repozitorij:** `4rwkzj9psd-cmd/BABYLON-STARS`, branch `claude/new-session-krygg4`
**Baza:** Supabase, projekt `gsatusmewafhkkhbtawi`
**Živa stran:** babylonstars.vercel.app

## 1. Spletna stran (Next.js)

**Javne strani:**
- Domov, Odkrivanje talentov, Za produkcije — marketinške strani
- `/apply` — 5-stopenjski obrazec za prijavo talenta (osebni podatki, kategorije, fotografije, jeziki/veščine, soglasja), ob koncu dobiš Talent ID
- `/projects` — javno brskanje po odprtih projektih; prijava prek Talent ID ali prek prijave
- `/portal` — prijava talenta prek magic-link e-pošte; profil, fotografije, video, prijave na projekte, termini, dokumenti, sporočila z agencijo
- `/signup` — registracija nove agencije (ime + email + geslo → 14 dni brezplačno)

**Admin panel (`/admin`):**
- Talenti — seznam, iskanje, filtri (status/kategorija/vir), detajl s statusom in opombami
- Briefi — ustvarjanje projektov (z načinom castinga: selfcast/avdicija/oboje), pregled prijav
- Koledar — ustvarjanje terminov za avdicije (posamezni ali serija prostih terminov), rezervacije v živo
- Sporočila — klepet s posameznim talentom v realnem času

## 2. Mobilna aplikacija (React Native / Expo)

Popolnoma sinhronizirana z isto Supabase bazo. Ima:
- Prijavo (talent prek magic-link, ekipa prek gesla)
- Talent zaslone: profil, projekti, termini, sporočila
- Admin zaslone: talenti, briefi, koledar, sporočila

## 3. Varnost (RLS)

Vsak dostop do podatkov je zaščiten na nivoju baze (Row Level Security) — osebje vidi samo podatke svoje agencije, talent vidi samo svoje podatke. Med razvojem so bile odkrite in popravljene več resnih varnostnih lukenj (npr. da bi en talent lahko videl podatke drugih talentov) ter dva prava bug-a pri rezervaciji terminov in v pravilih dostopa — vse popravljeno in preverjeno neposredno na bazi.

## 4. Večagencijska platforma — Faza 0 (ZAKLJUČENO)

Da lahko to postane produkt za prodajo drugim agencijam:
- Vsaka agencija ima svoj ločen, popolnoma izoliran prostor (nove tabele `agency`, `agency_member`, `agency_talent`)
- **Talent ima en sam globalen profil** — če se prijavi pri dveh agencijah, ne podvoji podatkov, le doda novo povezavo
- **Deljenje talentov med agencijami + sled provizije**: agencija lahko označi talenta kot "na voljo za mrežo", druga agencija ga lahko predlaga na svoj projekt, sistem pa zabeleži, kateri agenciji pripada provizija

## 5. Samopostrežna registracija + obračunavanje — Faza 1 (ZAKLJUČENO, delno)

- Nova agencija se registrira sama na `/signup`, dobi 14 dni brezplačno
- Po poteku roka se prikaže zaslon za dodajanje plačilne kartice (Stripe)
- **Stripe del čaka na uporabnika**: treba je ustvariti Stripe račun in posredovati ključe (natančna navodila so v `README.md`), preden dejansko plačevanje zaživi. Vse ostalo (registracija, preizkusna doba, dostop) že deluje.

## 6. Kaj še ni narejeno

- **Faza 2** (dogovorjena, še ne izvedena): pravo brskanje/iskanje po deljenih talentih drugih agencij v adminu; ločene javne strani za vsako agencijo posebej (trenutno je javna stran še vedno samo Babylon Stars)
- Video ozadje na domači strani (čaka se video posnetek od uporabnika)
- Pravo e-podpisovanje pogodb (Yousign integracija) — omenjeno v prvotnem tech planu, še ni grajeno
- Stripe plačevanje (glej zgoraj)

## 7. Pomembna omejitev razvojnega okolja

Razvojno okolje (Claude Code sandbox), v katerem je bila koda pisana, nima dostopa do interneta razen do nekaj razvijalskih storitev (npm, GitHub) — nima dostopa do žive strani v brskalniku niti do Stripe/Supabase REST API neposredno. Zato je bila vsa koda preverjena prek neposrednih poizvedb v bazo (SQL) in simuliranih posnetkov zaslona (Playwright z lažnimi podatki), resnično testiranje v živo (klikanje po pravi strani, pravi Stripe checkout) pa mora opraviti uporabnik sam na dejanskem deploy-u.
