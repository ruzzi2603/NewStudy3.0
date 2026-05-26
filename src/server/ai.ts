/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Lecture } from "../types.js";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (
    !apiKey || 
    apiKey === "MY_GEMINI_API_KEY" || 
    apiKey === "dummy-key" || 
    apiKey === "your_gemini_api_key_here"
  ) {
    throw new Error(
      "A credencial GEMINI_API_KEY não foi configurada ou é inválida. Por favor, adicione uma chave de API válida no painel de Secrets nas Configurações do AI Studio."
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Utilitário de retry robusto com backoff exponencial para lidar com limites de requisição (429 ou 503).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 1500): Promise<T> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const errStr = String(err?.message || err?.status || err || "");
      const isRetryable =
        err?.status === 429 ||
        err?.status === 503 ||
        errStr.includes("503") ||
        errStr.includes("429") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("temporary") ||
        errStr.includes("Resource exhausted");

      if (attempt < retries && isRetryable) {
        console.warn(
          `[NewStudy Gemini Agent] Tentativa ${attempt} falhou com erro temporário: ${errStr}. Re-executando em ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      } else {
        throw err;
      }
    }
  }
  throw new Error("A requisição ao modelo Gemini falhou após todas as tentativas automáticas de correção.");
}

/**
 * Utiliza o Gemini para gerar materiais didáticos de altíssima qualidade em Português do Brasil com base no link/tema.
 */
export async function generateLectureStudyMaterial(
  url: string,
  topicHint: string
): Promise<Partial<Lecture>> {
  const client = getAiClient();

  const prompt = `
    Analise os seguintes detalhes do vídeo/assunto educacional fornecido e gere um material de estudo completo, estruturado e didático.
    URL do Conteúdo: ${url}
    Ideia Central do Tema ou Título: ${topicHint || "Assunto Acadêmico Geral"}

    Sua resposta DEVE ser estritamente em PORTUGUÊS DO BRASIL. Certifique-se de que os conceitos extraídos sejam densos, explicativos e acadêmicos. Fórmulas matemáticas devem usar a notação formal LaTeX sem delimitadores de cifrão externo nas descrições de blocos (ex: "E = mc^2" ou "\\Psi(x,t)").
  `;

  const response = await withRetry(() =>
    client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Você é um renomado designer pedagógico e professor universitário sênio brasileiro. Seu objetivo é estruturar materiais de estudo excepcionais baseados nos dados fornecidos pelo aluno.
TODO O MATERIAL DEVE SER ESCRITO EM PORTUGUÊS DO BRASIL (pt-BR). Forneça explicações acadêmicas robustas, segmentos de transcrição didáticos com timestamps realistas (ex: "01:20"), fórmulas úteis com variáveis e aplicações práticas correspondentes, flashcards desafiadores e questionários de múltipla escolha diagnósticos com justificativas detalhadas para as opções certas e erradas. Forneça o resultado exclusivamente no formato do esquema JSON solicitado.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "O título acadêmico oficial desta aula ou vídeo (em pt-BR).",
            },
            category: {
              type: Type.STRING,
              description: "Categoria ou disciplina científica, ex: Computação Quântica, Aprendizado de Máquina, Filosofia Antiga.",
            },
            moduleName: {
              type: Type.STRING,
              description: "Nome do curso ou módulo de pertencimento, ex: Engenharia Reativa, Física I.",
            },
            duration: {
              type: Type.STRING,
              description: "Duração aproximada plausível, ex: '34:20' ou '1:12:00'.",
            },
            summaryShort: {
              type: Type.STRING,
              description: "Uma única frase de resumo extremamente direta e impactante que destaca a principal lição do conteúdo.",
            },
            summaryFull: {
              type: Type.STRING,
              description: "Um resumo detalhado de múltiplos parágrafos descrevendo minuciosamente os temas debatidos (em pt-BR).",
            },
            learningObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 a 4 objetivos claros de aprendizagem ativa que o estudante dominará ao concluir.",
            },
            keyConcept: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "O conceito mais fundamental do conteúdo (pt-BR)." },
                body: { type: Type.STRING, description: "Explicação profunda deste conceito central." },
              },
              required: ["title", "body"],
            },
            transcriptionSegments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Carimbo de tempo no formato MM:SS, ex: '02:15'." },
                  text: { type: Type.STRING, description: "A transcrição explicativa daquilo que o instrutor debate neste ponto (pt-BR)." },
                },
                required: ["time", "text"],
              },
            },
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Nome da fórmula ou princípio matemático." },
                  latex: { type: Type.STRING, description: "Código LaTeX limpo, sem cifrões de marcação ($)." },
                  description: { type: Type.STRING, description: "O que a fórmula resolve ou significa." },
                  variables: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "O símbolo da variável isolada, ex: '\\theta'." },
                        explanation: { type: Type.STRING, description: "O significado didático desta variável na equação." },
                      },
                      required: ["name", "explanation"],
                    },
                  },
                  application: { type: Type.STRING, description: "Casos de aplicação e impacto." },
                },
                required: ["title", "latex", "description"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "A pergunta conceitual do cartão (pt-BR)." },
                  answer: { type: Type.STRING, description: "A resposta detalhada correspondente de fixação ativa." },
                },
                required: ["question", "answer"],
              },
            },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "A pergunta diagnóstica para avaliar a retenção (pt-BR)." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exatamente 3 alternativas plausíveis e distintas entre si.",
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: "Índice (base zero) correpondente à resposta correta na lista de opções." },
                  explanation: { type: Type.STRING, description: "Explicação profunda do motivo pelo qual a opção correta está certa e os distratores estão errados." },
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"],
              },
            },
          },
          required: [
            "title",
            "category",
            "moduleName",
            "duration",
            "summaryShort",
            "summaryFull",
            "learningObjectives",
            "keyConcept",
            "transcriptionSegments",
            "formulas",
            "flashcards",
            "quizzes",
          ],
        },
      },
    })
  );

  const rawText = response.text || "{}";
  try {
    return JSON.parse(rawText.trim());
  } catch (err) {
    console.error("Erro ao analisar a resposta JSON do Gemini:", rawText, err);
    throw new Error("Não foi possível processar a estrutura JSON pedagógica gerada pela inteligência artificial.");
  }
}

/**
 * Responde dúvidas integradas sobre o material de estudo contextualmente em pt-BR.
 */
export async function askQuestionAboutLecture(
  lecture: Lecture,
  question: string,
  history: { sender: string; text: string }[]
): Promise<string> {
  const client = getAiClient();

  const historyText = history
    .map((msg) => `${msg.sender === "user" ? "Usuário" : "Assistente"}: ${msg.text}`)
    .join("\n");

  const prompt = `
    Módulo de Estudo Contextual:
    Título: ${lecture.title}
    Categoria: ${lecture.category}
    Resumo Completo: ${lecture.summaryFull}
    Objetivos de Aprendizado: ${lecture.learningObjectives.join("; ")}
    Conceito Chave: ${lecture.keyConcept.title} - ${lecture.keyConcept.body}
    Equações Matemática: ${JSON.stringify(lecture.formulas)}

    Histórico Recente de Conversações:
    ${historyText}

    Pergunta do Aluno:
    ${question}

    Instruções de Resposta:
    Formule uma resposta didática, inspiradora e muito rica na explicação sobre o tema da aula. Escreva rigorosamente em Português do Brasil (pt-BR). Use formatação Markdown bela com títulos e listas limpas. Adicione fórmulas em termos LaTeX onde aplicável. Nunca invente fatos fora do escopo da aula.
  `;

  const response = await withRetry(() =>
    client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o assistente inteligente de estudos virtual do aplicativo NewStudy. Forneça respostas diretas, instrutivas, profissionais e estritamente formatadas com markdown baseadas exclusivamente no material didático disponível. Escreva sempre em pt-BR.",
      },
    })
  );

  return response.text || "Não consegui sintetizar uma resposta adequada para sua dúvida neste momento. Por favor, reformule a pergunta.";
}
