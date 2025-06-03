import { Mistral } from "@mistralai/mistralai";
import type { EventStream } from "@mistralai/mistralai/lib/event-streams";
import type { CompletionEvent } from "@mistralai/mistralai/models/components";

const mistral = new Mistral({ apiKey: import.meta.env.VITE_MISTRAL_API_KEY });

/**
 * Converts a PDF file (as Buffer) to Markdown using Mistral OCR.
 * @param pdfBytes - PDF content as a Buffer.
 * @returns The full OCR-converted Markdown content.
 */
export const convertPdfToMarkdown = async (
	pdfBytes: Buffer,
): Promise<string> => {
	const b64 = pdfBytes.toString("base64");
	if (!b64 || b64.length === 0) {
		throw new Error("No PDF content to process");
	}

	const dataUri = `data:application/pdf;base64,${b64}`;

	const ocr = await mistral.ocr.process({
		model: "mistral-ocr-latest",
		document: {
			type: "document_url",
			documentUrl: dataUri,
		},
	});

	if (!ocr.pages || ocr.pages.length === 0) {
		return "";
	}

	return ocr.pages
		.map(
			(page: { markdown: string }, index) =>
				`=== Page n°${index + 1} ===\n${page.markdown}`,
		)
		.join("\n\n");
};

export const getResponseStream = async (
	markdownFile: string,
	question: string,
): Promise<EventStream<CompletionEvent>> => {
	const prompt = `You are a product expert tasked with answering a question based on **Markdown content extracted from a PDF file**.

CRITICAL LANGUAGE RULES:
1. FIRST, detect the language of the user's question
2. You MUST answer EXCLUSIVELY in that detected language, regardless of the PDF content's language
3. If the PDF content is in a different language than the question:
   - Translate ALL relevant information to the question's language
   - Maintain the original meaning and context
   - Make the translation sound natural in the target language
4. NEVER mix languages in your response
5. NEVER let the PDF content's language influence your response language
6. Your response must be 100% in the question's language

---

**User Question:** "${question}"

---

**PDF Content (Markdown):**

${markdownFile}`;

	const responseStream = await mistral.agents.stream({
		agentId: import.meta.env.VITE_MISTRAL_AGENT_ID || "",
		messages: [
			{
				role: "system",
				content: prompt,
			},
		],
	});

	return responseStream;
};
