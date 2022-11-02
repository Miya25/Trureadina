const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("View the Select List queue"),
	async execute(client, interaction, database) {
		let bots = await database.Bots.listAll();

		let awaitingBots = bots.filter(
			(bot) => bot.state === "AWAITING_REVIEW"
		);
		let claimedBots = bots.filter((bot) => bot.state === "CLAIMED");

		if (awaitingBots.length === 0)
			awaitingBots = [
				{
					username: "There are no bots waiting to be reviewed!",
					bot_id: "0",
				},
			];
		if (claimedBots.length === 0)
			claimedBots = [
				{ username: "There are no claimed bots.", bot_id: "0" },
			];

		const embed = new client.EmbedBuilder()
			.setTitle(`Queue`)
			.setColor("Random")
			.setDescription(
				`Unclaimed Bots:\n\t- ${awaitingBots
					.map(
						(bot) => `**${bot.username}** | [Invite](${bot.invite})`
					)
					.join("\n\t- ")}\n\nClaimed Bots:\n\t- ${claimedBots
					.map(
						(bot) => `**${bot.username}** | [Invite](${bot.invite})`
					)
					.join("\n\t- ")}`
			);

		interaction.reply({
			embeds: [embed],
		});
	},
};
