const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("View the Select List queue"),
	async execute(client, interaction, database) {
		let bots = await database.Bots.listAll();

		const awaitingBots = bots.filter(
			(bot) => bot.state === "AWAITING_REVIEW"
		);
		const claimedBots = bots.filter((bot) => bot.state === "CLAIMED");

		const embed = new client.EmbedBuilder()
			.setTitle(`Queue`)
			.setColor("Random")
			.setDescription(
				`Unclaimed Bots:\n\t- ${
					awaitingBots
						.map(
							(bot) =>
								`**${bot.username}** | [Invite](${bot.invite})`
						)
						.join("\n\t- ") ||
					"There are no unclaimed bots to show!"
				}\n\nClaimed Bots:\n\t- ${
					claimedBots
						.map(
							(bot) =>
								`**${bot.username}** | [Invite](${bot.invite})`
						)
						.join("\n\t- ") || "There are no claimed bots to show!"
				}`
			);

		interaction.reply({
			embeds: [embed],
		});
	},
};
