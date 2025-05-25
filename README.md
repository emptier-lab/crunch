
<div align="center">
  <img src="./header.png" alt="crunch.space header" width="800"/>
</div>

A tool for discovering private content on CrunchLabs.

## What's This About?

So I was messing around with CrunchLabs stuff and noticed something interesting about how they handle their image storage. Turns out there's a pattern to how they generate IDs for user uploads, and well... let's just say it's not as random as it should be.

## What Does This Do?

crunch.space is a simple web tool that:
- Exploits predictable ID generation patterns in CrunchLabs' image storage
- Systematically tests generated IDs against their CDN endpoints
- Reveals private user uploads
- Allows mass harvesting of discovered content

Basically it's like a digital lockpick for their system.

## The Issue

Without going into too much detail, the problem is in how CrunchLabs generates their image identifiers. They're using a method that makes it possible to predict valid IDs, which means you can find images that users probably thought were private.

This is a classic case of "security through obscurity" not working - just because a URL is hard to guess doesn't mean it's secure if there's a pattern.

## Disclaimer

This tool is for educational purposes and responsible disclosure. Don't be a dick with it. If you find something sensitive, report it properly instead of being weird about it.

Also this probably violates their ToS so use at your own risk I guess.

## Technical Notes

The vulnerability appears to be related to insufficient entropy in ID generation. The pattern suggests they might be using timestamp-based or sequential generation with predictable components.

Rate limiting seems minimal, but don't hammer their servers unnecessarily.

## Found Something?

If you discover anything concerning, please report it through proper channels. Don't post personal info or sensitive content anywhere public.

---

*Built because I was bored and curious. Not responsible for what you do with this.*

## Credits

Made by empty?
