const ports = [];

onconnect = (e) => {
	const port = e.ports[0];
	
	port.start();
	port.onmessage = ({data}) => {
		ports.forEach((item) => {
			if (item === port) return;
			item.postMessage(data);
		});
	}

	ports.push(port);
}