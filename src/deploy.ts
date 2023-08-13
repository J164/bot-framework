import { type ApplicationCommandDataResolvable, REST, Routes } from 'discord.js';

export async function deployApplicationCommands(applicationCommands: ApplicationCommandDataResolvable[], botId: string, botToken: string): Promise<void> {
	await new REST({ version: '10' }).setToken(botToken).put(Routes.applicationCommands(botId), { body: applicationCommands });
}
