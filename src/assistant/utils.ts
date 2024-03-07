import { logger } from "@/lib/logger";
import { openai } from "@/lib/openai";

async function transcriptAudio(audio: string) {
  logger.info(`Transcripting audio: ${audio}`);

  const fetchResponse = await fetch(audio);
  const blob = await fetchResponse.blob();
  const file = new File([blob], "audio.ogg", {
    type: "audio/ogg",
  });

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    response_format: "json",
    file,
  });

  return response.text;
}

export const AssistantUtils = {
  transcriptAudio,
};
