import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 LeadSync backend listening on port ${PORT}`);
});
