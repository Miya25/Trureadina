const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluate some Code")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("javascript")
				.setDescription("Set evaluation language to Javascript")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("bash")
				.setDescription("Set evaluation language to Bash")
		),
	async execute(client, interaction, database) {
		// Fetch the subcommand name.
		const subcommand = interaction.options.getSubcommand();

		// Render the modal.
		const modal = new ModalBuilder()
			.setCustomId(`${subcommand}-eval`)
			.setTitle("Evaluate your Code");

		const code = new TextInputBuilder()
			.setCustomId("code")
			.setLabel("Code")
			.setPlaceholder(`Write your "${subcommand}" Code here!`)
			.setStyle(TextInputStyle.Paragraph)
			.setMinLength(1)
			.setRequired(true);

		const inline = new TextInputBuilder()
			.setCustomId("inline")
			.setLabel("Do you want the embed to be inlined?")
			.setPlaceholder("Y/N [Default: N]")
			.setStyle(TextInputStyle.Short)
			.setMaxLength(1)
			.setRequired(false);

		const hidden = new TextInputBuilder()
			.setCustomId("hidden")
			.setLabel("Do you want the embed to be hidden?")
			.setPlaceholder("Y/N [Default: N]")
			.setStyle(TextInputStyle.Short)
			.setMaxLength(1)
			.setRequired(false);

		modal.addComponents(
			new ActionRowBuilder().addComponents(code),
			new ActionRowBuilder().addComponents(inline),
			new ActionRowBuilder().addComponents(hidden)
		);

		// Only allow staff members to use this command.
		const user = await database.User.getUser(interaction.user.id);
		if (!user)
			return interaction.reply(
				"You do not have enough permissions to use this command."
			); // User does not exist.

		if (subcommand === "javascript" || subcommand === "bash") {
			if (
				user.roles.includes("OWNER") ||
				user.roles.includes("DEVELOPER")
			)
				return interaction.showModal(modal);
			else
				return interaction.reply(
					"You do not have enough permissions to use this command."
				);
		}
	},
	async autocomplete(interaction, database) {},
};
