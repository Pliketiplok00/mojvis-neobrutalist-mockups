# MOJ VIS — COLOR RULEBOOK

Kompletna specifikacija svih pravila korištenja boja u aplikaciji.

---

## 🎨 OSNOVNA PRAVILA

### Zlatno pravilo

> **NIKADA ne koristi direktne boje u komponentama.**  
> Uvijek koristi semantičke tokene definirane u design sistemu.

```tsx
// ❌ KRIVO
<div className="bg-blue-500 text-white">

// ✅ ISPRAVNO
<div className="bg-primary text-primary-foreground">
```

### HSL Format

Sve boje MORAJU biti definirane u HSL formatu:

```css
--primary: 198 93% 40%;  /* H S% L% - bez hsl() wrappera */
```

---

## 🌈 PALETA BOJA

### Primarne boje

| Token | HSL Light Mode | HSL Dark Mode | Namjena |
|-------|----------------|---------------|---------|
| `--primary` | `198 93% 40%` | `198 93% 50%` | Glavne akcije, linkovi, primarni UI elementi |
| `--secondary` | `82 60% 45%` | `82 60% 55%` | Sekundarne akcije, uspješna stanja |
| `--accent` | `45 100% 51%` | `45 100% 55%` | Isticanje, privlačenje pažnje |

### Proširena Mediteranska paleta

| Token | HSL Light Mode | HSL Dark Mode | Namjena |
|-------|----------------|---------------|---------|
| `--terracotta` | `15 65% 55%` | `15 65% 60%` | Topli akcenti, dekorativno |
| `--lavender` | `270 50% 70%` | `270 50% 75%` | Meki akcenti, pozadine |
| `--orange` | `25 95% 55%` | `25 95% 60%` | Upozorenja, isticanje |
| `--teal` | `175 60% 40%` | `175 60% 50%` | Info stanja, transport |
| `--pink` | `350 60% 65%` | `350 60% 70%` | Meki akcenti, dekorativno |

### Semantičke boje

| Token | Tailwind klasa | Namjena |
|-------|----------------|---------|
| `--background` | `bg-background` | Pozadina stranica |
| `--foreground` | `text-foreground` | Primarni tekst |
| `--card` | `bg-card` | Pozadina kartica |
| `--card-foreground` | `text-card-foreground` | Tekst u karticama |
| `--muted` | `bg-muted` | Prigušene pozadine, disabled stanja |
| `--muted-foreground` | `text-muted-foreground` | Sekundarni tekst, placeholderi |
| `--destructive` | `bg-destructive` | Greške, opasne akcije, upozorenja |
| `--destructive-foreground` | `text-destructive-foreground` | Tekst na destructive pozadini |
| `--border` | `border-border` | Sve granice, divideri |
| `--input` | `bg-input` | Pozadina input polja |
| `--ring` | `ring-ring` | Focus prsteni |

---

## 🏠 KORIŠTENJE PO KONTEKSTU

### Header komponenta

```
Hamburger menu gumb:
- Pozadina: bg-accent (žuta)
- Granica: border-foreground
- Ikona: text-foreground

Inbox gumb:
- Pozadina: bg-primary (plava)
- Granica: border-foreground
- Ikona: text-primary-foreground (bijela)

Badge notifikacija:
- Pozadina: bg-destructive (crvena)
- Tekst: text-destructive-foreground
- Granica: border-foreground
```

### Main Menu - Navigacijske kategorije

Svaka kategorija ima JEDINSTVENU boju za vizualnu distinkciju:

| Kategorija | Pozadinska boja | Klasa |
|------------|-----------------|-------|
| Inbox / Poruke | Primary (plava) | `bg-primary` |
| Events / Događanja | Accent (žuta) | `bg-accent` |
| Transport Hub | Teal | `bg-teal` |
| Feedback | Lavender (ljubičasta) | `bg-lavender` |
| Click & Fix | Orange (narančasta) | `bg-orange` |
| Flora | Secondary (zelena) | `bg-secondary` |
| Fauna | Secondary | `bg-secondary` |
| Info | Terracotta | `bg-terracotta` |
| Settings | Pink | `bg-pink` |

**PRAVILO:** Nikad nemoj imati dvije uzastopne stavke iste boje!

### Home Page - Quick Access kategorije

| Kategorija | Pozadinska boja | Tekst boja |
|------------|-----------------|------------|
| Transport | `bg-primary` | `text-primary-foreground` |
| Događanja | `bg-accent` | `text-foreground` |
| Feedback | `bg-lavender` | `text-foreground` |
| Click & Fix | `bg-orange` | `text-foreground` |

### Kartice i liste

