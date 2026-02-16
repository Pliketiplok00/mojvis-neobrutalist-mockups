# MOJ VIS - SMOKE TEST CHECKLIST
**Datum testiranja**: ____________
**Tester**: ____________
**Verzija**: ____________ (git SHA)
**Uređaj**: ____________

---

## ONBOARDING FLOW

- [✓ ] App se otvara bez crasha
- [✓ ] Language selection screen se prikazuje
- [✓ ] Odabir HR jezika radi
- [- ] Odabir EN jezika radi
-  evo popis screenova gdje se unatoc odabranom engleskom prikazuje sadrzaj na hrvatski:
1 - menu, 2- date & time u vecini instanci (ali ne u svima), 3- inbox messages, 4-event i event details. 5- javne usluge, 6-flora&fauna hub
- [✓ ] User mode selection se prikazuje
- [✓ ] "Posjetitelj" opcija radi
- [✓ ] "Lokalac" opcija radi
- [✓ ] Municipality selection se prikazuje (samo za lokalca)
- [✓ ] Odabir "Vis" radi
- [✓ ] Odabir "Komiža" radi
- [✓ ] Onboarding završava na Home screenu

## HOME SCREEN

- [✓ ] Home screen se renderira bez greške
- [✓ ] Banner se prikazuje (ako postoji aktivan)
- [✓ ] Hamburger menu ikona je vidljiva
- [✓ ] Inbox ikona je vidljiva
- [✓ ] Tap na hamburger otvara menu overlay

## NAVIGACIJA (Menu)

- [✓ ] Menu overlay se otvara
- [✓ ] Menu overlay se zatvara (X ili swipe)
- [✓ ] "Početna" vodi na Home
- [✓ ] "Događanja" vodi na Events
- [- ] "Cestovni prijevoz" vodi na Road Transport
- [- ] "Pomorski prijevoz" vodi na Sea Transport
- cestovni i pomorski prijevoz su zamijenjeni jednim linkom, transport hubom "vozni redovi"
- [✓] "Povratne informacije" vodi na Feedback
- [✓ ] "Slikaj i popravi" vodi na Click & Fix
- [- ] "Flora" vodi na Flora screen
- [- ] "Fauna" vodi na Fauna screen
- isto kao kod cestovnog i prometnog - sad su flora&fauna hub
- [✓ ] "Javne usluge" vodi na Services
- [✓ ] "Postavke" vodi na Settings

## TRANSPORT - CESTOVNI

- [✓ ] Lista linija se učitava
- [✓ ] Linije se prikazuju s ispravnim podacima
- [✓ ] Tap na liniju otvara Line Detail
- [✓ ] Line Detail prikazuje polaske
- [✓ ] Expand departure prikazuje međustanice
- [✓ ] Back button vraća na listu

## TRANSPORT - POMORSKI

- [✓ ] Lista linija se učitava
- [✓ ] Trajekt linije se prikazuju
- [✓ ] Katamaran linije se prikazuju
- [✓ ] Tap na liniju otvara Line Detail
- [✓ ] Line Detail prikazuje polaske za odabrani datum
- [✓ ] Promjena datuma mijenja polaske
- [✓ ] Seasonal badge se prikazuje ako je relevantno
- [✓ ] Back button vraća na listu

## EVENTS (Događanja)

- [✓ ] Kalendar se prikazuje
- [x ] Danas je označen - nije, oznacen je sutrasnji datum. 
- [✓ ] Datumi s događanjima su označeni (dots)
- [✓ ] Tap na datum prikazuje događanja za taj dan
- [✓ ] Tap na event otvara Event Detail
- [✓ ] Event Detail prikazuje sve informacije
- [✓ ] Back button radi

## INBOX

- [✓ ] Inbox lista se učitava
- [✓ ] Poruke se prikazuju
- [✓ ] Tag filteri rade (ako postoje)
- poruke trenutno prikazuju po jednu ikonu jedne kategorije kojom su oznacene (a mogu iti s dvije), pa kad se filtrira, iako se filtrira točno, ikonice sugeriraju grešku, jer nedostaje i druga ikonica kategorije. moramo ju dodati. ako je poruka označena s "promet" i "hitno", mora prikazivati u sebi obje ikone / taga.
- [✓ ] Tap na poruku otvara detail
- [✓ ] Back button radi
- [✓ ] Unread badge se ažurira

## FEEDBACK FORMA

- [✓ ] Forma se otvara
- [✓ ] Sva polja su dostupna
- [✓ ] Validacija radi (prazna polja)
- [✓ ] Submit šalje podatke
- [✓ ] Confirmation screen se prikazuje
- [✓ ] Može se vratiti na Home

## CLICK & FIX (Slikaj i popravi)

- [✓ ] Forma se otvara
- [✓ ] Lokacija picker radi
- [✓ ] Kamera/gallery picker radi
- [✓ ] Opis polje radi
- [x ] Submit šalje podatke
- javlja network request failed, ali se svejedno spremi u inboxu pod poslane poruke, pa je nejasno sto se zbiva
- [x ] Confirmation screen se prikazuje

## SETTINGS

- [✓ ] Settings screen se otvara
- [✓ ] Trenutni jezik je označen
- [✓ ] Promjena jezika mijenja UI
- [✓ ] Promjena općine radi (ako je lokalac)
- [x ] Push notification toggle radi - uključen je, ali je disablean. mozda jer koristim ios simulator za testiranje, a ne pravi mob?

## EDGE CASES

- [- ] Offline mode: App prikazuje poruku, ne crasha
- nije mi dostupan offline mode, nisam mogla provjeriti
- [✓ ] Pull-to-refresh radi na listama
- [✓ ] Empty states se prikazuju kad nema podataka
- [✓ ] Error states se prikazuju kad API ne radi

## PERZISTENCIJA

- [✓ ] Zatvori app POTPUNO (swipe away)
- [✓ ] Otvori app ponovno
- [✓ ] Jezik je sačuvan
- [✓ ] User mode je sačuvan
- [✓ ] Općina je sačuvana (ako lokalac)
- [✓ ] NIJE potreban ponovni onboarding

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
