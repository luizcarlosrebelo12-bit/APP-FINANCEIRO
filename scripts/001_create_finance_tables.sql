-- Tabela de contas mensais
CREATE TABLE IF NOT EXISTS contas_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  dia_pagamento INTEGER NOT NULL DEFAULT 1,
  chave_pix TEXT DEFAULT '',
  pago BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pessoas (salários)
CREATE TABLE IF NOT EXISTS pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de salário
CREATE TABLE IF NOT EXISTS entradas_salario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  dia INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parcelas do carro
CREATE TABLE IF NOT EXISTS parcelas_carro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL,
  data_pagamento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ok')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_entradas_salario_pessoa_id ON entradas_salario(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_carro_status ON parcelas_carro(status);

-- Inserir dados iniciais de pessoas
INSERT INTO pessoas (nome, ordem) VALUES 
  ('Kaly', 1),
  ('Luiz', 2)
ON CONFLICT DO NOTHING;
