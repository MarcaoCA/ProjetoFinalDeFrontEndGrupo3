// script.js
// Calculadora nutricional - Lógica principal

const form = document.getElementById("calc-form");
let dadosCalculados = {};

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Captura dados do formulário
  const genero = document.querySelector('input[name="genero"]:checked').value;
  const idade = parseInt(document.getElementById("idade").value);
  const pesoValue = document.getElementById("peso").value;
  const peso = parseFloat(pesoValue.replace(",", "."));
  const altura = parseInt(document.getElementById("altura").value);
  const fatorAtividade = parseFloat(document.getElementById("atividade").value);
  const objetivo = document.getElementById("objetivo").value;

  // Validação básica
  if (
    isNaN(idade) ||
    isNaN(peso) ||
    isNaN(altura) ||
    idade <= 0 ||
    peso <= 0 ||
    altura <= 0
  ) {
    alert("Por favor, preencha todos os campos com valores válidos.");
    return;
  }

  // Cálculo da Taxa Metabólica Basal
  let tmb;
  if (genero === "masculino") {
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
  }

  // Gasto Energético Total
  const gastoEnergeticoTotal = tmb * fatorAtividade;

  // Ajuste por objetivo
  let caloriasFinais;
  if (objetivo === "cutting") {
    caloriasFinais = gastoEnergeticoTotal - 400;
  } else if (objetivo === "bulking") {
    caloriasFinais = gastoEnergeticoTotal + 400;
  } else {
    caloriasFinais = gastoEnergeticoTotal;
  }

  // Distribuição de macros
  const proteinasGramas = peso * 2;
  const gordurasGramas = peso * 1;
  const carboidratosCalorias =
    caloriasFinais - proteinasGramas * 4 - gordurasGramas * 9;
  const carboidratosGramas = carboidratosCalorias / 4;

  // Armazena resultados
  dadosCalculados = {
    calorias: caloriasFinais.toFixed(0),
    proteinas: proteinasGramas.toFixed(0),
    carboidratos: carboidratosGramas.toFixed(0),
    gorduras: gordurasGramas.toFixed(0),
    objetivo: objetivo,
  };

  // Exibe resultados
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = `
        <h2>Seu Resultado:</h2>
        <p><strong>Calorias para o seu objetivo:</strong> ${dadosCalculados.calorias} kcal/dia</p>
        <h3>Distribuição de Macros:</h3>
        <p><strong>Proteínas:</strong> ${dadosCalculados.proteinas}g</p>
        <p><strong>Carboidratos:</strong> ${dadosCalculados.carboidratos}g</p>
        <p><strong>Gorduras:</strong> ${dadosCalculados.gorduras}g</p>
        
        <button id="gerar-dieta-btn" class="dieta-button">
            Quero receber minha dieta com base nesses dados
        </button>
        <div id="dieta-resultado">Carregando sua dieta...</div>
    `;
  document.getElementById("dieta-resultado").style.display = "none";
  resultadoDiv.classList.remove("hidden");

  document
    .getElementById("gerar-dieta-btn")
    .addEventListener("click", gerarDieta);
});

// Geração de dieta via API
async function gerarDieta() {
  const btn = document.getElementById("gerar-dieta-btn");
  const resultadoDietaDiv = document.getElementById("dieta-resultado");

  resultadoDietaDiv.style.display = "block";
  resultadoDietaDiv.textContent = "Gerando sua dieta, por favor aguarde...";
  btn.disabled = true;

  const backendUrl = "http://localhost:3000/api/gerar-dieta";

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosCalculados),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Houve um problema no servidor.");
    }

    const data = await response.json();
    resultadoDietaDiv.textContent = data.dieta;
  } catch (error) {
    resultadoDietaDiv.textContent =
      "Desculpe, ocorreu um erro: " + error.message;
  } finally {
    btn.style.display = "none";
  }
}
