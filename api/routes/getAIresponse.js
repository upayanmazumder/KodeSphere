const axios = require("axios");

const getAIresponse = async (aiPrompt, yml) => {
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "Be precise and concise.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        max_tokens: 123,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1,
        response_format: {
          type: "text",
        },
        web_search_options: {
          search_context_size: "high",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log(
      "Perplexity API Response:",
      response.data.choices[0].message.content
    );

    if (yml) {
      const extracted = aiResponse.replace(/```[a-z]*\n([\s\S]*?)```/, "$1");
      return extracted;
    } else {
      const extracted = aiResponse.replace(/```[\s\S]*?\n([\s\S]*?)```/, "$1");
      return extracted;
    }
  } catch (error) {
    console.error("Error fetching AI response:", error.message);
    throw new Error("Failed to fetch AI response");
  }
};

module.exports = getAIresponse;
