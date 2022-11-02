const { DataTypes } = require("sequelize");

const schema = {
	bot_id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},

	uuid: {
		type: DataTypes.STRING,
	},

	username: {
		type: DataTypes.STRING,
	},

	description: {
		type: DataTypes.STRING,
	},

	long_description: {
		type: DataTypes.STRING,
	},

	state: {
		type: DataTypes.STRING,
	},

	flags: {
		type: DataTypes.JSON,
	},

	owner: {
		type: DataTypes.STRING,
	},

	extra_owners: {
		type: DataTypes.JSON,
	},

	library: {
		type: DataTypes.STRING,
	},

	nsfw: {
		type: DataTypes.BOOLEAN,
	},

	tags: {
		type: DataTypes.JSON,
	},

	invite: {
		type: DataTypes.STRING,
	},

	audit_logs: {
		type: DataTypes.JSON,
	},
};

module.exports = {
	name: "bots",
	schema: schema,
};
