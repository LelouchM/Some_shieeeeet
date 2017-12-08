onmessage = ({data}) => {
	postMessage(sumNumbers(data));
} 


function sumNumbers(i) {
	if (i < 2) return i;
	return sumNumbers(i-1) + sumNumbers(i-2);
}