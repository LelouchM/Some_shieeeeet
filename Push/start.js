var http = require('http'),
	url = require('url'),
	bcrypt = require('bcrypt'),
	fs = require('fs');
	path = require('path');
	webPush = require('web-push');
	urlsafeBase64 = require('urlsafe-base64');

webPush.setGCMAPIKey('AIzaSyB76rC5PgnpRNCE3JavvR63Gy9iFwTDktg');

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscribers = [];

var server = new http.Server(function (req, res) {
	var urlParsed = url.parse(req.url);
	
	if (urlParsed.pathname === '/') {
		mainResponse(req, res);
	} else if (urlParsed.pathname === '/page2') {
		pageTwoResponse(req, res);
	} else if (urlParsed.pathname.match(/.js$/)) {
		sendFile(urlParsed.pathname, res);
	} else if (urlParsed.pathname.match(/.json$/)) {
		sendJson(res);
	} else if (urlParsed.pathname === '/register') {
		res.writeHead(201);
		res.end();
	} else if (urlParsed.pathname === '/crypt') {	
		cryptResponse(res);
	} else if (urlParsed.pathname === '/subscribe') {	
		let result = '';
		req.on('readable', () => {
			const data = req.read();
			if (data) result += data;
		});
		req.on('end', () => {
			subscribers.push(JSON.parse(result));
			res.end();
		});
	} else if (urlParsed.pathname === '/start') {
		console.log('Рассылка началась');
		console.log(subscribers);
		res.end();
		setInterval(() => {	
			subscribers.forEach((subscriber) => {
				const pushSubscription = {
	        		endpoint: subscriber.endpoint,
	        		keys: {
	          			p256dh: subscriber.key,
	          			auth: subscriber.authSecret,
	        		},
	      		};
	      		
	      		const options = {
	      			TTL: 24 * 60 * 60,
	    		}

				webPush.sendNotification(pushSubscription, 'Автоматическая рассылка', options)
			});
		}, 10000)
	} else if (urlParsed.pathname === '/sendNotification') {
		let result = '';
		req.on('readable', () => {
			const data = req.read();
			if (data) result += data;
		});
		req.on('end', () => {
			const body = JSON.parse(result);

			const pushSubscription = {
        		endpoint: body.endpoint,
        		keys: {
          			p256dh: body.key,
          			auth: body.authSecret,
        		},
      		};
      		
      		const options = {
      			TTL: 24 * 60 * 60,
    		}


			webPush.sendNotification(pushSubscription, body.payload, options)
				.then(() => {
					res.writeHead(201);	
					res.end();
				})
				.catch((e) => {
					console.log(e);
					res.writeHead(500);
					res.end();
				});
      	});	
	} else {
		res.end('404');
	}
});

server.on('listening', function() {
	console.log('Server listen!');
});

server.listen(1337, '127.0.0.1');

function mainResponse(req, res) {
	res.end(`<!DOCTYPE html>
		<html>
			<head>
				<title>Encrypt and Workers</title>
				<meta charset="utf-8">
				<link rel="manifest" href="/manifest.json">
				<script defer src="/main.js"></script>
				<script>
					function urlBase64ToUint8Array(base64String) {
						const padding = '='.repeat((4 - base64String.length % 4) % 4);
						const base64 = (base64String + padding)
						    .replace(/\-/g, '+')
						    .replace(/_/g, '/');
						 
						  const rawData = window.atob(base64);
						  const outputArray = new Uint8Array(rawData.length);
						 
						  for (let i = 0; i < rawData.length; ++i) {
						    outputArray[i] = rawData.charCodeAt(i);
						}
						return outputArray;
					}

					window.vapidPublicKey = urlBase64ToUint8Array('${vapidKeys.publicKey}');
				</script>
			</head>
			<body>
				<div>
					<p>Сообщение с другой страницы: <span id="message"></span></p>
					<form action="#" method="GET" id="page-form">
						<input type="text" name="page-input" id="page-input">
						<button>Отправить сообщение другой странице</button>
					</form>
					<button id="sum">Начать расчет</button>
					<form action="#" method="GET" id="notify">
						<input type="text" name="notif" id="notifMessage" >
						<button>Получить уведомление</button>
					</form>
					<button id="startSpam">Начать рассылку</button>
					<button id="subscribe">Подписаться</button>
				</div>
			</body>
		</html>`);
}

function pageTwoResponse(req, res) {
	res.end(`<!DOCTYPE html>
		<html>
			<head>
				<title>Encrypt and Workers</title>
				<meta charset="utf-8">
				<script defer src="/main.js"></script>
			</head>
			<body>
				<div>
					<p>Сообщение с другой страницы: <span id="message"></span></p>
					<form action="#" method="GET" id="page-form">
						<input type="text" name="page-input" id="page-input">
						<button>Отправить сообщение другой странице</button>
					</form>
					<button id="sum">Начать расчет</button>
				</div>
			</body>
		</html>`);
}

function cryptResponse(res) {
	const saltRounds = 10;
	const myPlaintextPassword = 'it_bacon';
	const someOtherPlaintextPassword = 'not_bacon';

	bcrypt.genSalt(saltRounds, function(err, salt) {
		const sal = salt;
    	bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
    		bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
    			res.end(`<!DOCTYPE html>
    				<html>
    					<head>
    						<title>Encrypt and Workers</title>
    						<meta charset="utf-8">
    					</head>
    					<body>
    						<div>
    							<p>Hash: ${hash}</p>
    							<p>Salt: ${salt}</p>
    							<p>Result: ${result}</p>
    						</div>
    					</body>
    				</html>`);
			});
    	});
	});
}

function sendFile(pathname, res) {
	res.writeHead(200, {
    	"Content-Type": "text/javascript; charset=UTF-8",
    });

   	fs.createReadStream(path.join(__dirname, 'js', pathname)).pipe(res);
}

function sendJson(res) {
	res.writeHead(200, {
    	"Content-Type": "text/json",
    });

	res.end(`{
		"name": "My App",
    	"short_name": "my-app",
    	"start_url": "/",
    	"gcm_sender_id": "711153649116"
	}`);
}
