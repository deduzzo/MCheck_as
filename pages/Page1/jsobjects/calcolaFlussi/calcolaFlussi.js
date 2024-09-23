export default {
	_startsFlussoMV10082012:  {
        regione: {id: 1, length: 3, type: "string", required: true},
        asID: {id: 2, length: 3, type: "string", required: true}, // codice azienda sanitaria
        arseID: {id: 3, length: 6, type: "string", required: true}, // codice regionale struttura erogatrice STS11
        brancaID: {id: 4, length: 2, type: "int", required: true}, // codice branca STS21
        mpID: {id: 5, length: 16, type: "string", required: true}, // codice medico prescrittore
        cognome: {id: 6, length: 30, type: "string", required: false}, // cognome utente
        nome: {id: 7, length: 20, type: "string", required: false}, // nome utente
        cf: {id: 8, length: 16, type: "string", required: true}, // codice fiscale
        sesso: {id: 9, length: 1, type: "string", required: false}, // sesso utente
        dataNascita: {id: 10, length: 8, type: "date", required: false}, // data Nascita Utente
        comRes: {id: 11, length: 6, type: "string", required: true}, // comune di residenza utente
        aspRes: {id: 12, length: 3, type: "string", required: true}, // Azienda Sanitaria provinciale di residenza
        dataPren: {id: 13, length: 8, type: "date", required: true}, // Data di Prenotazione, solo su riga 99
        ricettaID: {id: 14, length: 16, type: "string", required: true}, // Numero ricetta
        progrRicetta: {id: 15, length: 2, type: "string", required: true}, // Progressivo riga per ricetta
        diagnosi: {id: 16, length: 5, type: "string", required: false}, // codifica ICD9CM
        dataErog: {id: 17, length: 8, type: "date", required: true}, // Data erogazione, in caso di ciclo si riporta chisura ciclo
        nomID: {id: 18, length: 1, type: "string", required: true}, // codifica nomenclatore
        prestID: {id: 19, length: 7, type: "string", required: true}, // codice prestazione secondo nomenclatore
        quant: {id: 20, length: 3, type: "int", required: true}, // quantità
        ticket: {id: 21, length: 2, type: "double", required: true}, // posizione utente nei confronti del ticket
        esenzione: {id: 22, length: 6, type: "string", required: true}, // codice esenzione
        importoTicket: {id: 23, length: 7, type: "double", required: true}, // importo ticket
        totale: {id: 24, length: 8, type: "double", required: true}, // importo totale
        posContabile: {id: 25, length: 1, type: "string", required: true}, // posizione contabile
        recordID: {id: 26, length: 20, type: "string", required: true}, // identificativo Record
        CRIL: {id: 27, length: 8, type: "string", required: true}, // centro di rilevazione regionale CRIL
        op: {id: 28, length: 1, type: "string", required: true}, // onere prestazione
        tipoAccesso: {id: 29, length: 1, type: "string", required: true}, // tipo accesso, se è primo accesso o meno 0->altro 1-> primo accesso
        tempoMax: {id: 30, length: 1, type: "string", required: true}, // garanzia tempi massimi
        classePrior: {id: 31, length: 1, type: "string", required: true}, // Classe priorità
        vuoto: {id: 32, length: 2, type: "string", required: false}, // campo vuoto
    },
	_checkMeseAnnoStruttura(ricette) {
        //chiave: mmAAAA, count: ?
        let datePrestazioni = {}
        let dateRiga99 = {}
        let dateMancanti99 = []
        let datePrestazioniMancanti = []
        let dateFuoriPeriodoDiCompetenza = []
        let codiceStruttura = null;
        for (let ricetta of ricette) {
            let key99 = null;
            if (!codiceStruttura && codiceStruttura !== "error") codiceStruttura = ricetta.riga99.arseID;
            if (ricetta.riga99.dataErog !== "") {
                try {
                    key99 = (ricetta.riga99.dataErog.month() + 1).toString() + ricetta.riga99.dataErog.year().toString()
                    if (key99.length === 5) key99 = "0" + key99;
                    if (ricetta.riga99.posContabile === "2" || ricetta.riga99.posContabile === "3") {
                        if (!dateFuoriPeriodoDiCompetenza.hasOwnProperty(key99))
                            dateFuoriPeriodoDiCompetenza[key99] = 1
                        else
                            dateFuoriPeriodoDiCompetenza[key99] = dateFuoriPeriodoDiCompetenza[key99] + 1;
                    } else { // se non c'è lo consideriamo nel periodo di competenza
                        if (!dateRiga99.hasOwnProperty(key99))
                            dateRiga99[key99] = 1
                        else
                            dateRiga99[key99] = dateRiga99[key99] + 1;
                    }
                    //controllo codice struttura
                    if (codiceStruttura !== "error")
                        if (codiceStruttura !== ricetta.riga99.arseID)
                            codiceStruttura = "error";
                } catch (ex) {
                    dateMancanti99.push(ricetta.riga99);
                }
            } else
                dateMancanti99.push(ricetta.riga99);
            for (let prestazione of ricetta.prestazioni) {
                if (prestazione.dataErog) {
                    try {
                        let key = (prestazione.dataErog.month() + 1).toString() + prestazione.dataErog.year().toString()
                        if (key.length === 5) key = "0" + key;
                        if (prestazione.posContabile === "2" || prestazione.posContabile === "3") {
                            if (!dateFuoriPeriodoDiCompetenza.hasOwnProperty(key))
                                dateFuoriPeriodoDiCompetenza[key] = 1
                            else
                                dateFuoriPeriodoDiCompetenza[key] = dateFuoriPeriodoDiCompetenza[key] + 1;
                        } else { // se non c'è lo consideriamo nel periodo di competenza
                            if (key99 === null || key === key99) {
                                if (!datePrestazioni.hasOwnProperty(key))
                                    datePrestazioni[key] = 0
                                else
                                    datePrestazioni[key] = datePrestazioni[key] + 1;
                            }
                        }
                        //controllo codice struttura
                        if (codiceStruttura !== "error")
                            if (codiceStruttura !== prestazione.arseID)
                                codiceStruttura = "error";
                    } catch (ex) {
                        datePrestazioniMancanti.push(prestazione);
                    }
                }
            }
        }
        let out = {date: [], risultato: {}}
        let totale = 0
        for (let key99 of Object.keys(dateRiga99)) {
            if (out.date.hasOwnProperty(key99))
                out.date[key99].count = out.date[key99].count + dateRiga99[key99];
            else
                out.date[key99] = {count: dateRiga99[key99]}
            totale += dateRiga99[key99];
        }
        for (let key of Object.keys(datePrestazioni)) {
            if (out.date.hasOwnProperty(key))
                out.date[key].count = out.date[key].count + datePrestazioni[key];
            else
                out.date[key] = {count: datePrestazioni[key]}
            totale += datePrestazioni[key];
        }
        for (let keyFuori of Object.keys(dateFuoriPeriodoDiCompetenza)) {
            if (out.date.hasOwnProperty(keyFuori))
                out.date[keyFuori].count = out.date[keyFuori].count + dateFuoriPeriodoDiCompetenza[keyFuori];
            else
                out.date[keyFuori] = {count: dateFuoriPeriodoDiCompetenza[keyFuori]}
            totale += dateFuoriPeriodoDiCompetenza[keyFuori];
        }
        let chiaveDataPrevalente = null
        for (let key of Object.keys(out.date)) {
            if (chiaveDataPrevalente === null)
                chiaveDataPrevalente = key;
            out.date[key].percentuale = ((out.date[key].count * 100) / totale).toFixed(2);
            if (out.date[key].percentuale > out.date[chiaveDataPrevalente].percentuale)
                chiaveDataPrevalente = key;
        }
        return {
            meseAnnoPrevalente: chiaveDataPrevalente,
            totale: out.date[chiaveDataPrevalente].count,
            percentuale: out.date[chiaveDataPrevalente].percentuale,
            codiceStruttura: codiceStruttura,
            date: out.date,
        };
    },
	ottieniStatDaFileFlussoM(fileContent, fileName, includiRicette = false) {
        let strutture = struttureSts11.getStruttureMap();
        let ricetteInFile = this._elaboraFileFlussoM(fileContent, fileName);
        let warn = "";
        if (ricetteInFile.error) {
            console.log("file " + fileName + " con errori");
            return {errore: true, out: ricetteInFile};
        } else {
            let verificaDateStruttura = this._checkMeseAnnoStruttura(Object.values(ricetteInFile.ricette))
            ricetteInFile.codiceStruttura = verificaDateStruttura.codiceStruttura;
            ricetteInFile.file = fileName;
            ricetteInFile.idDistretto = strutture[verificaDateStruttura.codiceStruttura]?.idDistretto.toString() ?? (ricetteInFile.datiDaFile?.idDistretto ?? "X");
            ricetteInFile.annoPrevalente = verificaDateStruttura.meseAnnoPrevalente.substr(2, 4);
            ricetteInFile.mesePrevalente = verificaDateStruttura.meseAnnoPrevalente.substr(0, 2);
            ricetteInFile.date = _.omitBy(verificaDateStruttura.date, _.isNil);
					if (!includiRicette)
						delete ricetteInFile.ricette;
            if (!strutture.hasOwnProperty(verificaDateStruttura.codiceStruttura)) {
                console.log("STRUTTURA " + verificaDateStruttura.codiceStruttura + " non presente sul FLOWLOOK")
                warn = "STRUTTURA " + verificaDateStruttura.codiceStruttura + " non presente sul FLOWLOOK"
            }
            return {errore: false, warning: (warn === "" ? false : warn), out: ricetteInFile}
        }
    },
	_verificaLunghezzaRiga (starts) {
    let lunghezza = 0;
    for (let val of Object.values(starts))
        lunghezza += val.length;
    return lunghezza;
},
	_mRowToJson (row, starts) {
    var obj = {}
    let from = 0;
    for (let key in starts) {
        obj[key] = row.substr(from, starts[key].length).trim().toUpperCase();
        if (starts[key].type === "date") {
            if (moment(obj[key], "DDMMYYYY").isValid())
                obj[key] = moment(obj[key], "DDMMYYYY");
        } else if (starts[key].type === "double")
            obj[key] = obj[key] === "" ? 0 : parseFloat(obj[key].replace(',', '.'));
        else if (starts[key].type === "int")
            obj[key] = parseInt(obj[key]);
        from += starts[key].length;
    }
    return obj;
},
_getLinesFromBase64File(text) {
  let percentEncodedStr = '';
  for (let i = 0; i < text.length; i++)
    percentEncodedStr += '%' + ('00' + text.charCodeAt(i).toString(16)).slice(-2);
  const decodedString = decodeURIComponent(percentEncodedStr);
  const linesArray = decodedString.split(/\r?\n/); // Gestisce sia \n che \r\n
  return linesArray;
},
	_elaboraFileFlussoM(fileContent, fileName) {

        var i = 0;
        var ricette = {};
        var ricettaTemp = [];
        let totale = {
            totale: 0,
            ticket: 0,
            numPrestazioni: 0,
            totalePrestazioniCalcolate: 0,
            perStrutture: {}
        }

        let prestMap = {}
        let lunghezzaRiga = this._verificaLunghezzaRiga(this._startsFlussoMV10082012);
        let error = null;
			  const arrayOfRows = this._getLinesFromBase64File(fileContent);
				const righeTotali = arrayOfRows.length;
        while (i<righeTotali) {
					const nextLine = arrayOfRows[i];
					if (nextLine.length == lunghezzaRiga) {
                var t = this._mRowToJson(nextLine, this._startsFlussoMV10082012);
                ricettaTemp.push(t);
                if (t.progrRicetta === "99") {
                    var rt = this._buildRicetteFromMRows(ricettaTemp);
                    //TODO: filtro?
                    ricette[rt.id] = rt;
                    totale.totalePrestazioniCalcolate = totale.totalePrestazioniCalcolate + rt.totalePrestazioniCalcolate;
                    totale.numPrestazioni = totale.numPrestazioni + rt.numPrestazioni;
                    this._calcolaTotaliPrestazioni(rt.prestazioni, prestMap)
                    totale.totale = totale.totale + rt.totale;
                    totale.ticket = totale.ticket + rt.totaleTicket;
                    if (!totale.perStrutture.hasOwnProperty(rt.codiceStruttura))
                        totale.perStrutture[rt.codiceStruttura] = {
                            totale: 0,
                            ticket: 0,
                            numPrestazioni: 0,
                            totalePrestazioniCalcolate: 0
                        }
                    totale.perStrutture[rt.codiceStruttura].totale = totale.perStrutture[rt.codiceStruttura].totale + rt.totale;
                    totale.perStrutture[rt.codiceStruttura].ticket = totale.perStrutture[rt.codiceStruttura].ticket + rt.totaleTicket;
                    totale.perStrutture[rt.codiceStruttura].numPrestazioni = totale.perStrutture[rt.codiceStruttura].numPrestazioni + rt.numPrestazioni;
                    totale.perStrutture[rt.codiceStruttura].totalePrestazioniCalcolate = totale.perStrutture[rt.codiceStruttura].totalePrestazioniCalcolate + rt.totalePrestazioniCalcolate;
                    ricettaTemp = [];
                }
            }
					else 
						 if (i!== righeTotali -1)
							 error = true;
				i++;
				}
        if (error === null) {
            totale.prestazioniMap = prestMap;
            totale.totalePrestazioniCalcolate = parseFloat(totale.totalePrestazioniCalcolate.toFixed(2));
            totale.totale = parseFloat(totale.totale.toFixed(2));
            totale.ticket = parseFloat(totale.ticket.toFixed(2));
            let datiDaFile = this._controllaNomeFileFlussoM(fileName);
            let calcolaPrestazioniPerMese = this._totaliMeseAnnoStruttura(Object.values(ricette))
            return {
                nomeFile: fileName,
							  md5: flussiHelper.generateHash(fileContent),
                datiDaFile: datiDaFile,
                totaleNetto: totale.totale,
                totaleLordo: parseFloat((totale.totale + totale.ticket).toFixed(2)),
                totaleTicket: totale.ticket,
                numPrestazioni: totale.numPrestazioni,
                perStrutture: totale.perStrutture,
                totaleLordoPrestazioniCalcolate: parseFloat(totale.totalePrestazioniCalcolate.toFixed(2)),
                calcolaPrestazioniPerMese: calcolaPrestazioniPerMese,
                prestazioni: totale.prestazioniMap,
                numeroRighe: i,
                numeroRicette: Object.values(ricette).length,
                ricette: ricette,
                nonOk: Object.values(ricette).filter((p) => p.differenzeTotale !== 0)
            }
        } else
            return {
                error: true,
                rowError: i + 1,
                nomeFile: fileName,
            }
    },
	_buildRicetteFromMRows(rows) {
        let ricetta = {}
        let riga99 = rows.filter((p) => p.progrRicetta === "99")[0];
        let prestazioni = rows.filter((p) => p.progrRicetta !== "99");
        var totPrestazioniCalcolate = prestazioni.reduce(function (tot, arr) {
            // return the sum with previous value
            return tot + arr.totale;
            // set initial value as 0
        }, 0);

        if (riga99 != null) {
            ricetta.id = riga99.ricettaID;
            ricetta.dataPren = moment(riga99.dataPren, "MM-DD-YYYY");
            ricetta.prestazioni = prestazioni;
            ricetta.codiceStruttura = riga99.arseID;
            ricetta.cf = riga99.cf;
            ricetta.riga99 = riga99;
            ricetta.numPrestazioni = this._calcolaNumPrestazioni(prestazioni);
            ricetta.totale = riga99.totale;
            ricetta.totaleTicket = riga99.importoTicket;
            ricetta.differenzeTotale = parseFloat((totPrestazioniCalcolate - ricetta.totale - ricetta.totaleTicket).toFixed(2));
            ricetta.totalePrestazioniCalcolate = totPrestazioniCalcolate;
            return ricetta;
        } else {
            return null;
        }
    },
	  _calcolaNumPrestazioni(righe) {
        let quanti = 0;
        for (let riga of righe) {
            quanti += parseInt(riga.quant);
        }
        return quanti;
    },
	  _controllaNomeFileFlussoM(nome) {
        try {
            if (nome.length !== 14)
                return null;
            return {
                idDistretto: nome.substring(0, 1),
                codStruttura: nome.substring(1, 5),
                mese: nome.substring(5, 7),
                anno: "20" + nome.substring(7, 9),
            }
        } catch (ex) {
            return null;
        }
    },
	_totaliMeseAnnoStruttura(ricette) {
        let out = {}
        for (let ricetta of ricette) {
            let key = null;
            let dataErog99 = ricetta.riga99.dataErog ? (ricetta.riga99.dataErog.month() + 1).toString() + ricetta.riga99.dataErog.year().toString() : null
            if (dataErog99?.length < 6)
                dataErog99 = "0" + dataErog99
            for (let prestazione of ricetta.prestazioni) {
                let dataErog = prestazione.dataErog ? (prestazione.dataErog.month() + 1).toString() + prestazione.dataErog.year().toString() : null;
                if (dataErog.length < 6)
                    dataErog = "0" + dataErog
                //if (dataErog !== dataErog99)
                //    console.log("data")
                key = (prestazione.arseID.substring(0, 4)) + (dataErog ?? dataErog99);
                if (!out.hasOwnProperty(key))
                    out[key] = {totaleLordo: 0, totaleTicket: 0, numPrestazioni: 0, totaleNetto: 0}
                out[key].totaleLordo += prestazione.totale;
                out[key].numPrestazioni += prestazione.quant;
                out[key].totaleNetto += ricetta.riga99.totale;
            }
            out[key].totaleTicket += ricetta.riga99.importoTicket;
            out[key].totaleNetto += ricetta.riga99.totale;
        }
        for (let key in out) {
            out[key].totaleLordo = parseFloat(out[key].totaleLordo.toFixed(2));
            out[key].totaleTicket = parseFloat(out[key].totaleTicket.toFixed(2));
            out[key].totaleNetto = parseFloat(out[key].totaleNetto.toFixed(2));
        }
        return out;
    },
	_calcolaTotaliPrestazioni(allPrest, mapPrest) {
        for (let prest of allPrest) {
            let key = prest.dataErog.year().toString() + ((prest.dataErog.month() + 1).toString().length === 1 ? ("0" + (prest.dataErog.month() + 1).toString()) : (prest.dataErog.month() + 1).toString());

            if (!mapPrest.hasOwnProperty(key))
                mapPrest[key] = {}

            if (mapPrest[key].hasOwnProperty(prest.prestID)) {
                mapPrest[key][prest.prestID].num = mapPrest[key][prest.prestID].num + prest.quant;
                mapPrest[key][prest.prestID].totale = parseFloat((mapPrest[key][prest.prestID].totale + (prest.totale * prest.quant)).toFixed(2));
            } else {
                mapPrest[key][prest.prestID] = {}
                mapPrest[key][prest.prestID].num = prest.quant;
                mapPrest[key][prest.prestID].totale = parseFloat((prest.totale * prest.quant).toFixed(2));
            }
        }
        return mapPrest;
    }
}