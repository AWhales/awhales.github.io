---
title: Items as moves
date: 2026-08-30
preview: /assets/notes/woodlouse.webm
layout: layouts/post.njk
---

Something I've been puzzling over for a while is how to handle player progression in terms of combat.

One of the biggest mental blocks has been trying to solve how the player unlocks new moves. Learning moves works great in monster battling games like Pokémon because you have a roster of different play styles you can pick from and swap out depending on the context.

But that design just doesn't work for this game. You play combat as a single character, sometimes accompanied by teammates that you don't control. If a player learned a moveset they didn't enjoy, or wasn't appropriate for the enemy they were battling, being limited to just four moves could be frustrating, so being able to fluidly swap between move-sets is essential.

![Combo minigame against a Peculiar Woodlouse](/assets/notes/woodlouse.webm)

There's other little issues too - as the moves are played out as mini-games in the combat field, if every move has a *somewhat* unique interaction, how do the game go about teaching the player the (possibly) many mini-games? How does the player know the move and mini-game they are committing to will be an interaction they enjoy?

I think I've found a good design pattern that solves some of those problems.

![Keepsakes menu showing an Amethyst Necklace and its move, Clarity](/assets/notes/keepsakes.png)

What if equipment was your moveset? By dedicating four slots to active "keepsakes", the items you find in the overworld become the four active moves you bring into battle.

This pattern has many benefits - Swapping out a frustrating move becomes as simple as opening your inventory and equipping a different trinket, you can test out novel moves in low-stakes overworld encounters before committing to them, and it ties combat progression directly into world exploration, encouraging players to hunt down weird and unusual items.

Anyway this was maybe a bit rambly, but I think there's definitely something to it.
