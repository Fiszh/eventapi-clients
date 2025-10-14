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

async function parseBadge(badge_data) {
    const hosts = badge_data.host;

    const urls = (hosts?.files || [])
        .filter(f => f.format === (hosts.files?.[0]?.format))
        .map(file => ({
            url: `https:${hosts.url}/${file.name}`,
            scale: file.name.replace(/\.[^/.]+$/, "").toLowerCase()
        }));

    return {
        id: badge_data.id,
        name: badge_data.name,
        tooltip: badge_data.tooltip,
        owner: [],
        urls,
    };
}

async function parsePaint(paint_data) {
    const baseFunction = paint_data.repeat ? `repeating-${paint_data.function}` : paint_data.function;
    const gradientFunction = baseFunction?.toLowerCase().replace(/_/g, "-");
    const hasStops = paint_data.stops?.length > 0;
    const isLinear = ["linear-gradient", "repeating-linear-gradient"].includes(gradientFunction);

    let gradient = "";
    if (hasStops) {
        const normalized = paint_data.stops.map(stop =>
            `${argbToRgba(stop.color)} ${stop.at * 100}%`
        ).join(', ');

        const direction = isLinear ? `${paint_data.angle}deg` : paint_data.shape;
        gradient = `${gradientFunction}(${direction}, ${normalized})`;
    }

    let paint_message = {
        id: paint_data.id,
        name: paint_data.name,
        style: gradientFunction,
        shape: paint_data.shape,
        backgroundImage: hasStops
            ? gradient
            : `url('${paint_data.image_url}')`,
        shadows: null,
        KIND: hasStops ? 'non-animated' : 'animated',
        owner: [],
        url: paint_data.image_url
    };

    if (paint_data.shadows?.length) {
        const shadows = await Promise.all(paint_data.shadows.map(s => {
            let rgbaColor = argbToRgba(s.color);
            rgbaColor = rgbaColor.replace(/rgba\((\d+), (\d+), (\d+), (\d+(\.\d+)?)\)/, 'rgba($1, $2, $3)');
            return `drop-shadow(${rgbaColor} ${s.x_offset}px ${s.y_offset}px ${s.radius}px)`;
        }));

        paint_message.shadows = shadows.join(' ');
    }

    return paint_message;
}

export default {
    parseSetData,
    getUserViaTwitchID,
    parse: {
        badge: parseBadge,
        paint: parsePaint
    },
    emoteSet: {
        bySetID: emoteSetViaSetID,
        byTwitchID: emoteSetViaTwitchID,
    },
}