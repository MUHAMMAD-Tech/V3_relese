
-- Add market_cap_rank column to token_whitelist table
ALTER TABLE token_whitelist 
ADD COLUMN IF NOT EXISTS market_cap_rank INTEGER DEFAULT 999;

-- Update market cap ranks for top 50 tokens (based on current market data)
-- Top tier (1-10)
UPDATE token_whitelist SET market_cap_rank = 1 WHERE symbol = 'BTC';
UPDATE token_whitelist SET market_cap_rank = 2 WHERE symbol = 'ETH';
UPDATE token_whitelist SET market_cap_rank = 3 WHERE symbol = 'USDT';
UPDATE token_whitelist SET market_cap_rank = 4 WHERE symbol = 'BNB';
UPDATE token_whitelist SET market_cap_rank = 5 WHERE symbol = 'SOL';
UPDATE token_whitelist SET market_cap_rank = 6 WHERE symbol = 'USDC';
UPDATE token_whitelist SET market_cap_rank = 7 WHERE symbol = 'XRP';
UPDATE token_whitelist SET market_cap_rank = 8 WHERE symbol = 'TON';
UPDATE token_whitelist SET market_cap_rank = 9 WHERE symbol = 'DOGE';
UPDATE token_whitelist SET market_cap_rank = 10 WHERE symbol = 'ADA';

-- Second tier (11-20)
UPDATE token_whitelist SET market_cap_rank = 11 WHERE symbol = 'AVAX';
UPDATE token_whitelist SET market_cap_rank = 12 WHERE symbol = 'TRX';
UPDATE token_whitelist SET market_cap_rank = 13 WHERE symbol = 'DOT';
UPDATE token_whitelist SET market_cap_rank = 14 WHERE symbol = 'LINK';
UPDATE token_whitelist SET market_cap_rank = 15 WHERE symbol = 'MATIC';
UPDATE token_whitelist SET market_cap_rank = 16 WHERE symbol = 'ICP';
UPDATE token_whitelist SET market_cap_rank = 17 WHERE symbol = 'NEAR';
UPDATE token_whitelist SET market_cap_rank = 18 WHERE symbol = 'LTC';
UPDATE token_whitelist SET market_cap_rank = 19 WHERE symbol = 'BCH';
UPDATE token_whitelist SET market_cap_rank = 20 WHERE symbol = 'UNI';

-- Third tier (21-30)
UPDATE token_whitelist SET market_cap_rank = 21 WHERE symbol = 'ATOM';
UPDATE token_whitelist SET market_cap_rank = 22 WHERE symbol = 'XLM';
UPDATE token_whitelist SET market_cap_rank = 23 WHERE symbol = 'ETC';
UPDATE token_whitelist SET market_cap_rank = 24 WHERE symbol = 'XMR';
UPDATE token_whitelist SET market_cap_rank = 25 WHERE symbol = 'OKB';
UPDATE token_whitelist SET market_cap_rank = 26 WHERE symbol = 'APT';
UPDATE token_whitelist SET market_cap_rank = 27 WHERE symbol = 'HBAR';
UPDATE token_whitelist SET market_cap_rank = 28 WHERE symbol = 'FIL';
UPDATE token_whitelist SET market_cap_rank = 29 WHERE symbol = 'ARB';
UPDATE token_whitelist SET market_cap_rank = 30 WHERE symbol = 'VET';

-- Fourth tier (31-40)
UPDATE token_whitelist SET market_cap_rank = 31 WHERE symbol = 'QNT';
UPDATE token_whitelist SET market_cap_rank = 32 WHERE symbol = 'MKR';
UPDATE token_whitelist SET market_cap_rank = 33 WHERE symbol = 'CRO';
UPDATE token_whitelist SET market_cap_rank = 34 WHERE symbol = 'ALGO';
UPDATE token_whitelist SET market_cap_rank = 35 WHERE symbol = 'AAVE';
UPDATE token_whitelist SET market_cap_rank = 36 WHERE symbol = 'GRT';
UPDATE token_whitelist SET market_cap_rank = 37 WHERE symbol = 'EOS';
UPDATE token_whitelist SET market_cap_rank = 38 WHERE symbol = 'FTM';
UPDATE token_whitelist SET market_cap_rank = 39 WHERE symbol = 'THETA';
UPDATE token_whitelist SET market_cap_rank = 40 WHERE symbol = 'XTZ';

-- Fifth tier (41-50)
UPDATE token_whitelist SET market_cap_rank = 41 WHERE symbol = 'IMX';
UPDATE token_whitelist SET market_cap_rank = 42 WHERE symbol = 'INJ';
UPDATE token_whitelist SET market_cap_rank = 43 WHERE symbol = 'OP';
UPDATE token_whitelist SET market_cap_rank = 44 WHERE symbol = 'RNDR';
UPDATE token_whitelist SET market_cap_rank = 45 WHERE symbol = 'KAVA';
UPDATE token_whitelist SET market_cap_rank = 46 WHERE symbol = 'ZEC';
UPDATE token_whitelist SET market_cap_rank = 47 WHERE symbol = 'MINA';
UPDATE token_whitelist SET market_cap_rank = 48 WHERE symbol = 'DASH';
UPDATE token_whitelist SET market_cap_rank = 49 WHERE symbol = 'IOTA';
UPDATE token_whitelist SET market_cap_rank = 50 WHERE symbol = 'CAKE';

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_token_whitelist_market_cap_rank 
ON token_whitelist(market_cap_rank);
