import { buildProduct, linkRelated, type SeedProduct } from "./_factory";
import { refrigerateurs } from "./refrigerateurs";
import { laveLinge } from "./lave-linge";
import { laveVaisselle } from "./lave-vaisselle";
import { cuisinieres } from "./cuisinieres-four";
import { microOndes } from "./micro-ondes";
import { climatiseurs } from "./climatiseurs";
import { televiseurs } from "./televiseurs";
import { aspirateurs } from "./aspirateurs";
import { petitsElectromenagers } from "./petits-electromenagers";
import { machinesACafe } from "./machines-a-cafe";
import { mixeursRobots } from "./mixeurs-robots";
import { chauffageVentilation } from "./chauffage-ventilation";

/**
 * DEMO CATALOG — 72 fictional products across the 12 categories.
 * Names, brands, prices, ratings and specifications are illustrative only and
 * must not be read as real commercial data.
 */
const seed: SeedProduct[] = [
  ...refrigerateurs,
  ...laveLinge,
  ...laveVaisselle,
  ...cuisinieres,
  ...microOndes,
  ...climatiseurs,
  ...televiseurs,
  ...aspirateurs,
  ...petitsElectromenagers,
  ...machinesACafe,
  ...mixeursRobots,
  ...chauffageVentilation,
];

export const seedProducts = linkRelated(seed.map(buildProduct));
