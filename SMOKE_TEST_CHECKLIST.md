# MOJ VIS - SMOKE TEST CHECKLIST
**Datum testiranja**: ____________
**Tester**: ____________
**Verzija**: ____________ (git SHA)
**Uređaj**: ____________

---

## ONBOARDING FLOW

- [ ] App se otvara bez crasha
- [ ] Language selection screen se prikazuje
- [ ] Odabir HR jezika radi
- [ ] Odabir EN jezika radi
- [ ] User mode selection se prikazuje
- [ ] "Posjetitelj" opcija radi
- [ ] "Lokalac" opcija radi
- [ ] Municipality selection se prikazuje (samo za lokalca)
- [ ] Odabir "Vis" radi
- [ ] Odabir "Komiža" radi
- [ ] Onboarding završava na Home screenu

## HOME SCREEN

- [ ] Home screen se renderira bez greške
- [ ] Banner se prikazuje (ako postoji aktivan)
- [ ] Hamburger menu ikona je vidljiva
- [ ] Inbox ikona je vidljiva
- [ ] Tap na hamburger otvara menu overlay

## NAVIGACIJA (Menu)

- [ ] Menu overlay se otvara
- [ ] Menu overlay se zatvara (X ili swipe)
- [ ] "Početna" vodi na Home
- [ ] "Događanja" vodi na Events
- [ ] "Cestovni prijevoz" vodi na Road Transport
- [ ] "Pomorski prijevoz" vodi na Sea Transport
- [ ] "Povratne informacije" vodi na Feedback
- [ ] "Slikaj i popravi" vodi na Click & Fix
- [ ] "Flora" vodi na Flora screen
- [ ] "Fauna" vodi na Fauna screen
- [ ] "Javne usluge" vodi na Services
- [ ] "Postavke" vodi na Settings

## TRANSPORT - CESTOVNI

- [ ] Lista linija se učitava
- [ ] Linije se prikazuju s ispravnim podacima
- [ ] Tap na liniju otvara Line Detail
- [ ] Line Detail prikazuje polaske
- [ ] Expand departure prikazuje međustanice
- [ ] Back button vraća na listu

## TRANSPORT - POMORSKI

- [ ] Lista linija se učitava
- [ ] Trajekt linije se prikazuju
- [ ] Katamaran linije se prikazuju
- [ ] Tap na liniju otvara Line Detail
- [ ] Line Detail prikazuje polaske za odabrani datum
- [ ] Promjena datuma mijenja polaske
- [ ] Seasonal badge se prikazuje ako je relevantno
- [ ] Back button vraća na listu

## EVENTS (Događanja)

- [ ] Kalendar se prikazuje
- [ ] Danas je označen
- [ ] Datumi s događanjima su označeni (dots)
- [ ] Tap na datum prikazuje događanja za taj dan
- [ ] Tap na event otvara Event Detail
- [ ] Event Detail prikazuje sve informacije
- [ ] Back button radi

## INBOX

- [ ] Inbox lista se učitava
- [ ] Poruke se prikazuju
- [ ] Tag filteri rade (ako postoje)
- [ ] Tap na poruku otvara detail
- [ ] Back button radi
- [ ] Unread badge se ažurira

## FEEDBACK FORMA

- [ ] Forma se otvara
- [ ] Sva polja su dostupna
- [ ] Validacija radi (prazna polja)
- [ ] Submit šalje podatke
- [ ] Confirmation screen se prikazuje
- [ ] Može se vratiti na Home

## CLICK & FIX (Slikaj i popravi)

- [ ] Forma se otvara
- [ ] Lokacija picker radi
- [ ] Kamera/gallery picker radi
- [ ] Opis polje radi
- [ ] Submit šalje podatke
- [ ] Confirmation screen se prikazuje

## SETTINGS

- [ ] Settings screen se otvara
- [ ] Trenutni jezik je označen
- [ ] Promjena jezika mijenja UI
- [ ] Promjena općine radi (ako je lokalac)
- [ ] Push notification toggle radi

## EDGE CASES

- [ ] Offline mode: App prikazuje poruku, ne crasha
- [ ] Pull-to-refresh radi na listama
- [ ] Empty states se prikazuju kad nema podataka
- [ ] Error states se prikazuju kad API ne radi

## PERZISTENCIJA

- [ ] Zatvori app POTPUNO (swipe away)
- [ ] Otvori app ponovno
- [ ] Jezik je sačuvan
- [ ] User mode je sačuvan
- [ ] Općina je sačuvana (ako lokalac)
- [ ] NIJE potreban ponovni onboarding

---

## REZULTAT

**Prolaznost**: _____ / _____ checkova

**Kritični bugovi pronađeni**:
1.
2.
3.

**Manji problemi**:
1.
2.
3.

**VERDIKT**: [ ] PASS  [ ] FAIL

**Potpis testera**: ____________
**Datum**: ____________
