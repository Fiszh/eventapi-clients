## Note
This documentation was written with the assistance of Claude and ChatGPT, as English is not my first language and I have dyslexia. If you find any discrepancies between the code and this README, please feel free to submit a pull request with corrections.

## Table of Contents

1. [How to use the BTTV client](#how-to-use-the-bttv-client)
2. [Settings / Options](#settings--options)
3. [Events Emitted](#events-emitted)

   * [Emote Events](#emote-events)
   * [⚠ Note on Emote Event Data](#-note-on-emote-event-data)
4. [Subscribe / Unsubscribe](#subscribe--unsubscribe)

   * [Returns](#returns)
   * [Notes](#notes)
5. [Data Models](#data-models)

   * [Parsed Emote](#parsed-emote)
   * [Actor (User performing the action)](#actor-user-performing-the-action)

---

## How to use the BTTV client

```javascript
import BTTVWebSocket from './websocket.js'; // ES Modules (ESM)
const BTTVWebSocket = require('./websocket.js'); // CommonJS (CJS)

const client = new BTTVWebSocket({
    // your settings here
});
```

## Settings / Options

When creating a new `BTTVWebSocket` instance, you can pass an options object with the following properties:

* `reconnect` (boolean, default: `false`)
  Automatically reconnect when the WebSocket closes.
* `reconnectInterval` (number, default: `1000`)
  Time in milliseconds between reconnect attempts.
* `maxReconnectAttempts` (number, default: `Infinity`)
  Maximum number of reconnect attempts before giving up.
* `resubscribeOnReconnect` (boolean, default: `true`)
  Resubscribe to all previously subscribed channels after reconnecting.

## Events Emitted

* `open` - WebSocket connection opened
* `close` - WebSocket connection closed
* `error` - WebSocket encountered an error
* `raw` - Raw message received from the server
* `sent` - Message sent successfully
* `send_error` - Failed to send a message
* `subscribed` - Successfully subscribed to a Twitch channel
* `unsubscribed` - Successfully unsubscribed from a Twitch channel

### Emote Events

* `add_emote` - Emote added (`twitchId`, `parsed_emote`)
* `remove_emote` - Emote removed (`twitchId`, `emote_id`)
* `rename_emote` - Emote renamed (`twitchId`, `emote_data`)

### ⚠ Note on Emote Event Data

The data structure for BTTV emote events is **not uniform**:

* `add_emote` returns the **fully parsed emote object**
* `remove_emote` returns only the **emote ID**
* `rename_emote` returns the **raw emote object** from BTTV (e.g., `{ id, code }`)

Make sure to handle each case accordingly in your event listeners.

## Subscribe / Unsubscribe

Subscribe to a Twitch channel to receive emote events:

```javascript
client.subscribe(twitchId);   // Twitch user ID
client.unsubscribe(twitchId); // Twitch user ID
```

### Returns

* `true` if subscription/unsubscription succeeds
* Throws an error if the ID is missing or already subscribed/unsubscribed

### Notes

* BTTV subscriptions only need the Twitch ID; event type is automatic.
* Works with `resubscribeOnReconnect` if enabled.

## Data Models

### Parsed Emote

```json
{
  "name": "string",            // Emote code
  "original_name": "string",   // Original emote code if different
  "emote_id": "string",        // BTTV emote ID
  "flags": "number | undefined", // BTTV zero-width flag (256) or undefined
  "urls": [
    {
      "url": "string",         // Direct URL to emote image
      "scale": "string"        // 1x, 2x, 3x
    }
  ],
  "creator": "string",         // Display name, username, or "UNKNOWN"/"NONE"
  "emote_link": "string",      // Link to the emote on BTTV
  "site": "string"             // Either 'Global BTTV' or 'BTTV' depending on context
}
```

### Actor (User performing the action)

```json
{
  "username": "string",
  "display_name": "string"
}
```