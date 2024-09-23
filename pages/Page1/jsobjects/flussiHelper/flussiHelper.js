export default {
	base64Decode (base64String) {
	// Rimuovi l'intestazione se esiste (es. "data:text/plain;base64,")
    const base64Data = base64String.split(',')[1] || base64String;

    // Decodifica il base64 in una stringa binaria
    const binaryString = atob(base64Data);

    // Converti la stringa binaria in una stringa percent-encoded
    let percentEncodedStr = '';
    for (let i = 0; i < binaryString.length; i++) {
      const charCode = binaryString.charCodeAt(i);
      percentEncodedStr += '%' + ('00' + charCode.toString(16)).slice(-2);
    }

    // Decodifica la stringa percent-encoded in UTF-8
    const decodedString = decodeURIComponent(percentEncodedStr);

    return decodedString;
	},
	elaboraFlussi (){
		const convertedString = this.base64Decode(FilePicker1.files[0].data);
		let outData = calcolaFlussi.ottieniStatDaFileFlussoM(convertedString,FilePicker1.files[0].name);
		return outData;
	},
	 generateHash (text) {
		 return crypto_js.MD5(text).toString(crypto_js.enc.Hex);
	 }
}