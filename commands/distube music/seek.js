const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('seek den aktuellen song zu einer Zeit')
        .addStringOption(option =>
            option.setName('timestamp')
                .setDescription('zeit zum seek in (in sekunden oder in mm:ss format)')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
            const timestamp = interaction.options.getString('timestamp');
            await this.handleSeekCommand(interaction, timestamp);
        } else {
            const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alarm!", 
                iconURL: cmdIcons.dotIcon ,
                url: "https://discord.gg/dvWvS8kuWV"
            })
            .setDescription('- Dieser Command kann nur bei einem Slashcommand genutzt werden!\n- Bitte benutze `/seek` zum kontrollieren des Liedes.')
            .setTimestamp();
        
            await interaction.reply({ embeds: [embed] });
        
            }  
    },


    async handleSeekCommand(source, timestamp) {
        try {
            const voiceChannel = source.member.voice.channel;

            if (!voiceChannel) {
                return source.channel.send('**Du musst in einem Voice Channel sein um den Song zu seeken!**');
            }

            const permissions = voiceChannel.permissionsFor(source.client.user);
            if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
                return source.channel.send('**Ich breuche die Erlaubnis ihren Voice Channel beizutreten!**');
            }

            // Validate seek time format (either seconds or mm:ss)
            const seekSeconds = this.parseSeekTime(timestamp);
            if (seekSeconds === -1) {
                return source.channel.send('**Falsches Zeit Format. Bitte benutze sekunden (bsp., 120) oder mm:ss (bsp., 2:00).**');
            }

            await source.channel.send('**Seeken zu einem bestimmten Zeitpunkt...**');

            // Seek to the specified time
            await source.client.distube.seek(voiceChannel, seekSeconds);

            const seekEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Erflogreich seek!", 
                    iconURL: musicIcons.correctIcon ,
                     url: "https://discord.gg/dvWvS8kuWV"
                    })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
                .setDescription(`Seeked to ${this.formatTimestamp(seekSeconds)}`);

            await source.channel.send({ embeds: [seekEmbed] });

        } catch (error) {
            console.error(error);

            if (error instanceof DisTubeError && error.code === 'NO_QUEUE') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })       
                    .setDescription('Dort ist keine aktuelle Warteschlange.');

                await source.channel.send({ embeds: [noQueueEmbed] });
            } else {
                const errorMessage = 'Ein Fehler ist während des seeken aufgetaucht.';
                await source.channel.send(errorMessage);
            }
        }
    },


    parseSeekTime(timeString) {
        const timeRegex = /^(\d+):(\d+)$/;
        if (timeRegex.test(timeString)) {
            const match = timeString.match(timeRegex);
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            return minutes * 60 + seconds;
        } else if (!isNaN(timeString)) {
            return parseInt(timeString, 10);
        } else {
            return -1;
        }
    },

 
    formatTimestamp(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
};
