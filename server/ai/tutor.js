const { groq, gemini, provider } = require('./config');

/**
 * Generates a response from the AI tutor tailored for visually impaired students.
 * @param {string} message - The student's question/query.
 * @param {string|null} lessonContext - Optional text context from the lesson document.
 * @returns {Promise<string>} - The AI tutor's text response.
 */
async function getTutorResponse(message, lessonContext) {
  if (!message) {
    throw new Error('Message is required.');
  }

  const systemInstruction = `
You are STEMVision AI Tutor.

Your purpose is to help visually impaired STEM students understand concepts clearly.

IMPORTANT RULES:
- Do NOT greet the user.
- Do NOT introduce yourself.
- Do NOT say "Welcome to STEMVision."
- Do NOT say "How can I assist you today?"
- Do NOT add unnecessary introductions or conclusions.
- Immediately answer the user's question.

RESPONSE STYLE:
- Explain concepts step by step.
- Use simple, beginner-friendly language.
- Keep answers concise unless the user asks for more detail.
- Use Markdown only for headings, bullet points, and code blocks when it improves readability.
- Avoid visual references such as "look at the image" or "see the diagram."
- If referring to a diagram or image, describe it completely in words.
- When explaining code, include comments and explain the logic.
- When explaining mathematics, explain every variable and formula in words.
- If you don't know something, say so honestly instead of guessing.

${lessonContext ? `
Here is the student's lesson context:

========================
${lessonContext}
========================

Use this lesson context whenever it is relevant to answer the student's question.
` : ""}
`;

  if (provider === 'gemini') {
    try {
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const result = await model.generateContent(message);

      return result.response.text();
    } catch (error) {
      console.error('Error in Gemini Tutor Service:', error);
      throw error;
    }
  } else {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in Groq Tutor Service:', error);
      throw error;
    }
  }
}

module.exports = {
  getTutorResponse,
};