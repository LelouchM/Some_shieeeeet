if (window.Worker) {
	const message = document.getElementById('message');
	const pageForm = document.getElementById('page-form');
	const pageInput = document.getElementById('page-input');
	const sum = document.getElementById('sum');

  const myWorker = new Worker('/myworker.js');

  sum.onclick = (e) => {
    e.preventDefault();
    myWorker.postMessage(40);	
	};

  myWorker.onmessage = ({data}) => {
		console.log(data);
	};

	const mySharedWorker = new SharedWorker('/worker.js');
	mySharedWorker.port.start()

	pageForm.onsubmit = (e) => {
		e.preventDefault();
		mySharedWorker.port.postMessage(pageInput.value);	
	};

	mySharedWorker.port.onmessage = ({data}) => {
		message.innerHTML = data;
		console.log(data);
	};
}


if ('serviceWorker' in navigator) {
	let endpoint;
	let key;
	let authSecret;
 
	navigator.serviceWorker.register('/service.js')
		.then(registration => { 
  			return registration.pushManager.getSubscription()
  			.then(subscription => { 
    			if (subscription) {
      				return subscription;
    			} 
    			return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: window.vapidPublicKey });
  			});
		})
		.then(subscription => {
  			var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
  			key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
  			var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
  			authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
			endpoint = subscription.endpoint;
  			
  			fetch('/register', {
    			method: 'post',
    			headers: {
      				'Content-type': 'application/json'
    			},
    			body: JSON.stringify({
      				endpoint: subscription.endpoint,
      				key: key,
      				authSecret: authSecret,
    			}),
  			});
		});

  const notify = document.getElementById('notify');
  const notifMessage = document.getElementById('notifMessage');

  notify.onsubmit = (e) => {
    e.preventDefault();
    fetch('/sendNotification', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: endpoint,
        key: key,
        authSecret: authSecret,
        payload: notifMessage.value,
      }),
    });
  };

  const startSpam = document.getElementById('startSpam');

  startSpam.onclick = (e) => {
    e.preventDefault();
    fetch('/start', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({}),
    });
  }

  const subs = document.getElementById('subscribe');

  subs.onclick = (e) => {
    e.preventDefault();
    fetch('/subscribe', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: endpoint,
        key: key,
        authSecret: authSecret,
        payload: notifMessage.value,
      }),
    });
  }
}



/* 
function sumNumbers(i) {
	if (i < 2) return i;
	return sumNumbers(i-1) + sumNumbers(i-2);
}

Реализация функции sumNumbers с помощью промиссов.
a(10).then((i) => console.log(i));

function a(i) {
	return new Promise((res, rej) => {
		if (i < 2) {
			res(i);
		} else {
			let firstValue;
			a(i-1).then((data) => {firstValue = data; return a(i - 2)}).then((data) => res(data + firstValue));
		} 
	})
}
*/