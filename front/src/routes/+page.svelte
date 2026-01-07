<script>
	let ws = null;
	let connected = false;
	let stations = {};

	function connect() {
		ws = new WebSocket('ws://localhost:8080');
		
		ws.onopen = () => {
			connected = true;
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				
				// Extraire le deviceId du topic
				const topicParts = data.topic.split('/');
				if (topicParts.length >= 2 && topicParts[0] === 'classroom') {
					const deviceId = topicParts[1];
					
					// Parser le message JSON
					let telemetry = {};
					try {
						telemetry = JSON.parse(data.message);
					} catch (e) {
						return;
					}
					
					// Extraire les données avec les noms de champs réels
					const temp = telemetry.tempC || telemetry.tempValue || telemetry.temperature || telemetry.temp || null;
					const hum = telemetry.humPct || telemetry.humidity || telemetry.hum || null;
					const bat = telemetry.batteryPct || telemetry.battery || telemetry.bat || null;
					
					// Mettre à jour les données
					stations[deviceId] = {
						deviceId: deviceId,
						name: `Station ${deviceId}`,
						temperature: temp,
						humidity: hum,
						battery: bat,
						lastUpdate: new Date().toLocaleString('fr-FR')
					};
					
					// Forcer la mise à jour
					stations = stations;
				}
			} catch (e) {
				// Erreur silencieuse
			}
		};

		ws.onclose = () => {
			connected = false;
			setTimeout(connect, 3000);
		};
	}

	connect();
</script>

<svelte:head>
	<title>IoT Météo</title>
</svelte:head>

<main>
	<h1>Stations Météo IoT</h1>
	
	<div class="status">
		<p>WebSocket: <strong>{connected ? 'Connecté' : 'Déconnecté'}</strong></p>
	</div>

	<div class="stations">
		{#each Object.values(stations) as station}
			<div class="station">
				<h2>{station.name}</h2>
				<div class="data">
					<p><strong>Température:</strong> {station.temperature ?? 'N/A'}°C</p>
					<p><strong>Humidité:</strong> {station.humidity ?? 'N/A'}%</p>
					<p><strong>Batterie:</strong> {station.battery ?? 'N/A'}%</p>
					<p class="time"><small>Dernière mise à jour: {station.lastUpdate}</small></p>
				</div>
			</div>
		{:else}
			<p>Aucune donnée reçue</p>
		{/each}
	</div>
</main>

<style>
	main {
		padding: 20px;
		font-family: Arial, sans-serif;
		max-width: 1200px;
		margin: 0 auto;
	}

	h1 {
		color: #333;
		border-bottom: 2px solid #333;
		padding-bottom: 10px;
	}

	.status {
		background: #f0f0f0;
		padding: 10px;
		margin: 20px 0;
		border: 1px solid #ccc;
	}

	.stations {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
		margin: 20px 0;
	}

	.station {
		background: white;
		border: 2px solid #333;
		padding: 15px;
	}

	.station h2 {
		margin: 0 0 15px 0;
		color: #333;
		border-bottom: 1px solid #ccc;
		padding-bottom: 10px;
	}

	.data p {
		margin: 10px 0;
	}

	.time {
		margin-top: 15px;
		color: #666;
	}
</style>
