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
			
            console.log('Player count is ', playerCount);
            focusedGuild.channels.cache.forEach((channel) => {
                if(channel.name.charAt(0) == '&'){
                    if(channel.type === 'category'){
                        channel.setName(`& ${process.env.PLAYERMESSAGE}: ${playerCount}/${maxPlayers}`);
                        let childrenArr = channel.children.array();
                        childrenArr.forEach(function(c, i){
                            if(playerList.length <= i){
                                c.delete();
                            }else{
                                c.setName(playerList[i]);
                            }
                        });
                        if(childrenArr.length < playerList.length){
                            for(let i = 0; i < playerList.length - childrenArr.length; i++){
                                focusedGuild.channels.create(playerList[childrenArr.length + i],{
                                    type: 'voice',
                                    parent: channel,
                                    permissionsOverwrites: [
                                        {
                                            id: focusedGuild.roles.everyone,
                                            deny: ['CONNECT'],
                                        }
                                    ],
                                });
                            }
                            
                        }
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