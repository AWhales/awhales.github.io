---
title: Shaders are hard
tease: Puddle reflections, shader grass, and the FPS I shouldn't have ignored.
date: 2026-08-26
layout: layouts/post.njk
permalink: notes/shaders-are-hard.html
---

This past week I've been looking at replacing some of my sprite work in game with shaders. I want this game to look gorgeous, even at the 160×135 resolution it operates at, and up to this point every single asset has been hand drawn by me.

I have a few shaders in my game, almost all of them in the combat stage for a variety of silly little FX, and one very early, very ugly attempt at a CRT filter that I really need to delete. But this week I decided I wanted a puddle with a reflection. I threw together a little shader that draws a blue rectangle and reflects the sprites of the NPCs and Objects around it. It came together quite quickly and worked out very nicely, so then I started to think what else could I replace with shaders.

![Puddle reflection](/assets/notes/puddle.gif)

The grass tiles in my map react as you walk over them, and it took me a while to get the sprite work right with the limited palette I'm working with — but when you have huge clusters of them on the screen they start to look very regular which always bothered me. So I got to work trying to create a version of them entirely with shaders, which took much longer than I'd like to admit.

From that point on it became much easier to dial in a slightly random arrangement of grass for each tile, I added percentage chance of different types of plants, flowers and accent colours. I'm very pleased with how they turned out. The bit I love the most is the way the player moves through them, depending on the direction you walk on them they displace in a different way, which is quite subtle but I think adds a lot of depth to them.

![Shader grass](/assets/notes/grass.gif)

Then I saw the FPS and realised I'd made a terrible mistake, but it was far too late to turn back, and so I began the tedious process of trying to optimise them — a process that took more time than making them in first place.

It's quite amusing running into optimisation issues with a game that runs with a resolution close to a gameboy, and it speaks to my relative inexperience with shaders, but through a combination of culling and smarter draw calls I ended up roughly where I was in the first place, with some much nicer grass.
