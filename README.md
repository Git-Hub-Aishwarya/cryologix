# Cryologix

> India's reefer-freight marketplace for pharma & F&B cold chain.
> Built in 4 days at the **GrowthX AI Weekender** · April 2026.

**Live:** [cryologix.vercel.app](https://cryologix.vercel.app)

---

## What it is

Cryologix is a two-sided marketplace connecting pharma, F&B, biotech, and CRO shippers with verified reefer fleet operators across India.

A shipper posts a load with lane, temperature, load, and pickup date. A matching engine scores every reefer on the network across nine factors — exact lane, pincode area, capacity fit, temperature compatibility, date proximity, estimated price, backhaul opportunity, partial-corridor overlap, and verified-carrier status — and returns the top eight matches with explainable **reason chips** so the shipper sees *why* each truck ranked where it did.

The shipper picks a match, enters email + phone + their ask price, and submits a bid. The fleet operator gets the bid in their inbox; the bidder gets an instant copy back. A 24-hour response window is built in.

---

## How to run locally

No build step. No dependencies. Static site.

```bash
python -m http.server 8080
# open http://localhost:8080
```

---

## What's in this repo

| File | Purpose |
|---|---|
| `index.html` | Landing page — hero, two ways, animated demo, Why Cryologix, Two sides, Roadmap |
| `match.html` | Matching flow — requirement form, ranked match cards, bid modal |
| `match.js` | Matching engine — full V1.1 scoring rubric (lane / capacity / temperature / date / price / backhaul / verified) |
| `seed-data.js` | 12-truck demo network across India's pharma corridors |
| `match-cards.js` | Match card UI + bid modal + EmailJS dual-email integration |
| `blog-missing-94-minutes.html` | Long-form: the ₹3.2 cr biologics excursion case |
| `blog-eight-empty-pallets.html` | Long-form: the backhaul gap on Indian reefer corridors |
| `Cryologix Scope V1.1.docx` | Full V1.1 scope document — marketplace specification |

---

## Stack

- Plain HTML, CSS, vanilla JavaScript — no framework, no build step
- **Inter** + **JetBrains Mono** via Google Fonts
- **EmailJS** for dual-email integration (operator notification + bidder autoresponse)
- **Vercel** for hosting

---

## Honest scope

The truck listings and the network counts on the landing page are **sample data** while the first cohort of operators is being onboarded. The matching engine, the bid flow, and the email loop are **all real and functional** — three external bids were submitted by real people during the launch sprint. Email screenshots are part of the AI Weekender submission evidence.

---

## Why now

- **CDSCO 2024 GDP enforcement** is forcing audit-grade cold chain across pharma in India.
- **Post-COVID biologics + vaccine spend has doubled** — and the freight infrastructure is finally being built to match.
- Matching has been the missing layer. That's the gap Cryologix is built to close.

---

## License

MIT — see [`LICENSE`](./LICENSE).
