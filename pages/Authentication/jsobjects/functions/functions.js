export default {

	defaultTab: 'Sign In',

	setDefaultTab: (newTab) => {
		this.defaultTab = newTab;
	},

	generatePasswordHash: async () => {
		return dcodeIO.bcrypt.hashSync(inp_password.text, 10);
	},

	verifyHash: (password, hash) => {
		return dcodeIO.bcrypt.compareSync(password, hash)
	},

	createToken: async (user) => {
		return jsonwebtoken.sign(user, 'secret', {expiresIn: 60*60});
	},

	 signIn: async () => {
		const password = inp_password.text;
		//await this.generatePasswordHash();

		let user = (await getUserFromIdAndDomain.run())[0];
		 console.log("USER");
		 console.log(user);
		
		if (this.verifyHash(password, user?.password_hash)) {
			storeValue('token', await this.createToken(user))
				//.then(() => updateLogin.run({id: user.id})
				//		 )
				.then(() => showAlert('Register Success', 'success'))
		} else {
			return showAlert('Invalid emaill/password combination', 'error');
		}
	},

	register: async () => {

	},
}