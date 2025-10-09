## Note
This documentation was written with the assistance of Claude and ChatGPT, as English is not my first language and I have dyslexia. If you find any discrepancies between the code and this README, please feel free to submit a pull request with corrections.

## Table of Contents

1. [How to use the 7TV client](#how-to-use-the-7tv-client)
2. [Settings / Options](#settings--options)
3. [Events Emitted](#events-emitted)

   * [Emote/Set Events](#emoteset-events)
   * [Cosmetic/Entitlement Events](#cosmeticentitlement-events)
4. [Subscribe to a specific event](#subscribe-to-a-specific-event)

   * [Parameters](#parameters)
   * [Returns](#returns)
   * [Notes](#notes)
5. [Data Models](#data-models)

   * [Emote](#emote)
   * [Parsed Emote](#parsed-emote)
   * [Set/Personal Set](#setpersonal-set)
   * [Create Cosmetic](#create-cosmetic)
   * [Badge](#badge)
   * [Paint](#paint)
   * [Set Change Event](#set-change-event)
   * [Actor (User performing the action)](#actor-user-performing-the-action)

## How to use the 7TV client
```javascript
import SevenTVWebSocket from './websocket.js'; // ES Modules (ESM)
const SevenTVWebSocket = require('./websocket.js'); // CommonJS (CJS)

const client = new SevenTVWebSocket({
    // your settings here
});
```

## Settings / Options
When creating a new `SevenTVWebSocket` instance, you can pass an options object with the following properties:

- `reconnect` (boolean, default: `false`)  
  Automatically reconnect when the WebSocket closes.
- `reconnectInterval` (number, default: `1000`)  
  Time in milliseconds between reconnect attempts.
- `maxReconnectAttempts` (number, default: `Infinity`)  
  Maximum number of reconnect attempts before giving up.
- `autoSubscribeToNewSetId` (boolean, default: `true`)  
  Automatically subscribe to new emote sets when a user's set changes.
- `resubscribeOnReconnect` (boolean, default: `true`)  
  Resubscribe to all previously subscribed topics after reconnecting.

## Events Emitted
- `open` - WebSocket connection opened  
- `close` - WebSocket connection closed  
- `error` - WebSocket encountered an error  
- `raw` - Raw message received from the server  
- `sent` - Message sent successfully  
- `send_error` - Failed to send a message  
- `subscribed` - Successfully subscribed to a topic  
- `unsubscribed` - Successfully unsubscribed from a topic  

### Emote/Set Events
- `add_emote` - Emote added to a set (`setId`, `actor`, `emote`)  
- `remove_emote` - Emote removed from a set (`setId`, `actor`, `emote`)  
- `rename_emote` - Emote renamed in a set (`setId`, `actor`, `{ old, new, emote_data }`)  
- `set_change` - User's emote set changed (`actor`, `setData`)  
- `create_set` - New set created (`setData`)  
- `create_personal_set` - New personal set created (`setData`)  

### Cosmetic/Entitlement Events
- `create_entitlement` - New cosmetic entitlement granted (`entitlement`)  
- `create_badge` - New badge created (`badge`)  
- `create_paint` - New paint created (`paint`)

## Subscribe to a specific event
Subscribe to a specific event type for a set or user.

```javascript
client.subscribe(id, type);
```

### Parameters
- `id` (string or number) - ID needed for a given event type:
  - `emote_set.update` - 7TV set ID
  - `user.*` - 7TV user ID  
  - `entitlement.create` - Twitch user ID
- `type` (string):
  - `emote_set.update` - Emote changes in a set
  - `user.update` - User's emote set changes
  - `entitlement.create` - Assign a new cosmetic/create new (personal set/badge/paint)

### Returns
- `true` if subscription succeeds  
- Throws an error if the ID/type is missing or already subscribed

### Notes
- `id` will be combined with the event type being subscribed to
- Works with `autoSubscribeToNewSetId` and `resubscribeOnReconnect` if enabled

## Data Models

### Emote
```json
{
  "id": "string",
  "name": "string",
  "data": { /* parsed emote data */ }
}
```

### Parsed Emote
```json
{
  "name": "string",            // The emote's display name
  "original_name": "string",   // The original name in the 7TV database
  "emote_id": "string",        // The emote's unique ID
  "listed": true | false,      // Whether the emote is listed publicly
  "flags": "number",           // 7TV flags for the emote
  "urls": [
    {
      "url": "string",         // Direct URL to the emote image (AVIF)
      "size": {                // Dimensions of the image
        "width": "number",
        "height": "number"
      },
      "scale": "string"        // The scale (from the filename)
    }
  ],
  "creator": "string",         // Display name, username, or "UNKNOWN"/"NONE"
  "emote_link": "string",      // Link to the emote on 7TV
  "set": "string"              // Either 'Global 7TV' or '7TV' depending on context
}
```

### Set/Personal Set

```json
{
  "id": "string",
  "name": "string",
  "owner": { "username": "string", "display_name": "string" } | null,
  "flags": "number"
}
```

### Create Cosmetic

```json
{
  "id": "string",          // Unique ID of the cosmetic
  "kind": "BADGE | PAINT | EMOTE_SET",  // Type of cosmetic
  "owner": {               // Owner of the cosmetic
    "id": "string",           
    "platform": "string",     // Platform (e.g., TWITCH)
    "username": "string",     
    "display_name": "string", 
    "linked_at": "number",    // Timestamp when linked
    "emote_capacity": "number", 
    "emote_set_id": "string"  
  }
}
```

### Badge

```json
{
  "id": "string",          // Unique badge ID
  "name": "string",        // Badge name
  "tooltip": "string",     // Tooltip text for the badge
  "owner": [],             // Always empty
  "urls": [                // Badge image URLs for different scales
    {
      "url": "string",     // Direct URL to badge image
      "scale": "string"    // Scale (1x, 2x, etc.)
    }
  ]
}
```

### Paint

```json
{
  "id": "string",            // Unique paint ID
  "name": "string",          // Paint name
  "style": "string",         // CSS gradient or pattern style (e.g., linear-gradient)
  "shape": "string",         // Shape of the paint (e.g., circle, square)
  "backgroundImage": "string", // Full CSS background image/gradient
  "shadows": "string | null",  // CSS drop-shadow string if any
  "KIND": "non-animated | animated", // Type of paint
  "owner": [],               // Always empty
  "url": "string"            // Optional image URL (if any)
}
```

### Set Change Event

```json
{
  "old_set": { "id": "string", "name": "string" },
  "new_set": { "id": "string", "name": "string" },
  "SevenTV_user_id": "string"
}
```

### Actor (User performing the action)

```json
{
  "username": "string",
  "display_name": "string"
}
```