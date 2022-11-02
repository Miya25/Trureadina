const { DataTypes } = require("sequelize");

const schema = {
	user_id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},

	uuid: {
		type: DataTypes.STRING,
	},

	username: {
		type: DataTypes.STRING,
	},

	bio: {
		type: DataTypes.STRING,
	},

	avatar: {
		type: DataTypes.STRING,
	},

	onboarding: {
		type: DataTypes.JSON,
	},

	auth_token: {
		type: DataTypes.STRING,
	},

	roles: {
		type: DataTypes.JSON,
	},

	flags: {
		type: DataTypes.JSON,
	},

	badges: {
		type: DataTypes.JSON,
	},

	posts: {
		type: DataTypes.JSON,
	},
};

module.exports = {
	name: "users",
	schema: schema,
};
