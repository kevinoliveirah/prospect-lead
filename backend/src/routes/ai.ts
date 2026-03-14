import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";

const router = Router();

const prospectSchema = z.object({
  company_name: z.string().min(2),
  category: z.string().optional(),
  notes: z.string().optional()
});

router.post("/prospect", requireAuth, async (req, res, next) => {
  try {
    const data = prospectSchema.parse(req.body);

    if (!env.GEMINI_API_KEY) {
      return res.json({
        source: "fallback",
        suggestion: buildFallbackMessage(data)
      });
    }

    try {
      const suggestion = await generateGeminiMessage(data);
      return res.json({ source: "gemini", suggestion });
    } catch {
      return res.json({
        source: "fallback",
        suggestion: buildFallbackMessage(data)
      });
    }
  } catch (err) {
    return next(err);
  }
});

function buildFallbackMessage(data: {
  company_name: string;
  category?: string;
  notes?: string;
}) {
  const segment = data.category
    ? `no setor de ${data.category}`
    : "no seu segmento";
  const notes = data.notes ? ` Notei: ${data.notes}.` : "";
  return `Ola, vi que a ${data.company_name} atua ${segment}. Tenho uma solucao para ajudar sua equipe a gerar mais oportunidades comerciais.${notes} Podemos conversar?`;
}

async function generateGeminiMessage(data: {
  company_name: string;
  category?: string;
  notes?: string;
}) {
  const prompt = `Crie uma mensagem curta de prospeccao B2B. Empresa: ${data.company_name}. Segmento: ${data.category ?? "nao informado"}. Observacoes: ${data.notes ?? ""}. Tom: consultivo, direto e educado.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 240
        }
      })
    }
  );

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const suggestion = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!suggestion) {
    throw new Error("Gemini response empty");
  }

  return suggestion.trim();
}

// Keyword-based pre-classifier — works as fallback or initial hint
function keywordClassify(name: string, category?: string): "B2B" | "B2C" | "Both" | null {
  const text = `${name} ${category ?? ""}`.toLowerCase();

  const b2bKeywords = [
    "indústria", "industria", "industrial", "fábrica", "fabrica", "manufatura",
    "atacado", "atacadista", "distribuidora", "distribuidor", "fornecedor",
    "metalúrgica", "metalurgica", "metalurgia", "siderurgia", "fundição", "fundicao",
    "embalagem", "embalagens", "papelão", "papelao", "plástico", "plastico",
    "química", "quimica", "petroquímica", "petroquimica", "fertilizante",
    "agro", "agropecuária", "agropecuaria", "cooperativa", "armazém", "armazem",
    "logística", "logistica", "transportadora", "transporte de cargas", "frota",
    "engenharia", "construção civil", "construcao civil", "construtora", "incorporadora",
    "manutenção industrial", "manutencao", "automação", "automacao", "robótica", "robotica",
    "ferramentaria", "usinagem", "tornearia", "soldagem", "caldeiraria",
    "têxtil", "textil", "confecção", "confeccao", "fiação", "fiao",
    "laboratório", "laboratorio", "insumos", "componentes", "peças", "pecas",
    "b2b", "corporate", "enterprise", "wholesale", "trading"
  ];

  const b2cKeywords = [
    "loja", "varejo", "varejista", "boutique", "magazine",
    "restaurante", "lanchonete", "pizzaria", "hamburgueria", "churrascaria",
    "supermercado", "mercado", "mercearia", "hortifruti",
    "farmácia", "farmacia", "drogaria",
    "salão", "salao", "barbearia", "estética", "estetica", "spa", "nail",
    "academia", "fitness", "musculação", "musculacao",
    "escola", "colégio", "colegio", "creche", "day care",
    "pet shop", "clínica veterinária", "clinica veterinaria",
    "ótica", "otica", "óculos", "oculos",
    "brechó", "brecho", "outlet",
    "padaria", "confeitaria", "doceria", "café", "cafe",
    "hotel", "pousada", "hostel", "airbnb",
    "bar ", "pub", "boate", "nightclub"
  ];

  const isB2B = b2bKeywords.some(k => text.includes(k));
  const isB2C = b2cKeywords.some(k => text.includes(k));

  if (isB2B && isB2C) return "Both";
  if (isB2B) return "B2B";
  if (isB2C) return "B2C";
  return null; // unknown — let AI decide
}

export async function classifyCompany(data: {
  name: string;
  category?: string;
  address?: string;
}) {
  // 1. Try keyword-based classification first
  const keywordResult = keywordClassify(data.name, data.category);

  if (!env.GEMINI_API_KEY) {
    // No AI — use keyword result or default to B2B (industrial prospecting tool)
    return { type: keywordResult ?? "B2B", revenue: "N/A" };
  }

  const prompt = `Classifique esta empresa como 'B2B', 'B2C' ou 'Both' e estime o faturamento anual em R$.

Critérios:
- B2B: indústrias, fábricas, distribuidoras, atacadistas, fornecedores industriais, transportadoras de carga, empresas de serviços para empresas.
- B2C: lojas de varejo, restaurantes, supermercados, farmácias, serviços ao consumidor final (salão, academia, escola, pet shop).
- Both: empresas que atendem ambos (ex: distribuidora que também vende ao público).

Empresa: ${data.name}
Categoria: ${data.category ?? "Não informada"}
Endereço: ${data.address ?? "Não informado"}
${keywordResult ? `\nDica por palavras-chave: provável ${keywordResult}` : ""}

Retorne apenas um JSON: {"type": "B2B" | "B2C" | "Both", "revenue": "valor estimado em R$"}.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 120,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const payload = (await response.json()) as any;
    const jsonStr = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonStr) throw new Error("Empty AI response");

    const result = JSON.parse(jsonStr);
    return {
      type: (result.type as string) || keywordResult || "B2B",
      revenue: (result.revenue as string) || "Sob consulta"
    };
  } catch (err) {
    console.error("AI Classification Error:", err);
    // Fall back to keyword result or B2B
    return { type: keywordResult ?? "B2B", revenue: "Estimativa indisponível" };
  }
}

export default router;
