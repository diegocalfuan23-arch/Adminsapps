# Panel

Monitoreo interno de mis productos, en un solo lugar:

- **FacilAgua** — SaaS para comités de Agua Potable Rural chilenos.
- **mecanicoapp** — SaaS para talleres mecánicos.

## Cómo funciona

Lee las bases de datos de ambos productos en **solo lectura** (garantizado
por Postgres, no por convención) y tiene su propia base para lo que necesita
guardar el panel.

Acceso de un solo usuario: el registro está cerrado y solo el correo en
`CORREO_AUTORIZADO` puede tener cuenta.

## Desarrollo

```bash
bun install
cp .env.example .env.local   # completar las variables
bun run db:push              # crear las tablas del panel
bun run dev
```

Para comprobar que las conexiones funcionan y que las bases de los productos
están protegidas contra escritura:

```bash
bun --env-file=.env.local scripts/verificar-conexiones.ts
bun --env-file=.env.local scripts/verificar-solo-lectura.ts
```
