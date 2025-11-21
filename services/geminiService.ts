import { GoogleGenAI } from "@google/genai";
import { AlignmentState, SimulationResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getAlignmentAdvice = async (
  state: AlignmentState,
  results: SimulationResult,
  userQuery: string
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "API ключ не найден. Пожалуйста, настройте окружение.";

  const systemInstruction = `Вы - опытный инженер-механик, эксперт по лазерной и индикаторной центровке роторного оборудования. 
  Ваша задача - помогать пользователю с центровкой валов.
  Давайте краткие, точные и безопасные советы на русском языке.
  Используйте технические термины (расцентровка, излом, смещение, мягкая лапа).
  
  Текущее состояние оборудования:
  - Пластины под задней лапой: ${state.rearShim.toFixed(2)} мм
  - Пластины под передней лапой: ${state.frontShim.toFixed(2)} мм
  
  Расчетные данные:
  - Параллельное смещение на муфте: ${results.verticalOffset.toFixed(3)} мм
  - Угловая расцентровка: ${(results.angularMisalignment * 100).toFixed(3)} мм/100мм
  
  Если расцентровка велика (>0.05 мм), посоветуйте, как исправить.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userQuery || "Проанализируй текущую ситуацию и дай совет.",
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 300,
      },
    });

    return response.text || "Не удалось получить ответ от помощника.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ошибка при обращении к ИИ сервису. Проверьте консоль.";
  }
};
