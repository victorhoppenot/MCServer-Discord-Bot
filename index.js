require('dotenv').config();
const axios = require('axios')
const discord = require('discord.js');
const client = new discord.Client()

let focused = false;
let focusedGuild = null;
function ping() {
    if(!focused || !focusedGuild){
        return;
    }
    

    axios.get(`https://api.mcsrvstat.us/1/${process.env.SERVER}`).then(res => {

		if(res.data && res.data.players) {
			let playerCount = res.data.players.online || 0;
			
            console.log('Player count is ', playerCount);
            focusedGuild.channels.cache.forEach((channel) => {
                if(channel.name.charAt(0) == '&'){
                    channel.setName(`& Online Player Count: ${playerCount}/${process.env.MAXPLAYERS}`);
                }
            });
		}
		else
			console.log('player count could not be found ');

	}).catch(err => console.log('Error pinging api.mcsrvstat.us:', err));
}

client.on('ready', () => {
    console.log("I am ready!");
});

client.on("message", message => {
    let member = message.memebr;
    let content = message.content;
    let channel = message.channel;
    try{
        if(message.member.permissions.has('ADMINISTRATOR')){
            if(content === '&&focus'){
                focusedGuild = channel.guild;
                focused = true;
                message.reply('focused on guild');
                ping();
                setInterval(ping, Math.max(1,process.env.MIN_INTERVAL || 1) * 60000);
            }
            if(content === '&&force'){
                ping();
                message.reply('forcing player count');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

client.login(process.env.TOKEN);