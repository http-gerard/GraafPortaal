-- Voeg extra kolommen toe aan de offertes tabel om de complexe bouwer (JSON) in op te slaan
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS full_data JSONB;
