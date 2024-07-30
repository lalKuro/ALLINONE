const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('stelle die Lautstärke des Music Player ein')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Lautstärke zwischen 1 und 100')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
            const volumeLevel = interaction.options.getInteger('level');
            await this.setVolume(interaction, volumeLevel);
        } else {
            const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alarm!", 
                iconURL: cmdIcons.dotIcon ,
                url: "https://discord.gg/dvWvS8kuWV"
            })
            .setDescription('- Dieser Command kann nur als Slash Command genutzt werden!\n- Bitte benutze `/volume` zum benutzen des Commands.')
            .setTimestamp();
        
            await interaction.reply({ embeds: [embed] });
        
            }  
    },


    async setVolume(source, volumeLevel) {
        try {
            const voiceChannel = source.member.voice.channel;

            if (!voiceChannel) {
                return source.channel.send('**Du musst in einem Voice Channel sein um den Command benutzen zu können!**');
            }

            const permissions = voiceChannel.permissionsFor(source.client.user);
            if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
                return source.channel.send('Ich brauche die Erlaubnis um ihren Voice Channel beizutreten!');
            }

            const queue = source.client.distube.getQueue(source.guildId);
            if (!queue || !queue.playing) {
                const noSongEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({
                        name: "Oops!",
                        iconURL: musicIcons.wrongIcon,
                        url: "https://discord.gg/dvWvS8kuWV"
                    })
                    .setFooter({ text: 'DisTube Player', iconURL: musicIcons.footerIcon })
                    .setDescription('Ich spielt immoment kein Lied.');

                return source.channel.send({ embeds: [noSongEmbed] });
            }

            queue.setVolume(volumeLevel);

            const volumeEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({
                    name: "Lautstärke eingestellt",
                    iconURL: musicIcons.volumeIcon,
                    url: "https://discord.gg/dvWvS8kuWV"
                })
                .setDescription(`Die Lautstätke wurde eingestellt zu **${volumeLevel}%**.`)
                .setFooter({ text: 'DisTube Player', iconURL: musicIcons.footerIcon });

            return source.channel.send({ embeds: [volumeEmbed] });
        } catch (error) {
            console.error(error);

            const errorMessage = 'Ein Fehler ist währenddessen aufgetaucht.';
            return source.channel.send(errorMessage);
        }
    },
};
