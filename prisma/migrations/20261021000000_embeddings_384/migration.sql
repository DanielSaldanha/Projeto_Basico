-- Muda a dimensão do embedding de 1536 (OpenAI) para 384 (all-MiniLM-L6-v2 local)
-- ATENÇÃO: se existirem chunks com embeddings de 1536 dims, rode antes:
--   TRUNCATE "chunks" CASCADE;
ALTER TABLE "chunks" ALTER COLUMN "embedding" TYPE vector(384);
