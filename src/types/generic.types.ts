import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export type CommandModule = {data: SlashCommandBuilder, execute: (interaction: ChatInputCommandInteraction) => Promise<void>}