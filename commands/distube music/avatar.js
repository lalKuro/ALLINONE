const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Zeigt ihren Avatar mit einem download Link an')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Auswählbarer User')
                .setRequired(false)),
    async execute(interaction) {
       
        const createAvatarEmbed = (user) => {
            const avatarUrlPng = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            const avatarUrlJpeg = user.displayAvatarURL({ format: 'jpeg', dynamic: true, size: 1024 });

            return new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user.username}'s Avatar`)
                .setImage(avatarUrlPng)
                .setDescription(`
                    **[Download PNG](${avatarUrlPng})**
                    **[Download JPEG](${avatarUrlJpeg})**
                `)
                .setTimestamp();
        };

        if (interaction.isCommand && interaction.isCommand()) {
           
            const user = interaction.options.getUser('user') || interaction.user;
            const embed = createAvatarEmbed(user);
            await interaction.reply({ embeds: [embed] });
        } else {
           
            const args = interaction.content.split(' ').slice(1);
            let user;

            if (args.length > 0) {
                user = interaction.mentions.users.first() || interaction.client.users.cache.get(args[0]);
            }
            if (!user) {
                user = interaction.author;
            }

            const embed = createAvatarEmbed(user);
            await interaction.reply({ embeds: [embed] });
        }
    },
};
