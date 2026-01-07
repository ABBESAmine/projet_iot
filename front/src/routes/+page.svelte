<script>
	let ws = null;
	let connected = false;
	let messageCount = 0;

	function connect() {
		ws = new WebSocket('ws://localhost:8080');
		
		ws.onopen = () => {
			connected = true;
			console.log('Connecté');
		};

		ws.onmessage = () => {
			messageCount++;
		};

		ws.onclose = () => {
			connected = false;
		};
	}

	connect();
</script>

<svelte:head>
	<title>IoT Météo</title>
</svelte:head>

<main>
	<h1>Projet IoT Météo</h1>
	
	<p>WebSocket: {connected ? '✓ Connecté' : '✗ Déconnecté'}</p>
	<p>Messages reçus: {messageCount}</p>
</main>

<style>
	main {
		padding: 2rem;
	}
</style>

