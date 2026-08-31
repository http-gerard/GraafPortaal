-- Voeg een veld toe om Outlook afspraken te herkennen in de database
ALTER TABLE meetings ADD COLUMN outlook_uid TEXT UNIQUE;
