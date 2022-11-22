"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;

const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const logger = require("../../logger");
const availableEmojis = ["⏮️", "◀️", "⏹️", "▶️", "⏭️"];

class Pagination {
	/**
	 *
	 * @param {TextChannel | DMChannel} interaction - The target channel
	 * @param {EmbedBuilder[]} pages - Embed pages
	 * @param {string} [footerText] - Optional footer text, will show `Text 1 of 5` if you pass `Text`, for example
	 * @param {ButtonOption[]} buttons - Add extra buttons
	 * @param {number} timeout - How long button need to be active
	 * @param {ButtonOption[]} options - optional options for the buttons
	 * @param {UserResolvable} Author - To limit the pagination to a specific author
	 * @param {AttachmentBuilder[]} files - Optional files to attach
	 */
	constructor(
		interaction,
		pages,
		footerText = "Page",
		buttons,
		timeout,
		options,
		Author,
		files
	) {
		this.interaction = interaction;
		this.footerText = footerText;
		this.buttons = buttons;
		this.timeout = timeout;
		this.options = options;
		this.Author = Author;
		this.files = files;
		this.index = 0;

		this.defaultOptions = [
			{
				style: ButtonStyle.Primary,
				emoji: "⏮️",
			},
			{
				style: ButtonStyle.Primary,
				emoji: "◀️",
			},
			{
				style: ButtonStyle.Danger,
				emoji: "⏹️",
			},
			{
				style: ButtonStyle.Primary,
				emoji: "▶️",
			},
			{
				style: ButtonStyle.Primary,
				emoji: "⏭️",
			},
		];

		if (options && options.length > 5)
			throw new TypeError(
				"You have passed more than 5 buttons as options"
			);
		else if (options && options.length < 4)
			throw new TypeError(
				"You have passed less than 5 buttons as options"
			);

		if (files) this.files = files;

		this.pages = pages.map((page, pageIndex) => {
			if (
				page.data.footer &&
				(page.data.footer.text || page.data.footer.icon_url)
			)
				return page;

			return page.setFooter({
				text: `Executed by ${interaction.user.tag} | ${footerText} ${
					pageIndex + 1
				}/${pages.length}`,
				iconURL: this.interaction.user.displayAvatarURL(),
			});
		});
	}