```
Standardna kartica:
- Pozadina: bg-card
- Granica: border-border
- Sjena: shadow-neo (koristi border boju)

Interaktivna kartica (hover):
- Transform: translate(-1px, -1px)
- Sjena: povećaj offset za 1px
```

---

## 🎯 PRAVILA KONTRASTA

### Tekst na pozadinama

| Pozadina | Boja teksta | Razlog |
|----------|-------------|--------|
| `bg-primary` | `text-primary-foreground` | Bijeli tekst na plavoj |
| `bg-secondary` | `text-secondary-foreground` | Tamni tekst na zelenoj |
| `bg-accent` | `text-foreground` | Tamni tekst na žutoj |
| `bg-destructive` | `text-destructive-foreground` | Bijeli tekst na crvenoj |
| `bg-muted` | `text-muted-foreground` | Sivi tekst |
| `bg-background` | `text-foreground` | Standardni tamni tekst |

### WCAG AA Standardi

- **Minimalni kontrast:** 4.5:1 za normalni tekst
- **Minimalni kontrast:** 3:1 za veliki tekst (18px+)
- Svi parovi boja u paleti su testirani i prolaze standarde

---

## 🖌️ SJENE (SHADOWS)

Sjene u neobrutalizmu koriste BOJE, ne transparentnost:

| Klasa | Definicija | Boja sjene |
|-------|------------|------------|
| `shadow-neo` | `4px 4px 0 0` | `hsl(var(--border))` |
| `shadow-neo-lg` | `6px 6px 0 0` | `hsl(var(--border))` |
| `shadow-neo-primary` | `4px 4px 0 0` | `hsl(var(--primary))` |
| `shadow-neo-accent` | `4px 4px 0 0` | `hsl(var(--accent))` |
| `shadow-neo-secondary` | `4px 4px 0 0` | `hsl(var(--secondary))` |

**PRAVILO:** Sjene su uvijek solid (bez blur-a), offset uvijek dolje-desno.

---

## ⚠️ STANJA (STATES)

### Loading stanje

```tsx
<div className="text-muted-foreground">Učitavanje...</div>
<div className="bg-muted animate-pulse" /> // skeleton
```

### Error stanje

```tsx
<div className="text-destructive">Greška!</div>
<div className="border-destructive bg-destructive/10">Error container</div>
```

### Disabled stanje

```tsx
<button className="bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
  Onemogućeno
</button>
```

### Focus stanje

```tsx
<input className="focus:ring-2 focus:ring-primary focus:ring-offset-2" />
```

---

## 🌙 DARK MODE

Dark mode automatski mijenja vrijednosti tokena. Komponente NE trebaju posebnu logiku:

```tsx
// Ovo automatski radi u oba moda:
<div className="bg-background text-foreground">
```

### Dark mode prilagodbe

- Lightness (L) vrijednosti se povećavaju za ~10%
- Pozadine postaju tamne, tekst postaje svijetao
- Sjene ostaju iste (border boja)

---

## ✅ DO's

1. **Koristi semantičke tokene** - `bg-primary`, `text-foreground`
2. **Koristi -foreground parove** - `bg-primary` + `text-primary-foreground`
3. **Definiraj boje u HSL** - `198 93% 40%`
4. **Testiraj kontrast** - WCAG AA minimum
5. **Koristi shadow-neo klase** - za konzistentne sjene

## ❌ DON'Ts

1. **Nikad arbitrary boje** - ~~`bg-blue-500`~~, ~~`text-gray-700`~~
2. **Nikad hex ili rgb** - ~~`#0088cc`~~, ~~`rgb(0,136,204)`~~
3. **Nikad blur sjene** - ~~`shadow-lg`~~, ~~`shadow-md`~~
4. **Nikad opacity za sjene** - ~~`shadow-black/20`~~
5. **Nikad hardcode light/dark** - ~~`dark:bg-gray-800`~~

---

## 📁 REFERENCE

- **CSS Varijable:** Definirane u `src/index.css` (`:root` i `.dark`)
- **Tailwind Config:** `tailwind.config.ts` → `theme.extend.colors`
- **Komponente:** `src/components/ui/` koriste tokene
- **Layout:** `src/components/layout/` koriste tokene

---

## 🔧 DODAVANJE NOVE BOJE

Ako trebaš novu boju:

### 1. Definiraj u index.css

```css
:root {
  --nova-boja: 180 50% 45%;
}

.dark {
  --nova-boja: 180 50% 55%;
}
```

### 2. Dodaj u tailwind.config.ts

```ts
colors: {
  'nova-boja': 'hsl(var(--nova-boja))',
}
```

### 3. Koristi u komponenti

```tsx
<div className="bg-nova-boja">
```

---

*Dokument verzija: 1.0*  
*Zadnje ažuriranje: Siječanj 2026*
