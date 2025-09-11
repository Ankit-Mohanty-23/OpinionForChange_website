# 📑 **Opinara Data Structure & Flow Report**

## 🌊 Core Concept

* **Opinara** is a community-driven platform where users share opinions within **location-based communities** called **Waves**.
* Each **Wave** is tied to a location (e.g., `Wave@Delhi`) and contains posts from multiple users.
* Users can join different Waves, create posts, and engage through upvotes/downvotes.

---

## 👤 **User**

### Purpose

Manages user identity, authentication, and community participation.

### Schema

* `username`: Unique identifier for each user.
* `email`: User’s email for login & verification.
* `password`: Encrypted password.
* `joinedWaves`: List of Waves the user is a member of.
* `createdAt`: Timestamp of registration.

---

## 🌊 **Wave**

### Purpose

Represents a **community** based on a location. Each Wave aggregates posts and members.

### Schema

* `name`: Unique name, e.g. `Wave@Delhi`.
* `location`: Actual location name for clarity.
* `createdBy`: Reference to the user who created the Wave.
* `members`: Array of users who joined the Wave.
* `postsCount`: Quick access to number of posts in the Wave.
* `recentPosts`: Stores references to latest posts for fast fetching.
* `createdAt`: Timestamp of Wave creation.

---

## 📝 **Post**

### Purpose

Stores individual user contributions (opinions) within a Wave.

### Schema

* `waveId`: Links post to its parent Wave.
* `userId`: Identifies the author.
* `content`: The opinion text.
* `votes`:

  * `up`: Array of users who upvoted.
  * `down`: Array of users who downvoted.
* `createdAt`: Timestamp of posting.

---

## ⚡ **Data Flow**

1. **User Registration** → User creates account with username, email, password.
2. **Joining a Wave** → User adds themselves to `joinedWaves` + gets added to Wave’s `members`.
3. **Creating a Wave** → New Wave is generated with creator as `createdBy`.
4. **Posting** →

   * New post is stored in **Post** collection.
   * `waveId` ensures it’s linked to the Wave.
   * Wave’s `postsCount` increments and `recentPosts` updates.
5. **Voting** →

   * Users can upvote/downvote posts.
   * Prevents duplicate voting by storing user references in `votes`.

---
