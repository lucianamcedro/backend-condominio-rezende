const functions = require('firebase-functions');
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

admin.initializeApp();

const firestore = admin.firestore();
const SECRET_KEY = bcrypt.genSaltSync(10);

exports.registerUser = functions.https.onRequest(async (req, res) => {
  const { email, password, nome, endereco, modeloCarro, placaCarro, diasDentroCondominio } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userRef = firestore.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    await userRef.set({
      email,
      password: hashedPassword,
      nome,
      endereco,
      modeloCarro,
      placaCarro,
      diasDentroCondominio
    });

    const qrContent = JSON.stringify({
      email,
      nome,
      endereco,
      modeloCarro,
      placaCarro,
      diasDentroCondominio
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    res.status(201).json({ message: 'Usuário registrado com sucesso', qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

exports.loginUser = functions.https.onRequest(async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRef = firestore.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    const userData = userDoc.data();
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ email: userData.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

exports.generateQRCode = functions.https.onRequest(async (req, res) => {
  try {
    const email = req.params.email;

    const userDoc = await firestore.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();
    const qrContent = JSON.stringify(userData);

    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    res.send(qrCodeDataURL.toString());
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

exports.registerVisitor = functions.https.onRequest(async (req, res) => {
  const { nome, email } = req.body;

  try {
    const visitorRef = firestore.collection('visitors').doc(email);
    const visitorDoc = await visitorRef.get();

    if (visitorDoc.exists) {
      return res.status(400).json({ error: 'Visitante já existe' });
    }

    await visitorRef.set({
      nome,
      email
    });

    const qrContent = JSON.stringify({
      nome,
      email
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    res.status(201).json({ message: 'Visitante registrado com sucesso', qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('Erro ao registrar visitante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

exports.getVisitor = functions.https.onRequest(async (req, res) => {
  try {
    const email = req.params.email;

    const visitorDoc = await firestore.collection('visitors').doc(email).get();
    if (!visitorDoc.exists) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    const visitorData = visitorDoc.data();
    const qrContent = JSON.stringify(visitorData);

    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    res.send(qrCodeDataURL.toString());
  } catch (error) {
    console.error('Erro ao consultar visitante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
