const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/css', express.static(path.join(__dirname, '../public/css')));

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  res.sendFile(htmlPath);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).set('Content-Type', 'text/plain').send('Credenciales inválidas');
  }
  if (username === 'usuario' && password === '1234') {
    return res.set('Content-Type', 'text/plain').send('Inicio de sesión exitoso');
  }
  return res.status(401).set('Content-Type', 'text/plain').send('Credenciales inválidas');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Faltan datos para completar el registro');
  }

  return res.send('Usuario registrado correctamente');
});

app.get('/health', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});