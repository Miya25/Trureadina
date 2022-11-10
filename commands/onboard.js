const { SlashCommandBuilder } = require("discord.js");
const { start, approve, deny, register, reset } = require("../onboarding");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("onboard")
		.setDescription(
			"Will you be a good fit for Select List? Let's find that out!"
		)
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("start")
				.setDescription("Start a Onboarding session")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("approve")
				.setDescription("Approve a Onboarding session")
				.addUserOption((user) =>
					user
						.setName("user")
						.setDescription(
							"Who's Onboarding session are you approving?"
						)
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("deny")
				.setDescription("Deny a Onboarding session")
				.addUserOption((user) =>
					user
						.setName("user")
						.setDescription(
							"Who's Onboarding session are you denying?"
						)
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("register")
				.setDescription("Register a Onboarding session")
				.addUserOption((user) =>
					user
						.setName("user")
						.setDescription(
							"Who are you registering the Onboarding session for?"
						)
						.setRequired(true)
				)
				.addStringOption((position) =>
					position
						.setName("position")
						.setDescription("What is the requested staff position?")
						.setRequired(true)
						.addChoices(
							{
								name: "Bot Reviewer",
								value: "BOT_REVIEWER",
							},
							{
								name: "Select Social Moderator",
								value: "SELECT_SOCIAL_MODERATOR",
							},
							{
								name: "Test Position",
								value: "TEST_POSITION_9393",
							}
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("reset")
				.setDescription("Reset a registered Onboarding session")
				.addUserOption((user) =>
					user
						.setName("user")
						.setDescription(
							"Who's Onboarding session are you resetting?"
						)
						.setRequired(true)
				)
		),
	async execute(client, interaction, database) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "start":
				await start(client, interaction, database);
				break;

			case "approve":
				await approve(client, interaction, database);
				break;

			case "deny":
				await deny(client, interaction, database);
				break;

			case "register":
				await register(client, interaction, database);
				break;

			case "reset":
				await reset(client, interaction, database);
				break;

			default:
				interaction.reply("That subcommand does not exist.");
				break;
		}
	},
};
