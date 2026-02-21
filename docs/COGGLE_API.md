# Coggle API Documentation (Extracted from Official Mind Map Images)

*This document was transcribed directly from the official Coggle API mind map diagrams provided.*

---

## 1. Authentication & OAuth2

OAuth2 allows your app to securely authenticate and act on their behalf within Coggle.
Google has a good overview of OAuth2 if you are unfamiliar with the flow.

### Libraries
Libraries to handle authentication:
- **node.js**: `passport-coggle-oauth2` (`npm install passport-coggle-oauth2`)

### User Badge
**`GET api/1/badge`**
Once authenticated, you can get a persistent information "badge" for the authenticated user. The data returned includes a user ID that depends on your client ID.
- **response**:
  - `id`: client-specific identifier of the user (string)

### OAuth2 Flow

#### Scopes
- **read**: Gives your app access to a users diagram list, and lets you view their diagrams
- **write**: Gives your app permission to create, edit and delete diagrams from a users account

#### 1. Consent Page
**`GET /dialog/authorize`**
This is the consent page that you must redirect your user to in order for them to grant your app an access token.
- **Query Parameters**:
  - `?response_type=code` : Must be set to `code`. We don't support any other OAuth2 flows yet!
  - `?scope` : A space separated list of scopes
  - `?client_id` : The client ID off your application from your Developer page
  - `?redirect_uri` : The redirect URI that you have specified on your Developer page. Note: this must match the value specified exactly or your request will fail!

#### 2. Exchange Code for Token
**`POST /token`**
Once you've got a code (from the user consent page) you must post it to this endpoint to exchange it for an access token.
- **Headers**:
  - `Authorization`: Pass your client_id and client_secret using the standard Basic Auth mechanism
  - `Content-Type`: The content type must be `application/json`. The rest of these fields should be POSTed as properties of a JSON object in the request body.
- **Body parameters (JSON)**:
  - `code` : The code granted by the user in the consent flow
  - `grant_type=authorization_code` : Must be set to `authorization_code`
  - `redirect_uri` : The redirect URI that you have specified on your Developer page. Note: this must match the value specified exactly or your request will fail!
- **Response**:
  - `access_token`: Save this in your database! Pass it as the access_token parameter when accessing protected resources. e.g. `GET https://coggle.it/api/1/diagrams?access_token=XXX`
  - `token_type=bearer`: For now we only support bearer tokens.

---

## 2. Folders

Each diagram may belong to a folder, allowing access for the members of the folder.

### Endpoints
- **`GET /api/1/folders`**
  - List folders for a user (required scope: read)
  - **Response**: Array of `Folder Resource`
- **`GET /api/1/folders/:folder`**
  - Get a specific folder (required scope: read)
  - **Response**: `Folder Resource`

### Folder Resource Properties
- `_id` *(readonly)*: The ID of the folder
- `name`: Name of the folder
- `folder` *(readonly)*: Folders can be nested. Note: reserved for future use
- `created_by` *(readonly)*: The user ID that created the folder
- `my_access` *(readonly)*: Array of permissions on the folder for the current user (`read`, `write`, `list`, `clone`, `admin`)

---

## 3. Diagrams

(aka Coggles), accessible in the browser at `https://coggle.it/diagram/:diagram`

### Endpoints
- **`GET /api/1/diagrams`**
  - List diagrams for a user (required scope: read)
  - **Query Parameters**:
    - `?folder=:folderId` : List all diagrams for a particular folder (e.g., `/api/1/diagrams?folder=5328d9395a859026da000008`)
    - `?folder=shared` : List diagrams in partially shared folders (`/api/1/diagrams?folder=shared`)
    - `?folder=own` : List personal diagrams (ones not in a folder) (`/api/1/diagrams?folder=own`)
  - **Response**: An array of `Diagram Resource`
- **`GET /api/1/diagrams/:diagram`**
  - Get a specific diagram (required scope: read)
  - **Response**: `Diagram Resource`
- **`POST /api/1/diagrams`**
  - Create a new diagram (required scope: write)
  - **Body**: `Diagram Resource`
  - **Response**: `Diagram Resource`

### Diagram Resource Properties
- `_id` *(readonly)*: The ID of the diagram, use this in URLs to refer to the diagram
- `timestamp` *(readonly)*: Creation timestamp as UTC datetime
- `title`: The title of the diagram
- `my_access` *(readonly)*: Array of permissions on the diagram for the current user (`read`, `write`, `list`, `clone`)
- `owner_id` *(readonly)*: The ID of the diagram owner
- `folder` *(readonly)*: The ID of the folder, or null if the diagram is not in a folder
- `modified` *(readonly)*: Whether the diagram has been modified since last viewed

---

## 4. Nodes

Nodes (aka "branches") are the individual pieces of text that make up a Coggle.

### Endpoints
- **`GET /api/1/diagrams/:diagram/nodes`**
  - Get the content of a diagram
  - **Response**: Array of `Node Tree resource`
  - *returned array always has one element, the diagram root*
- **`PUT /api/1/diagrams/:diagram/nodes?action=arrange`**
  - Automatically re-arrange the branches in the diagram.
  - **Response**: Array of `Node Tree resource` (returned array always has one element, the diagram root)
  - *Use this with care - the layout is not guaranteed to be the same across multiple calls with the same diagram. The layout algorithm doesn't understand what the diagram means - so if you can use information (like ordering, or some sibling branches being more closely related than others) to devise a better layout, then you should do so.*
- **`POST /api/1/diagrams/:diagram/nodes`**
  - Add a node to a diagram
  - **Body**: `Node Resource` (all fields are required, except `_id`, which must be omitted)
  - **Response**: `Node Resource`
  - **Headers**: `201 Location: /api/1/diagrams/:diagram/nodes/:node`
- **`PUT /api/1/diagrams/:diagram/nodes/:node`**
  - Modify a node
  - **Body**: `Node Resource`
  - *Omitted fields are not modified (patch semantics)*
  - **Response**: `Node Resource`
  - *NB: only fields that were included in the request will be returned*
- **`DELETE /api/1/diagrams/:diagram/nodes/:node`**
  - Delete a branch
  - *Removes the node and all its descendents. If you don't want to remove children, you can use PUT to change the parent of the child nodes.*
  - **Response**:
    - `count`: number of nodes removed

### Node Tree Resource (readonly)
- `_id`: identity of node
- `offset`: offset from parent node
  - `x`: horizontal offset, pixels, branchwise
  - `y`: vertical offset, pixels, downwards
- `text`: text of node
- `children`: array of `Node Tree resource`

### Node Resource
- `_id` *(readonly)*: unique ID of the node
- `offset`: offset from parent node
  - `x`: horizontal offset, pixels, positive is right
  - `y`: vertical offset, pixels, positive is down
- `text`: text of node
- `parent`: id of parent node
- `colour`: colour of node
- `text_size`: size of node text
- `width`: width of node (before text wraps)
