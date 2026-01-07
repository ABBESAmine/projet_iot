const mqtt = require('mqtt');
const WebSocket = require('ws');

// Configuration
const MQTT_BROKER = 'mqtt://captain.dev0.pandor.cloud:1884';
const MQTT_TOPIC = 'classroom/+/telemetry';
const WS_PORT = 8080;

// Connexion MQTT
let mqttClient = null;

function connectMQTT() {
  console.log(`Connexion au broker MQTT: ${MQTT_BROKER}`);
  
  mqttClient = mqtt.connect(MQTT_BROKER);

  mqttClient.on('connect', () => {
    console.log('✓ Connecté au broker MQTT');
    console.log(`S'abonnement au topic: ${MQTT_TOPIC}`);
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('Erreur lors de l\'abonnement:', err);
      } else {
        console.log('✓ Abonné au topic MQTT');
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    try {
      const payload = {
        topic: topic,
        message: message.toString(),
        timestamp: new Date().toISOString()
      };
      
      // Envoyer le message à tous les clients WebSocket connectés
      const data = JSON.stringify(payload);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
      
      console.log(`Message reçu sur ${topic}`);
    } catch (error) {
      console.error('Erreur lors du traitement du message MQTT:', error);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('Erreur MQTT:', error);
  });

  mqttClient.on('close', () => {
    console.log('Connexion MQTT fermée. Tentative de reconnexion dans 5 secondes...');
    setTimeout(connectMQTT, 5000);
  });

  mqttClient.on('offline', () => {
    console.log('Client MQTT hors ligne');
  });
}

// Serveur WebSocket
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('listening', () => {
  console.log(`✓ Serveur WebSocket démarré sur ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws) => {
  console.log('Nouveau client WebSocket connecté');
  
  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  if (mqttClient) {
    mqttClient.end();
  }
  wss.close(() => {
    console.log('Serveur WebSocket fermé');
    process.exit(0);
  });
});

// Démarrage
console.log('=== Bridge MQTT → WebSocket ===\n');
connectMQTT();


