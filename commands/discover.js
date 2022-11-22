const { SlashCommandBuilder } = require("@discordjs/builders");
const { Pagination } = require("../pagination/dist/index.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("discover")
		.setDescription("Discover bots!"),
	async execute(client, interaction, database) {
		let allBots = await database.Bots.listAll();
		allBots = allBots.filter((bot) => bot.state === "APPROVED");

		const limit = (value) => {
			let max_chars = 130;
			let i;

			const x = value.substr(0, max_chars);

			if (value.length > max_chars)
				i = `${x}... (${value.length - max_chars} characters removed)`;
			else i = value;

			return i;
		};

		const embeds = allBots.map((page) => {
			return new client.EmbedBuilder().setColor("Random").addFields([
				{
					name: "Username",
					value: String(page.username),
					inline: false,
				},
				{
					name: "Application Identifier",
					value: String(page.bot_id),
					inline: false,
				},
				{
					name: "Short Description",
					value: String(limit(page.description)),
					inline: false,
				},
				{
					name: "Long Description",
					value: String(limit(page.long_description)),
					inline: false,
				},
				{
					name: "Flags",
					value: String(
						`\n\t- ${
							page.flags.join("\n\t- ").replaceAll("_", " ") ||
							"None"
						}`
					),
					inline: false,
				},
				{
					name: "Owner(s)",
					value: String(
						`Primary: ${page.owner}\nExtra Owners: \n\t- ${
							page.extra_owners.join("\n\t- ") || "None"
						}`
					),
				},
			]);
		});

		await new Pagination(interaction, embeds, "Page").paginate();
	},
	async autocomplete(interaction, database) {},
};
