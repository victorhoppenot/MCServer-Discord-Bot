require('dotenv').config();
const axios = require('axios')
const discord = require('discord.js');
const client = new discord.Client()

let focused = false;
let focusedMessage = null;
let interval = null;

function ping() {
	if (!focused || !focusedMessage) {
		return;
	}


	axios.get(`https://api.mcsrvstat.us/1/${process.env.SERVER}`).then(res => {

		if (res.data && res.data.players) {
			let playerCount = res.data.players.online || 0;
			let maxPlayers = res.data.players.max || 0;
			let playerList = res.data.players.list;
			if (playerCount == 0) {
				focusedMessage.edit('No one is currently online (0/' + maxPlayers + ')' );
			}else{
				let message = 'Currently ' + playerCount + '/' + maxPlayers + ' players are online:\n';
				for(let i = 0; i < playerList.length; i++){
					message += '- ' + playerList[i] + '\n';
				}
				focusedMessage.edit(message);
			}

			console.log('Player count is ', playerCount);

		} else
			console.log('player count could not be found ');

	}).catch(err => console.log('Error pinging api.mcsrvstat.us:', err));
}

client.on('ready', () => {
	console.log("I am ready!");
});

client.on("message", message => {
	let member = message.member;
	let content = message.content;
	let channel = message.channel;
	try {
		if (member.permissions.has('ADMINISTRATOR')) {
			if (content === '&&focus') {
				member.send('focused on channel');
				channel.send('here').then(sent => {
					focusedMessage = sent;
					focused = true;
				});
				
				
				ping();
				interval = setInterval(ping, process.env.INTERVAL);
			}
			if (content === '&&force') {
				ping();
				member.send('forcing player count');
			}
			if (content === '&&unfocus') {
				member.send('unfocused on channel');
				focusedMessage = null;
				focused = false;
				clearInterval(interval);
			}	
		}
	} catch (error) {
		console.log(error);
	}
});

client.login(process.env.TOKEN);
