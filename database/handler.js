// Packages
const { Sequelize, Model } = require("sequelize");
const crypto = require("node:crypto");
const fs = require("node:fs");
const logger = require("../logger");
require("dotenv").config();

// Connect to PostgreSQL database
const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.PGHOST,
	username: "select",
	database: "selectlist",
	password: "password",
	port: process.env.PGPORT,
	logging: (data) => {
		return;
	},
});

sequelize
	.authenticate()
	.then(() => logger.info("Postgres", "Connected to Postgres"))
	.catch((err) =>
		logger.error("Postgres", `Unable to connect to Postgres\nError: ${err}`)
	);

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schema")
	.filter((file) => file.endsWith(".js"));
const schemas = {};
const schemaData = {};

for (const file of schemaFiles) {
	const schema = require(`./schema/${file}`);

	schemaData[schema.name] = schema;
	schemas[schema.name] = sequelize.define(schema.name, schema.schema);
}

// User
class User extends Model {
	static async getUser(user_id) {
		const data = await User.findOne({
			where: {
				user_id: user_id,
			},
		});

		return data;
	}

	static async createUser(
		user_id,
		username,
		bio,
		avatar,
		roles,
		flags,
		badges
	) {
		const data = await User.create({
			user_id: user_id,
			uuid: crypto.randomUUID(),
			auth_token: crypto.randomUUID(),
			username: username,
			bio: bio,
			avatar: avatar,
			roles: roles,
			flags: flags,
			badges: badges,
			onboarding: [],
			posts: [],
		});

		User.sync();

		return data;
	}

	static async updateUser(
		user_id,
		username,
		bio,
		avatar,
		roles,
		flags,
		badges,
		onboarding
	) {
		const data = await User.update(
			{
				username: username,
				bio: bio,
				avatar: avatar,
				roles: roles,
				flags: flags,
				badges: badges,
				onboarding: onboarding,
			},
			{
				where: {
					user_id: user_id,
				},
			}
		);

		User.sync();

		return data;
	}

	static async createPost(user_id, type, text, image) {
		const user = await User.findOne({
			where: {
				user_id: user_id,
			},
		});

		const posts = [];

		user.posts.map((post) => posts.push(post));

		posts.push({
			uuid: crypto.randomUUID(),
			type: type,
			text: text,
			image: image,
		});

		const data = await User.update(
			{
				posts: posts,
			},
			{
				where: {
					user_id: user_id,
				},
			}
		);

		User.sync();

		return data;
	}

	static async deleteUser(user_id) {
		const user = await User.destroy({
			where: {
				user_id: user_id,
			},
		});

		User.sync();

		return user;
	}

	static async listAll() {
		return await User.findAll();
	}
}

// Bots
class Bots extends Model {
	static async getBot(bot_id) {
		const data = await Bots.findOne({
			where: {
				bot_id: bot_id,
			},
		});

		return data;
	}

	static async createBot(
		bot_id,
		username,
		description,
		long_description,
		state,
		flags,
		owner,
		extra_owners,
		library,
		nsfw,
		tags,
		invite
	) {
		const data = await Bots.create({
			bot_id: bot_id,
			uuid: crypto.randomUUID(),
			username: username,
			description: description,
			long_description: long_description,
			state: state,
			flags: flags,
			owner: owner,
			extra_owners: extra_owners,
			library: library,
			nsfw: nsfw,
			tags: tags,
			invite: invite,
			audit_logs: [
				{
					uuid: crypto.randomUUID(),
					action: "BOT_ADDED",
					reason: null,
					user: owner,
				},
			],
		});

		Bots.sync();

		return data;
	}

	static async updateBot(
		bot_id,
		username,
		description,
		long_description,
		state,
		flags,
		owner,
		extra_owners,
		library,
		nsfw,
		tags,
		invite,
		audit_logs
	) {
		const data = await Bots.update(
			{
				username: username,
				description: description,
				long_description: long_description,
				state: state,
				flags: flags,
				owner: owner,
				extra_owners: extra_owners,
				library: library,
				nsfw: nsfw,
				tags: tags,
				invite: invite,
				audit_logs: audit_logs,
			},
			{
				where: {
					bot_id: bot_id,
				},
			}
		);

		Bots.sync();

		return data;
	}

	static async listAll() {
		return await Bots.findAll();
	}
}

// Initialize schemas
const init = () => {
	User.init(schemaData["users"].schema, {
		sequelize: sequelize,
		modelName: schemaData["users"].name,
	});

	Bots.init(schemaData["bots"].schema, {
		sequelize: sequelize,
		modelName: schemaData["bots"].name,
	});
};

init();

// Expose Classes
module.exports = {
	User,
	Bots,
};
