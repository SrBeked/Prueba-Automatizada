// server.js (actualizado para HU-06 a HU-10 con endpoint /health)
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

// Datos en memoria
const users = [
  { username: 'usuario', email: 'usuario@example.com', password: '1234' }
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use(session({
  secret: 'secreto123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  res.sendFile(htmlPath);
});

// 🟢 HU-01 y HU-07: Registro de usuario con validación de duplicado
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send(`
      <p>Faltan datos para completar el registro</p>
      <a href="/">Volver</a>
    `);
  }

  const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).send(`
      <p id="error-duplicate">El correo ya está registrado</p>
      <a href="/">Volver</a>
    `);
  }

  users.push({ username, email, password });
  res.send(`
    <p>Usuario registrado correctamente</p>
    <a href="/">Volver</a>
  `);
});

// 🟢 HU-02, HU-06, HU-09: Inicio de sesión con redirección y errores claros
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send(`
      <p id="error-login">Credenciales inválidas</p>
      <a href="/">Volver</a>
    `);
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).send(`
      <p id="error-notfound">El usuario no está registrado</p>
      <a href="/">Volver</a>
    `);
  }

  if (user.password !== password) {
    return res.status(400).send(`
      <p id="error-password">Credenciales inválidas</p>
      <a href="/">Volver</a>
    `);
  }

  req.session.user = user;
  res.redirect('/welcome'); // 🟢 HU-06
});

// 🟢 HU-10: Mostrar nombre y correo correctamente identificados por ID
app.get('/welcome', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const user = req.session.user;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bienvenido</title>
      <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
      <div class="container">
        <h1 id="user-name">Bienvenido, ${user.username}</h1>
        <p id="user-email">Email: ${user.email}</p>

        <form action="/logout" method="POST">
          <button id="logout-button" type="submit">Cerrar sesión</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// 🟢 HU-08: Botón de cerrar sesión correctamente
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send(`
      <p>Sesión cerrada correctamente</p>
      <a href="/">Volver al inicio</a>
    `);
  });
});

// ✅ Endpoint de salud (verificación del servidor)
app.get('/health', (req, res) => {
  res.status(200).send("Servidor funcionando correctamente");
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
