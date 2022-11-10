// Packages
const {
	Client,
	GatewayIntentBits,
	ActivityType,
	codeBlock,
	EmbedBuilder,
} = require("discord.js");
const crypto = require("crypto");
const fetch = require("node-fetch");
const fs = require("node:fs");
const logger = require("./logger");
const database = require("./database/handler");

// Environment Variables
require("dotenv").config();

// Create Discord Client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Discord Client Additions
require("./extension")(client);
client.EmbedBuilder = EmbedBuilder;
client.codeBlock = codeBlock;
client.fetch = fetch;

// Discord Ready Event
client.once("ready", async () => {
	client.user.setActivity("our Developer build", {
		type: ActivityType.Listening,
	});

	client.user.setStatus("idle");

	logger.success("Discord", "Connected!");
});

// Discord Debug Event
client.on("debug", (info) => logger.info("Discord Debug", info));

// Discord Error Event
client.on("error", (error) => logger.error("Discord Error", error));

// Commands
client.commands = new Map();
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Buttons
client.buttons = new Map();
const buttonFiles = fs
	.readdirSync("./buttons")
	.filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	client.buttons.set(button.data.name, button);
}

// Modals
client.modals = new Map();
const modalFiles = fs
	.readdirSync("./modals")
	.filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
	const modal = require(`./modals/${file}`);
	client.modals.set(modal.data.name, modal);
}

// Discord Guild Member Update Event
client.on("guildMemberUpdate", async (oldInfo, newInfo) => {
	const roles = [];
	const allowedRoles = [
		{
			name: "Owner",
			id: "1008472299239903242",
		},
		{
			name: "Administrator",
			id: "1001584270126633041",
		},
		{
			name: "Staff Manager",
			id: "1028636226015739914",
		},
		{
			name: "Developer",
			id: "1001629848596385833",
		},
		{
			name: "Moderator",
			id: "1001584438314008777",
		},
		{
			name: "Select Social Moderator",
			id: "1030233535941988505",
		},
		{
			name: "Bot Reviewer",
			id: "1001610329379328101",
		},
	];

	newInfo.roles.cache
		.map((role) => role.id)
		.forEach((role) => {
			const roleData = allowedRoles.filter((data) => data.id === role);

			if (!roleData[0]) return;
			else
				roles.push(roleData[0].name.toUpperCase().replaceAll(" ", "_"));
		});

	const data = await database.User.getUser(newInfo.id);

	if (!data)
		await database.User.createUser(
			newInfo.id,
			newInfo.user.username,
			"None",
			newInfo.displayAvatarURL(),
			roles,
			[],
			[]
		);
	else
		await database.User.updateUser(
			newInfo.id,
			newInfo.user.username,
			data.bio,
			newInfo.displayAvatarURL(),
			roles,
			data.flags,
			data.badges,
			data.onboarding
		);
});

// Discord Message Create Event
client.on("messageCreate", async (message) => {
	let allUsers = await database.User.listAll();

	allUsers.forEach(async (user) => {
		let sessions = user.onboarding;

		let session = sessions.filter(
			(session) => session.server_id === message.guild.id
		);
		if (!session[0]) return;

		if (sessions[0].uuid === session[0].uuid) {
			sessions[0].messages.push({
				user: `${message.author.username}#${message.author.discriminator}`,
				bot: message.author.bot,
				message: message.content,
				time: message.createdAt,
			});

			await database.User.updateUser(
				user.user_id,
				user.username,
				user.bio,
				user.avatar,
				user.roles,
				user.flags,
				user.badges,
				sessions
			);
		}
	});
});

// Discord Interaction Event
client.on("interactionCreate", async (interaction) => {
	// Block banned users
	const bannedUsers = client.bannedUsers;
	if (bannedUsers.includes(interaction.user.id)) return;

	// Slash Command
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command)
			return interaction.reply(
				"It seems that the command you are looking for, does not exist at this time."
			);

		try {
			await command.execute(client, interaction, database);
		} catch (error) {
			logger.error(`Command (${interaction.commandName})`, error);

			interaction.reply(
				`I just had a massive amount of Brain Damage, hold up.\n\n${codeBlock(
					"js",
					error
				)}`
			);
		}
	}

	// Buttons
	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId);

		if (interaction.customId.startsWith("forceClaim")) {
			const bot_id = interaction.customId.replace("forceClaim-", "");

			const bot = await database.Bots.getBot(bot_id);
			if (!bot)
				return interaction.reply(
					"Sorry, that bot cannot be claimed as it does not exist."
				);

			if (!bot.state === "AWAITING_REVIEW" || !bot.state === "CLAIMED")
				return interaction.reply(
					"Sorry, this bot cannot be claimed as it is not in the queue."
				);

			let audit_logs = [];
			bot.audit_logs.forEach((log) => audit_logs.push(log));

			audit_logs.push({
				uuid: crypto.randomUUID(),
				action: "CLAIMED",
				reason: null,
				user: interaction.user.id,
			});

			audit_logs.push({
				uuid: crypto.randomUUID(),
				action: "UNCLAIMED",
				reason: "FORCE CLAIMED",
				user: interaction.user.id,
			});

			await database.Bots.updateBot(
				bot.bot_id,
				bot.username,
				bot.description,
				bot.long_description,
				"CLAIMED",
				bot.flags,
				bot.owner,
				bot.extra_owners,
				bot.library,
				bot.nsfw,
				bot.tags,
				bot.invite,
				audit_logs
			)
				.then(() => {
					return interaction.reply(
						"This bot has been force claimed!"
					);
				})
				.catch((err) => {
					return interaction.reply(
						`An error occured while trying to claim this bot.\n\`\`\`${err}\`\`\``
					);
				});
		} else {
			if (!button)
				return interaction.reply(
					"It seems that the button that you are trying to use, has not been created yet."
				);

			try {
				await button.execute(client, interaction, database);
			} catch (error) {
				logger.error(`Button (${interaction.customId})`, error);

				interaction.reply(
					`I just had a massive amount of Brain Damage, hold up.\n\n${codeBlock(
						"js",
						error
					)}`
				);
			}
		}
	}

	// Modals
	if (interaction.isModalSubmit()) {
		const modal = client.modals.get(interaction.customId);

		if (!modal)
			return interaction.reply(
				"It seems that the modal that you are trying to use, has not been created yet."
			);

		try {
			await modal.execute(client, interaction, database);
		} catch (error) {
			logger.error(`Modal (${interaction.customId})`, error);

			interaction.reply(
				`I just had a massive amount of Brain Damage, hold up.\n\n${codeBlock(
					"js",
					error
				)}`
			);
		}
	}
});

// Login to Discord
client.login(process.env.TOKEN);
