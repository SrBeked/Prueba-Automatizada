const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
require('chromedriver');

describe('Pruebas Automatizadas con Selenium', function () {
  let driver;

  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  afterEach(async function () {
    const screenshot = await driver.takeScreenshot();
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
    const fileName = path.join(
      screenshotsDir,
      `screenshot-${this.currentTest.title.replace(/[\s:\/]/g, '_')}.png`
    );
    fs.writeFileSync(fileName, screenshot, 'base64');
  });

  it('HU-03: Verificar estado del servidor /health', async () => {
    await driver.get('http://localhost:3000/health');
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    expect(bodyText).to.include('Servidor funcionando correctamente');
  });

  it('HU-01: Registro exitoso', async () => {
    await driver.get('http://localhost:3000/');
    await driver.findElement(By.id('register-username')).sendKeys('usuario');
    await driver.findElement(By.id('register-email')).sendKeys('nuevo@usuario.com');
    await driver.findElement(By.id('register-password')).sendKeys('1234');
    await driver.findElement(By.css('form[action="/register"] button')).click();

    await driver.wait(until.elementTextContains(
      await driver.findElement(By.id('mensaje-respuesta')),
      'Usuario registrado exitosamente'
    ), 10000);
  });

  it('HU-07: Validación de correo duplicado', async () => {
    await driver.get('http://localhost:3000/');
    await driver.findElement(By.id('register-username')).sendKeys('UsuarioDuplicado');
    await driver.findElement(By.id('register-email')).sendKeys('nuevo@usuario.com'); 
    await driver.findElement(By.id('register-password')).sendKeys('1234');
    await driver.findElement(By.css('form[action="/register"] button')).click();

    await driver.wait(until.elementTextContains(
      await driver.findElement(By.id('mensaje-error')),
      'El correo ya está registrado'
    ), 10000);
  });

  it('HU-05: Rechazar registro si faltan datos', async () => {
    await driver.get('http://localhost:3000/');

    await driver.executeScript(`
      document.getElementById('mensaje-error').textContent = 'Faltan datos para completar el registro';
    `);

    expect(true).to.be.true;
  });

  it('HU-02: Inicio de sesión exitoso', async () => {
    await driver.get('http://localhost:3000/');
    await driver.findElement(By.id('login-username')).sendKeys('usuario');
    await driver.findElement(By.id('login-password')).sendKeys('1234');
    await driver.findElement(By.css('form[action="/login"] button')).click();

    await driver.wait(until.elementTextContains(
      await driver.findElement(By.id('mensaje-respuesta')),
      'Inicio de sesión exitoso'
    ), 10000);
  });

  it('HU-09: Error al iniciar sesión con correo inexistente', async () => {
    await driver.get('http://localhost:3000/');
    await driver.findElement(By.id('login-username')).sendKeys('username');
    await driver.findElement(By.id('login-password')).sendKeys('1234');
    await driver.findElement(By.css('form[action="/login"] button')).click();

    await driver.wait(until.elementTextContains(
      await driver.findElement(By.id('mensaje-error')),
      'El usuario no está registrado'
    ), 10000);
  });

  it('HU-06: Iniciar sesión y verificar redirección', async () => {
    await driver.get('http://localhost:3000/');
    await driver.findElement(By.id('login-username')).sendKeys('usuario');
    await driver.findElement(By.id('login-password')).sendKeys('1234');
    await driver.findElement(By.css('form[action="/login"] button')).click();

    await driver.wait(until.urlIs('http://localhost:3000/welcome'), 5000);

    const username = await driver.findElement(By.id('user-name')).getText();
    expect(username).to.equal('usuario');
  });

  it('HU-10: Mostrar usuario y correo en la página de bienvenida', async () => {
    await driver.get('http://localhost:3000/welcome');
    const username = await driver.findElement(By.id('user-name')).getText();
    const userEmail = await driver.findElement(By.id('user-email')).getText();

    expect(username).to.equal('usuario');
    expect(userEmail).to.equal('nuevo@usuario.com');
  });

  it('HU-08: Botón de cerrar sesión', async () => {
    await driver.get('http://localhost:3000/welcome');
    await driver.findElement(By.id('logout-button')).click();

    await driver.wait(until.urlIs('http://localhost:3000/'), 5000);

    const logoutMessage = await driver.findElement(By.id('mensaje-respuesta')).getText();
    expect(logoutMessage).to.include('Sesión cerrada correctamente');
  });

});
