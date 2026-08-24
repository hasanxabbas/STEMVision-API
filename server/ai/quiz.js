const { groq, gemini, provider } = require('./config');

/**
 * Generates a multiple-choice quiz based on a lesson's title and description.
 * @param {string} lessonTitle - The title of the lesson.
 * @param {string} lessonDescription - The description of the lesson.
 * @param {number} numberOfQuestions - The number of questions to generate (default 5).
 * @returns {Promise<Object>} - The JSON containing the "questions" array.
 */
async function generateQuiz(lessonTitle, lessonDescription, numberOfQuestions = 5) {
  const promptText = `You are an expert STEM educator. Generate a multiple-choice quiz of ${numberOfQuestions} questions based on the following lesson information:
Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}

Provide your response in JSON format. The JSON must follow this exact structure:
{
  "questions": [
    {
      "questionText": "The question text here...",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "The exact string matching the correct option"
    }
  ]
}`;

  if (provider === 'gemini') {
    try {
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(promptText);
      const responseText = result.response.text();
      return cleanAndParseJSON(responseText);
    } catch (error) {
      console.error('Error in Gemini Quiz Service:', error);
      throw error;
    }
  } else {
    try {
      const response = await groq.chat.completions.create({
        model: 'qwen/qwen3.6-27b',
        messages: [
          { role: 'user', content: promptText }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        reasoning_format: 'hidden',
      });

      const contentText = response.choices[0].message.content;
      return cleanAndParseJSON(contentText);
    } catch (error) {
      console.error('Error in Groq Quiz Service:', error);
      throw error;
    }
  }
}

/**
 * Strips internal model reasoning (<think>...</think> or <thought>...</thought>) blocks from text.
 * @param {string} text - The input text.
 * @returns {string} - The cleaned text.
 */
function stripReasoning(text) {
  if (typeof text !== 'string') return text;
  
  // Remove matched <think>...</think> and <thought>...</thought> tags case-insensitively
  let clean = text.replace(/<(think|thought)>[\s\S]*?<\/\1>/gi, '');
  
  // Remove any unclosed tags at the end of the text
  clean = clean.replace(/<(think|thought)>[\s\S]*$/gi, '');
  
  return clean.trim();
}

/**
 * Clean up text (removing reasoning and markdown blocks) and parse as JSON.
 * @param {string} text - The input text.
 * @returns {Object} - The parsed JSON object.
 */
function cleanAndParseJSON(text) {
  if (typeof text !== 'string') return text;
  
  let cleaned = stripReasoning(text);
  
  // Strip markdown code blocks if any
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/```\s*$/, '');
  
  return JSON.parse(cleaned.trim());
}

module.exports = {
  generateQuiz,
};

