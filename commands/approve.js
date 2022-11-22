const { SlashCommandBuilder } = require("@discordjs/builders");
const Panel_Logging = require("../panel_logs");
const crypto = require("node:crypto");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("approve")
		.setDescription("Approve a Bot")
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
				.setDescription("Reason for approval")
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
			const bot = await database.Bots.getBot(
				interaction.options.getString("bot")
			);
			const reason = interaction.options.getString("reason");

			if (!bot)
				return interaction.reply(
					"Sorry, that bot cannot be approved as it does not exist."
				);

			if (bot.state === "CLAIMED") {
				// The bot can be claimed.
				let audit_logs = [];
				bot.audit_logs.forEach((log) => audit_logs.push(log));

				audit_logs.push({
					uuid: crypto.randomUUID(),
					action: "APPROVED",
					reason: reason,
					user: interaction.user.id,
				});

				await database.Bots.updateBot(
					bot.bot_id,
					bot.avatar,
					bot.username,
					bot.description,
					bot.long_description,
					"APPROVED",
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
							2,
							reason
						).render();

						return interaction.reply(
							"Congrats! You have approved this bot."
						);
					})
					.catch((err) => {
						return interaction.reply(
							`An error occured while trying to approve this bot.\n\`\`\`${err}\`\`\``
						);
					});
			} else
				return interaction.reply(
					"Sorry, this bot cannot be approved as it is not in the queue or was not claimed."
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
