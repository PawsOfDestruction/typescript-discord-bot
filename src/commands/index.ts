import fs from 'node:fs';
import path from 'node:path';

const commands = new Map<string, Object>();

// Grab all the command folders from the commands directory you created earlier
const foldersPath = __dirname;
const commandFolders = fs.readdirSync(__dirname).filter(item => !item.includes('.'));

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {		
		const filePath = path.join(commandsPath, file);
		const command = (await import(filePath));
        commands.set(command.data.name, {...command});
	}
}


export { commands };