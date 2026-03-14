import "dotenv/config";
import { pool } from "./src/db/pool.js";
import crypto from "crypto";

const realCompanies = [
  {
    name: "Packpet Embalagens Indústria e Comércio Ltda",
    address: "Barueri, SP",
    phone: "(11) 2147-1400",
    website: "www.packpet.com.br",
    category: "Fabricante de Garrafas PET",
    city: "São Paulo",
    latitude: -23.5062,
    longitude: -46.8762,
    revenue_estimate: "Cap. Social: R$ 360.000,00",
    business_type: "B2B"
  },
  {
    name: "Masterflake Indústria de Plásticos",
    address: "Guaíba, RS",
    phone: "(51) 3248-0555",
    website: "https://masterflake.com.br",
    category: "Reciclagem e Embalagens PET",
    city: "Porto Alegre",
    latitude: -30.1136,
    longitude: -51.3251,
    revenue_estimate: "Pequeno/Médio Porte",
    business_type: "B2B"
  },
  {
    name: "Amam Embalagens de Madeira",
    address: "São Bernardo do Campo, SP",
    phone: "(11) 4347-7513",
    website: "www.amam.com.br",
    category: "Embalagens de Madeira p/ Exportação",
    city: "São Paulo",
    latitude: -23.6944,
    longitude: -46.5654,
    revenue_estimate: "Empresa de Exportação",
    business_type: "B2B"
  },
  {
    name: "Embpauli",
    address: "Guarulhos, SP",
    phone: "(11) 2484-4000",
    website: "embpauli.com.br",
    category: "Paletes e Caixas de Madeira",
    city: "São Paulo",
    latitude: -23.4542,
    longitude: -46.5333,
    revenue_estimate: "Médio Porte",
    business_type: "B2B"
  },
  {
    name: "Qualypack Embalagens de Madeira",
    address: "Nova Santa Rita, RS",
    phone: "(51) 99911-5266",
    website: "qualypack.com.br",
    category: "Embalagens p/ Transporte",
    city: "Porto Alegre",
    latitude: -29.8569,
    longitude: -51.2725,
    revenue_estimate: "Especialista Logística",
    business_type: "B2B"
  },
  {
    name: "Globo Embalagens",
    address: "Tatuapé, São Paulo, SP",
    phone: "(11) 2671-8680",
    website: "www.globoembalagens.com.br",
    category: "Sacos Plásticos e Ração",
    city: "São Paulo",
    latitude: -23.5407,
    longitude: -46.5768,
    revenue_estimate: "Fabricante Especializado",
    business_type: "B2B"
  },
  {
    name: "Moinhos Vieira",
    address: "Tatuí, SP",
    phone: "(15) 3251-0810",
    website: "moinhosvieira.com.br",
    category: "Máquinas e Embalagens Ração",
    city: "São Paulo",
    latitude: -23.3551,
    longitude: -47.8436,
    revenue_estimate: "Cap. Social: R$ 120.000,00",
    business_type: "B2B"
  }
];

async function seed() {
  console.log("Starting seeding real data...");
  for (const comp of realCompanies) {
    try {
      await pool.query(
        `INSERT INTO companies (id, name, address, phone, website, category, city, latitude, longitude, revenue_estimate, business_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          crypto.randomUUID(),
          comp.name,
          comp.address,
          comp.phone,
          comp.website,
          comp.category,
          comp.city,
          comp.latitude,
          comp.longitude,
          comp.revenue_estimate,
          comp.business_type
        ]
      );
      console.log(`Seeded: ${comp.name}`);
    } catch (err) {
      console.error(`Error seeding ${comp.name}:`, err);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
