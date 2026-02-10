import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 LeadSync backend listening on port ${PORT}`);

  // Verify OpenAI API Key (for Railway logs)
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY not set. AI auto-reply will be disabled.");
  } else {
    console.log("✅ OPENAI_API_KEY loaded. AI auto-reply enabled.");
  }
});
