const OpenAI = require("openai");
const logger = require("../../config/logger"); // Importa el logger
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-756c57b01f04430cad7512353b5d847b",
});
let conversationHistory = [];
const DeepSeekController = {
  handleChat: async (req, res) => {
    try {
      const userMessage = req.body.message;
      conversationHistory.push({ role: "user", content: userMessage });
      const completion = await openai.chat.completions.create({
        messages: conversationHistory,
        model: "deepseek-chat",
      });
      const assistantMessage = completion.choices[0].message.content;
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });
      res.json({ assistantMessage });
    } catch (error) {
      logger.error(`Error en handleChat: ${error}`);
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud." });
    }
  },
};

module.exports = DeepSeekController;
