
# Sistema di Gestione Scuola di Danza

Un sistema completo di gestione per scuole di danza basato su architettura a microservizi, progettato per essere scalabile, sicuro e facilmente manutenibile.

## 🏗️ Architettura

### Microservizi

- **API Gateway** (Node.js/Express): Punto di ingresso unico, autenticazione, rate limiting
- **User Service** (Node.js/Prisma): Gestione utenti, autenticazione, profili
- **Course Service** (Node.js/Prisma): Gestione corsi, stili di danza, programmazione
- **Booking Service** (Node.js/Prisma): Prenotazioni, gestione posti, calendario
- **Payment Service** (Node.js/Stripe): Pagamenti, fatturazione, abbonamenti
- **Notification Service** (Node.js): Email, SMS, notifiche push

### Frontend
- **Next.js 13** con TypeScript
- **Tailwind CSS** per lo styling
- **Framer Motion** per animazioni
- **React Query** per state management
- **Socket.io** per aggiornamenti real-time

### Infrastruttura
- **PostgreSQL** (database per servizio)
- **Redis** (cache e sessioni)
- **RabbitMQ** (message broker)
- **Docker** (containerizzazione)

## 🚀 Avvio rapido

```bash
docker-compose up -d --build
```

- Frontend: http://localhost
- API Gateway: http://localhost:3000
- RabbitMQ: http://localhost:15672 (admin/password)


# Dance School Management

Progetto Next.js + Tailwind per la gestione di una scuola di danza.

## Funzionalità

- Dashboard con riepilogo lezioni e corsi
- Hero section con immagine e call to action
- Autenticazione (in sviluppo)
- Gestione corsi e prenotazioni

## Setup

1. Clona il repository
2. Installa le dipendenze con `npm install` o `yarn`
3. Avvia il progetto con `npm run dev` o `yarn dev`
4. Apri `http://localhost:3000` nel browser

## Tecnologie

- Next.js
- Tailwind CSS
- TypeScript

## Contribuire

Apri una pull request o issue per proporre modifiche o segnalare problemi.
