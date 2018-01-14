const http = require('http'),
	url = require('url'),
	fs = require('fs');
	path = require('path');
	multiparty = require('multiparty');


const server = new http.Server(function (req, res) {
	const urlParsed = url.parse(req.url);
	
	if (urlParsed.pathname === '/') {
		mainResponse(req, res);
	} else if (urlParsed.pathname.match(/.js$/)) {
		sendFile(urlParsed.pathname, res);
	} else if (urlParsed.pathname.match(/.json$/)) {
		sendJson(res);
	} else if (urlParsed.pathname === '/asyncpost') {	
		let result = Buffer.from([]);
		req.on('readable', () => {
			const data = req.read();
			if (data) result = Buffer.concat([result, data], data.length + result.length);
		});
		req.on('end', () => {
			console.log(result);
			fs.writeFile(`image${Math.round(Math.random() * 1000000)}.png`, result, (err) => {
  				if (err) throw err;
  				console.log('The file has been saved!');
  				res.end('{success: true}');
			});
		});
	} else if (urlParsed.pathname === '/syncpost') {
		let fileName;
		let fileBuffer;

		const form = new multiparty.Form();
		
		form.on('error', function(err) {
  			console.log('Error parsing form: ' + err.stack);
		});

		form.on('part', function(part) {
  			if (!part.filename) {
  				let result = '';

    			part.on('readable', () => {
					const data = part.read();
					if (data) result += data;
				});

				part.on('end', () => {
					console.log(result);
					fileName = result;
					part.resume();
				});
  			}

			if (part.filename) {
			    let result = Buffer.from([]);
				
				part.on('readable', () => {
					const data = part.read();
					if (data) result = Buffer.concat([result, data], data.length + result.length);
				});

				part.on('end', () => {
					console.log(result);
					fileBuffer = result;
					part.resume();
				});
			}

		});

		form.on('close', function() {
			
			console.log('Upload completed!');
			console.log(fileName);
			console.log(fileBuffer);

		  	fs.writeFile(`${fileName}.png`, fileBuffer, (err) => {
  				if (err) throw err;
  				console.log('The file has been saved!');
			});
			
		});

		form.parse(req);


		/*
		form.parse(req, (err, fields, files) => {
			if (err) { console.log(err) }

  			Object.keys(fields).forEach(function(name) {
    			console.log(fields[name]);
	  		});

		  	Object.keys(files).forEach(function(name) {
		    	console.log(files[name]);
		  	});

		  	console.log('Received ' + files.length + ' files');
		  			  	
		});
		*/
		mainResponse(req, res);
	} else {
		res.end('404');
	}
});

server.on('listening', function() {
	console.log('Server listen!');
});

server.listen(1337, '192.168.1.3');

function mainResponse(req, res) {
	res.end(`<!DOCTYPE html>
		<html>
			<head>
				<title>TestRTC</title>
				<meta charset="utf-8">
				<!-- <script defer src="/main.js"></script> -->
			</head>
			<body>
				<div>Асинхронная форма:
					<form action="/asyncpost" id="page-form">
						<input type="file" name="image" id="page-input">
						<button>Отправить сообщение</button>
					</form>
					Синхронная форма:
					<form action="/syncpost" method="POST" id="page-for" enctype="multipart/form-data">
						<input type="file" name="image" id="page-inpu" />
						<input type="text" name="imgname" />
						<button>Отправить сообщение</button>
					</form>
				</div>
				<script>
					const pageInput = document.getElementById('page-input');
					const pageForm = document.getElementById('page-form');

					pageForm.onsubmit = (e) => {
						e.preventDefault();
						const value = pageInput.files[0];
						fetch('/post', {method: 'POST', body: value})
					}
				</script>
			</body>
		</html>`);
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
