export default {
	getStruttureMap () {
		let struttureOut = {};
		let struttureFiltrate = getStruttureFromFileRegione.data;
		let mancanti = [];
		struttureFiltrate.forEach(p => {
            if (datiMessina.comuniDistretti.hasOwnProperty('0' + p["Codice Comune"])) {
                struttureOut[p['Codice struttura']] = {
									  codiceRegione: p['Codice Regione'],
                    codiceAzienda: p['Codice Azienda'],
                    denominazione: p['Denominazione struttura'],
                    codiceComune: '0' + p['Codice Comune'],
                    idDistretto: datiMessina.comuniDistretti[p["Codice Comune"]],
                };
            } else
                mancanti.push(p);
        })
		return struttureOut;
	}
}