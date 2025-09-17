
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
