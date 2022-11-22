const { SlashCommandBuilder } = require("@discordjs/builders");
const Panel_Logging = require("../panel_logs");
const crypto = require("node:crypto");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unclaim")
		.setDescription("Unclaim a Bot")
		.addStringOption((option) =>
			option
				.setName("bot")
				.setDescription("Choose the bot")
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Why are you unclaiming this bot?")
				.setRequired(true)
		),
	async execute(client, interaction, database) {
		// Only allow staff members to use this command.
		const user = await database.User.getUser(interaction.user.id);
		if (!user)
			return interaction.reply(
				"You do not have enough permissions to use this command."
			); // User does not exist.

		if (
			user.roles.includes("OWNER") ||
			user.roles.includes("ADMINISTRATOR") ||
			user.roles.includes("STAFF_MANAGER") ||
			user.roles.includes("DEVELOPER") ||
			user.roles.includes("MODERATOR") ||
			user.roles.includes("BOT_REVIEWER")
		) {
			const reason = interaction.options.getString("reason");

			const bot = await database.Bots.getBot(
				interaction.options.getString("bot")
			);
			if (!bot)
				return interaction.reply(
					"Sorry, that bot cannot be unclaimed as it does not exist."
				);

			if (bot.state === "CLAIMED") {
				// The bot can be unclaimed.
				let audit_logs = [];
				bot.audit_logs.forEach((log) => audit_logs.push(log));

				audit_logs.push({
					uuid: crypto.randomUUID(),
					action: "UNCLAIMED",
					reason: reason,
					user: interaction.user.id,
				});

				await database.Bots.updateBot(
					bot.bot_id,
					bot.avatar,
					bot.username,
					bot.description,
					bot.long_description,
					"AWAITING_REVIEW",
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
						new Panel_Logging(
							client,
							interaction,
							bot,
							1,
							reason
						).render();

						return interaction.reply(
							"This bot has been unclaimed!"
						);
					})
					.catch((err) => {
						return interaction.reply(
							`An error occured while trying to unclaim this bot.\n\`\`\`${err}\`\`\``
						);
					});
			} else
				return interaction.reply(
					"Sorry, this bot cannot be unclaimed as this bot is not claimed at this time."
				);
		} else
			return interaction.reply(
				"You do not have enough permissions to use this command."
			);
	},
	async autocomplete(interaction, database) {
		const focusedValue = interaction.options.getFocused();

		const bots = await database.Bots.listAll();
		const choices = bots.filter((bot) => bot.state === "CLAIMED");

		if (focusedValue === "") {
			let len = 0;
			const data = [];

			choices.forEach((i) => {
				if (len === 25) return;
				else {
					len = len + 1;
					data.push(i);
				}
			});

			await interaction.respond(
				data.map((choice) => ({
					name: `${choice.username}`,
					value: choice.bot_id,
				}))
			);
		} else {
			const filtered = choices.filter((choice) =>
				choice.username.startsWith(focusedValue)
			);

			await interaction.respond(
				filtered.map((choice) => ({
					name: `${choice.username}`,
					value: choice.bot_id,
				}))
			);
		}
	},
};
