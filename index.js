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
            let maxPlayers = res.data.players.max || 0;
            let playerList = res.data.players.list;
            if(playerCount == 0){
                playerList = [];
            }
			
            console.log('Player count is ', playerCount);
            focusedGuild.channels.cache.forEach((channel) => {
                if(channel.name.charAt(0) == '&'){
                    if(channel.type === 'category'){
                        let pos = channel.position;
                        channel.children.array().forEach(function(c, i){
                            c.delete();
                        });
                        channel.delete();

                        focusedGuild.channels.create(`& ${process.env.PLAYERMESSAGE}: ${playerCount}/${maxPlayers}`,{
                            type: 'category',
                            position: pos,
                        }).then(function(result) {
                            playerList.forEach(function(p, i){
                                focusedGuild.channels.create(p,{
                                    type: 'voice',
                                    parent: result,
                                    permissionsOverwrites: [
                                        {
                                            id: focusedGuild.roles.everyone,
                                            deny: ['CONNECT'],
                                        }
                                    ],
                                });
                            });
                        });
                    }
                    if(channel.type === "voice"){
                        channel.setName(`& ${process.env.PLAYERMESSAGE}: ${playerCount}/${maxPlayers}`);
                    }
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
    let member = message.member;
    let content = message.content;
    let channel = message.channel;
    try{
        if(member.permissions.has('ADMINISTRATOR')){
            if(content === '&&focus'){
                focusedGuild = channel.guild;
                focused = true;
                message.reply('focused on guild');
                ping();
                setInterval(ping, process.env.INTERVAL * 60000);
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