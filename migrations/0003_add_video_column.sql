-- Migration 0003: Add Base64 video column to products for animated burst demonstrations
ALTER TABLE products ADD COLUMN video TEXT;
