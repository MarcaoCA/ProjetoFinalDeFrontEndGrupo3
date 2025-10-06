// server.js
// Backend para integração com OpenAI

require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
const PORT = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// Endpoint para gerar dietas
app.post("/api/gerar-dieta", async (req, res) => {
  console.log("Recebido pedido para gerar dieta com os dados:", req.body);

  try {
    const { calorias, proteinas, carboidratos, gorduras, objetivo } = req.body;

    const prompt = `
      Crie 3 opções de dietas diárias distintas baseadas nestas metas:
      - Objetivo: ${objetivo}
      - Calorias: ${calorias} kcal/dia
      - Proteínas: ${proteinas}g
      - Carboidratos: ${carboidratos}g
      - Gorduras: ${gorduras}g

      Inclua 4-5 refeições por dia com quantidades aproximadas.
      Use alimentos comuns no Brasil.
      Mostre o resumo nutricional de cada opção.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dietaGerada = completion.choices[0].message.content;
    res.json({ dieta: dietaGerada });
  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    res
      .status(500)
      .json({ error: "Desculpe, não foi possível gerar a dieta no momento." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
