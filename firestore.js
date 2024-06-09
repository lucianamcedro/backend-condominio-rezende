const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function adicionarUsuario(email, nome, endereco, modeloCarro, placaCarro, diasDentroCondominio) {
  try {
    const usersCollection = firestore.collection('users');
    const userDoc = usersCollection.doc(email);

    const userSnapshot = await userDoc.get();
    if (userSnapshot.exists) {
      throw new Error('Usuário já existe');
    }

    await userDoc.set({
      email,
      nome,
      endereco,
      modeloCarro,
      placaCarro,
      diasDentroCondominio
    });

    const qrContent = JSON.stringify({ email, nome, endereco, modeloCarro, placaCarro, diasDentroCondominio });
    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    await userDoc.update({ qrCode: qrCodeDataURL });

    console.log('Usuário adicionado com sucesso ao Firestore');
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
  }
}

async function consultarUsuario(email) {
  try {
    const userDoc = await firestore.collection('users').doc(email).get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data();
  } catch (error) {
    console.error('Erro ao consultar usuário:', error);
    throw error;
  }
}

async function loginUsuario(email, password) {
  try {
    const usuario = await consultarUsuario(email);

    if (!usuario) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      return null;
    }

    return usuario;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

async function adicionarVisitante(nome, email) {
  try {
    const visitorsCollection = firestore.collection('visitors');
    const visitorDoc = visitorsCollection.doc(email);

    const visitorSnapshot = await visitorDoc.get();
    if (visitorSnapshot.exists) {
      throw new Error('Visitante já existe');
    }

    await visitorDoc.set({ nome, email });

    const qrContent = JSON.stringify({ nome, email });
    const qrCodeDataURL = await QRCode.toDataURL(qrContent);

    await visitorDoc.update({ qrCode: qrCodeDataURL });

    console.log('Visitante adicionado com sucesso ao Firestore');
  } catch (error) {
    console.error('Erro ao adicionar visitante:', error);
  }
}

async function consultarVisitante(email) {
  try {
    const visitorDoc = await firestore.collection('visitors').doc(email).get();

    if (!visitorDoc.exists) {
      return null;
    }

    return visitorDoc.data();
  } catch (error) {
    console.error('Erro ao consultar visitante:', error);
    throw error;
  }
}

module.exports = { adicionarUsuario, consultarUsuario, loginUsuario, adicionarVisitante, consultarVisitante };
