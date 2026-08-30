---
title: Items as moves
date: 2026-08-30
preview: /assets/notes/keepsakes.png
layout: layouts/post.njk
---

Something I've been puzzling over for a while is how I was going to handle player progression in terms of combat. I don't want to implement a traditional XP levelling system, skill tree or anything too 'menu-divey'. It's difficult to think of other ways to give players a sense of growth and satisfaction that their power has increased.

One of my biggest blockers has been how the player goes about unlocking new moves. Learning moves works great in monster battling games like Pokémon because you have a roster of different play styles you can pick from and swap out depending on the context. That design doesn't work for my game, you play combat mostly as a single character, sometimes accompanied by teammates that you (currently) don't control. If a player learned a moveset they didn't enjoy, or wasn't appropriate for the enemy they were battling, being limited to just four moves would be deeply frustrating, so being able to fluidly swap between move-sets is essential.

![Combo minigame for Clarity against a Minor Rabid Rat](/assets/notes/combo-minigame.webm "wrap")

A parallel issue I've had to this is as a result of one of the core principles of the game - that almost every player move is played out as a brief mini-game in the combat field. The problem is this, if every move has a *somewhat* unique interaction, how does the player learn the new mini-game? How does the player know the move they are committing to their moveset will be an interaction they enjoy?

I think I've found a good design pattern that solves most of those problems.

I've been playing a lot of the climbing game Peak in the last year (great game), and every item you find in the map gives you a unique ability with a relatively simple interface, allowing you to solve the puzzle of climbing the mountain in a number of different and hilarious ways. I'd previously considered my equipped items as static buffs and abilities that could affect combat, but what if you had four slots for holding items, and the items themselves bestowed the player with the four moves that they take into combat.

![Keepsakes menu showing an Amethyst Necklace and its move, Clarity](/assets/notes/keepsakes.png)

This pattern solves both the interfacing issue, the need for fluidity and gives the player the ability to test out new and novel moves in low stakes combat situations, and turns the issue of combat minigame confusion into a process of discovery. Plus the added bonus of encouraging the players to explore the overworld for new and unusual items that could provide powerful or hilarious results.

Also play peak with your friends it's great.
