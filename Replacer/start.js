const fs = require('fs');
const pathModule = require('path');
const { dir, search, replaceStr, exclude } = require('./config');

main();

async function main() {
	const num = await replace(dir);
	console.log(`Изменено ${num} файлов.`);
}

async function replace(path) {
	try {
		let num = 0;
		
		const files = await readDir(path);
		for (let i = 0; i < files.length; i++) {
			const currentPath = pathModule.resolve(path, files[i]);

			if (exclude.includes(files[i])) continue;

			if (files[i].search(/.html$/gi) === -1) {
				num += await replace(currentPath);
			} else {	
				const file = await readFile(currentPath);
				const replacedFile = file.toString().replace(new RegExp(search, 'gm'), replaceStr);
				 
				if (replacedFile !== file.toString()) {
					await writeFile(currentPath, replacedFile);
					num++;
				}
			}
		}
		
		return num;
	} catch(e) {
		if (e.errno !== -4052 && e.errno !== -4058) {
			console.error(e);
		}
		return 0;
	} 
}


function readDir(path) {
	return new Promise((res, rej) => {
		fs.readdir(path, (err, files) => {
			if (err) rej(err); 
			res(files);
		});
	});
}

function readFile(path) {
	return new Promise((res, rej) => {
		fs.readFile(path, (err, data) => {
			if (err) rej(err); 
			res(data);
		});
	});
}

function writeFile(path, data) {
	return new Promise((res, rej) => {
		fs.writeFile(path, data, (err) => {
			if (err) rej(err); 
			res(true);
		});
	});
}
