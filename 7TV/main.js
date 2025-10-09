async function parseSetData(data, emoteSet) {
    return data.map(emote => {
        const owner = emote?.data?.owner;
        const creator = owner?.display_name || owner?.username || (owner ? "UNKNOWN" : "NONE");

        const urls = emote.data.host.files
            .filter(file => file.format == "AVIF")
            .map(file => ({
                url: `${emote.data.host.url.startsWith('https://') ? emote.data.host.url : 'https://' + emote.data.host.url}/${file.name}`,
                size: {
                    width: file.width,
                    height: file.height
                },
                scale: file.name.replace(".avif", "")
            })).filter(Boolean);

        return {
            name: emote?.name,
            original_name: emote?.data?.name,
            emote_id: emote?.id,
            listed: emote?.data?.listed,
            flags: emote?.data?.flags,
            urls,
            creator,
            emote_link: `https://7tv.app/emotes/${emote.id}`,
            set: emoteSet === 'global' ? 'Global 7TV' : '7TV'
        };
    });
}

async function emoteSetViaSetID(emoteSetId) {
    let emote_data = [];

    try {
        const response = await fetch(`https://7tv.io/v3/emote-sets/${emoteSetId}`);

        if (response.ok) {
            const data = await response.json();

            if (data.emotes) {
                emote_data = await parseSetData(data.emotes, emoteSetId);
            };
        }
    } catch (error) {
        throw new Error('Error fetching emote data:', error);
    } finally {
        return emote_data;
    }
}

async function emoteSetViaTwitchID(twitchID) {
    let emote_data = [];

    try {
        const response = await fetch(`https://7tv.io/v3/users/twitch/${twitchID}`);

        if (response.ok) {
            const data = await response.json();

            if (data?.emote_set?.emotes) {
                emote_data = await parseSetData(data.emote_set.emotes);
            };
        }
    } catch (error) {
        throw new Error('Error fetching emote data:', error);
    } finally {
        return emote_data;
    }
}

async function getUserViaTwitchID(twitchID) {
    let user_info = {};

    try {
        const response = await fetch(`https://7tv.io/v3/users/twitch/${twitchID}`);

        if (response.ok) {
            const data = await response.json();

            if (data?.user) {
                const user_data = data.user;

                const emote_data = await parseSetData(data?.emote_set?.emotes || []);

                user_info = {
                    id: user_data?.id,
                    username: user_data?.username,
                    display_name: user_data?.display_name,
                    avatar_url: user_data?.avatar_url,
                    emote_set_id: data?.emote_set_id,
                    emote_data,
                    twitch: {
                        id: data?.id,
                        username: data?.username,
                        display_name: data?.display_name,
                    }
                }
            };
        }
    } catch (error) {
        throw new Error('Error fetching emote data:', error);
    } finally {
        return user_info;
    }
}

export default {
    parseSetData,
    getUserViaTwitchID,
    emoteSet: {
        bySetID: emoteSetViaSetID,
        byTwitchID: emoteSetViaTwitchID,
    },
}