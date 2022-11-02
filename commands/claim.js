const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const crypto = require("node:crypto");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("claim")
		.setDescription("Claim a Bot")
		.addUserOption((option) =>
			option
				.setName("bot")
				.setDescription("Choose the bot")
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
			const mentionedBot = interaction.options.getUser("bot");
			if (!mentionedBot.bot)
				return interaction.reply(
					"ValidationError: The user mentioned is not a bot."
				);

			const bot = await database.Bots.getBot(mentionedBot.id);
			if (!bot)
				return interaction.reply(
					"Sorry, that bot cannot be claimed as it does not exist."
				);

			if (!bot.state === "AWAITING_REVIEW" || !bot.state === "CLAIMED")
				return interaction.reply(
					"Sorry, this bot cannot be claimed as it is not in the queue."
				);

			if (bot.state === "AWAITING_REVIEW") {
				// The bot can be claimed.
				let audit_logs = [];
				bot.audit_logs.forEach((log) => audit_logs.push(log));

				audit_logs.push({
					uuid: crypto.randomUUID(),
					action: "CLAIMED",
					reason: null,
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
							"Congrats! You have claimed this bot."
						);
					})
					.catch((err) => {
						return interaction.reply(
							`An error occured while trying to claim this bot.\n\`\`\`${err}\`\`\``
						);
					});
			} else if (bot.state === "CLAIMED") {
				// The bot can be claimed, but will have to be unclaimed first.
				const currentReviewer = bot.audit_logs.filter(
					(log) => log.action === "CLAIMED"
				)[0];

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(`forceClaim-${bot.bot_id}`)
						.setLabel("Force Claim")
						.setStyle(ButtonStyle.Danger)
				);

				return interaction.reply({
					content: `<@${currentReviewer.user}> already has claimed this bot.`,
					components: [row],
					allowedMentions: [],
				});
			}
		} else
			return interaction.reply(
				"You do not have enough permissions to use this command."
			);
	},
};
