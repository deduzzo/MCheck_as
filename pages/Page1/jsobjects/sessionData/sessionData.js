export default {
	distretto: appsmith.store.DISTRETTO_CORRENTE,
	user_id: appsmith.store.USER_ID,
	initSessionData() {
		storeValue("DISTRETTO_CORRENTE",1);
		storeValue("USER_ID","roberto.dedomenico");
	},
}