	/**
	 * Starts the pagination
	 */
	async paginate() {
		let collect = null;
		const options = this.options || this.defaultOptions;
		const extraButtons = this.buttons;

		if (!extraButtons)
			this.message = await this.interaction.reply({
				embeds: [this.pages[this.index]],
				...(this.files && { files: [this.files[this.index]] }),
				components: [
					new ActionRowBuilder({
						components: options.map((x, i) => {
							return new ButtonBuilder({
								emoji: x.emoji,
								style: x.style,
								type: 2,
								label: x.label,
								customId: availableEmojis[i],
							});
						}),
					}),
				],
			});
		else
			this.message = await this.interaction.reply({
				embeds: [this.pages[this.index]],
				...(this.files && { files: [this.files[this.index]] }),
				components: [
					new ActionRowBuilder({
						components: options.map((x, i) => {
							return new ButtonBuilder({
								emoji: x.emoji,
								style: x.style,
								type: 2,
								label: x.label,
								customId: availableEmojis[i],
							});
						}),
					}),
					new ActionRowBuilder({
						components: extraButtons,
					}),
				],
			});

		if (this.pages.length < 2) return;

		const author = this.Author ? this.interaction.user : undefined;

		const interactionCollector =
			(collect = this.message) === null || collect === void 0
				? void 0
				: collect.createMessageComponentCollector({
						max: this.pages.length * 5,
						filter: (x) => {
							return !(author && x.user.id !== author.id);
						},
				  });

		/*setTimeout(
			async () => {
				let nightmare = null;
				interactionCollector === null || interactionCollector === void 0
					? void 0
					: interactionCollector.stop("Timeout");

				await ((nightmare =
					this === null || this === void 0
						? void 0
						: this.message) === null || nightmare === void 0
					? void 0
					: nightmare.update({
							content:
								"This interaction has expired due to hitting it's timeout.",
							embeds: [],
							components: [],
					  }));
			},

			this.timeout ? this.timeout : 60000
		);*/

		interactionCollector === null || interactionCollector === void 0
			? void 0
			: interactionCollector.on("collect", async (i) => {
					const { customId } = i;

					if (customId === "readAllNotifications") {
						interactionCollector.stop(
							"notifications marked as read"
						);

						return await i.update({
							content:
								"All notifications have been marked as read!",
							embeds: [],
							components: [],
						});
					}

					if (
						customId.startsWith("claim-") ||
						customId.startsWith("forceClaim-")
					)
						return;

					let newIndex =
						customId === availableEmojis[0]
							? 0 // Start
							: customId === availableEmojis[1]
							? this.index - 1 // Prev
							: customId === availableEmojis[2]
							? NaN // Stop
							: customId === availableEmojis[3]
							? this.index + 1 // Next
							: customId === availableEmojis[4]
							? this.pages.length - 1 // End
							: this.index;

					if (isNaN(newIndex)) {
						// Stop
						interactionCollector.stop("stopped by user");

						await i.update({
							content:
								"The interaction has expired due to Stop button being clicked by user.",
							embeds: [],
							components: [],
						});
					} else {
						if (newIndex < 0) newIndex = 0;
						if (newIndex >= this.pages.length)
							newIndex = this.pages.length - 1;

						this.index = newIndex;

						if (this.interaction.commandName === "queue") {
							if (
								this.pages[this.index].data.fields.filter(
									(p) => p.name === "State"
								)[0].value === "CLAIMED"
							) {
								this.buttons[0].data.label = "Force Claim";
								this.buttons[0].data.custom_id = `forceClaim-${
									this.pages[this.index].data.fields.filter(
										(p) =>
											p.name === "Application Identifier"
									)[0].value
								}`;
							} else {
								this.buttons[0].data.label = "Claim";
								this.buttons[0].data.custom_id = `claim-${
									this.pages[this.index].data.fields.filter(
										(p) =>
											p.name === "Application Identifier"
									)[0].value
								}`;
							}

                            this.buttons[1].data.url = this.pages[this.index].data.fields.filter((p) => p.name === "Invite")[0].value;
						}

                        if (this.interaction.commandName === "discover") {
                            this.buttons[0].data.url = this.pages[this.index].data.fields.filter((p) => p.name === "Invite")[0].value;
                        }

						const options = this.options || this.defaultOptions;

						if (
							this.buttons === undefined ||
							this.buttons === null ||
							this.buttons.length === 0
						) {
							await i.update({
								embeds: [this.pages[this.index]],
								...(this.files && {
									files: [this.files[this.index]],
								}),
								components: [
									new ActionRowBuilder({
										components: options.map((x, i) => {
											return new ButtonBuilder({
												emoji: x.emoji,
												style: x.style,
												type: 2,
												label: x.label,
												customId: availableEmojis[i],
											});
										}),
									}),
								],
							});
						} else {
							await i.update({
								embeds: [this.pages[this.index]],
								...(this.files && {
									files: [this.files[this.index]],
								}),
								components: [
									new ActionRowBuilder({
										components: options.map((x, i) => {
											return new ButtonBuilder({
												emoji: x.emoji,
												style: x.style,
												type: 2,
												label: x.label,
												customId: availableEmojis[i],
											});
										}),
									}),
									new ActionRowBuilder({
										components: this.buttons,
									}),
								],
							});
						}
					}
			  });

		interactionCollector === null || interactionCollector === void 0
			? void 0
			: interactionCollector.on("end", async (msg) => {
					let collect = null;
					await ((collect =
						this === null || this === void 0
							? void 0
							: this.message) === null || collect === void 0
						? void 0
						: logger.info("Pagination (Interaction)", "Closed!"));
			  });
	}
}

exports.Pagination = Pagination;
//# sourceMappingURL=index.js.map
