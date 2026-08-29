---
title: Shaders are hard
date: 2026-08-26
preview: /assets/notes/grass.webm
layout: layouts/post.njk
---

This past week I've been looking at replacing some of my sprite work in game with shaders. I want this game to look great, even at the 160×135 resolution it operates at, and up to this point every single asset has been hand drawn by me.

I have a few shaders in my game, almost all of them in the combat stage for a variety of silly little FX, and one very early, very ugly attempt at a CRT filter that I really need to delete. But this week, after a playthrough of Pokemon Fire Red, I decided I needed puddles with reflections. I threw together a little shader that draws a rounded blue rectangle which reflects the sprites of the NPCs and Objects around it - it came together quite quickly and worked out very nicely, so naturally I started to think what else could I make with shaders.

![Puddle reflection](/assets/notes/puddle.webm)

The grass tiles in my map seemed like the perfect candidate, the sprites react as you walk over them and it took me a while to get the artwork to have the right look and feel with the limited palette and pixels I'm working with. Unfortunately when you have clusters of them on the screen the repetition becomes very obvious, which has always bothered me. So I got to work trying to create a version of them driven by shaders. This took much longer than I'd care to admit.

But once I made one that looked passably similar to my original tile, the rest was much easier, I dialed in a slightly random arrangements of grass for each tile, a percentage chance of different types of plants, flowers and accent colours, etcetera. I'm very pleased with how they turned out. The bit I love the most is the way the player moves through them, depending on the direction you walk on them they displace in a different way, which is quite a subtle effect but I think adds a lot of depth to them.

![Shader grass](/assets/notes/grass.webm)

Then I turned on the FPS overlay and realised I'd made a terrible mistake, but it was far too late to turn back, and so I began the tedious process of trying to optimise them — This possibly ended up taking more time than making them in the first place.

Running into optimisation issues at near–Game Boy resolution is quite humbling. It speaks to my inexperience with shaders — or more specifically, how they interact with GameMaker when you try to turn the maths into pixel-perfect draw calls and fake depth. But through a combination of culling, targeted draw calls and a lot of perseverance, I ended up roughly where I was at the start, with some much nicer grass.
