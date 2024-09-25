export default {

	secret: "UxZ>69'[Tu<6",

	verifyToken: (token) => {
		try {
			const decoded = jsonwebtoken.verify(token, this.secret);
			return { valid: true, decoded };
		} catch (err) {
			return { valid: false, message: err.message };
		}
	},

	createToken: (user) => {
		return jsonwebtoken.sign(user, this.secret, {expiresIn: 60*60});
	},
	
	checkToken: () => {
		let res = this.verifyToken(appsmith.store.token);
		if (res.valid) 
			storeValue("token",this.createToken(res.decoded));
		else {
			storeValue("token",null);
			navigateTo("Login", {msg: "Sessione scaduta"});
		}
	}

}