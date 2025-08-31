export default async function* aiCompletion(prompt: string) {
  const url = "http://127.0.0.1:1234/api/v0/chat/completions";

    const requestBody = {
        model: "openai/gpt-oss-20b", // verify the exact ID via GET /api/v0/models
        messages:[
            {
            role: "user",
            content: prompt,
            },
        ],
        temperature: 0.7,
        max_tokens: -1,
     stream: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.body) {
    throw new Error("No response body (stream) from LM Studio");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;

        // LM Studio streams OpenAI-like chunks
        const json = JSON.parse(data);

        console.log(json);

        // Try typical OpenAI shapes for chat streaming
        const delta =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.message?.content ?? // some servers send full message content
          json.choices?.[0]?.text ?? // text completions
          "";

        if (delta) yield delta;
      }
    }
  }
}
