const express = require('express');
const path = require('path');

const app = express();

// Definir o diretório onde os arquivos estáticos do Angular são gerados após a construção (geralmente é a pasta "dist" ou "build")
const distDir = path.join(__dirname, 'dist', 'finance');

// Configurar o middleware para servir arquivos estáticos do Angular
app.use(express.static(distDir));

// Configurar o middleware para redirecionar todas as solicitações para o arquivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Iniciar o servidor na porta de sua escolha (por exemplo, porta 3000)
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
