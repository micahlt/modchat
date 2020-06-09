# `modchat`
![GitHub issues](https://img.shields.io/github/issues-raw/micahlt/modchat) ![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/micahlt/modchat) [![GitHub forks](https://img.shields.io/github/forks/micahlt/modchat)](https://github.com/micahlt/modchat/network) [![GitHub stars](https://img.shields.io/github/stars/micahlt/modchat)](https://github.com/micahlt/modchat/stargazers) [![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fmicahlt%2Fmodchat)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fmicahlt%2Fmodchat)

Modchat (stylized modchat) is a moderated real-time chatting platform designed for [Scratch](https://scratch.mit.edu/) users.

## For Users
Modchat uses a secure server combined with [ScratchVerifier](http://scratchverifier.ddns.net:8888/site) to sign you in.  While this is very safe, Modchat is currently under development and you could potentially expose your verification token to code contributors while they are working on it.  If you want to stay safe, we reccommend that you not use Modchat until a stable, secured version is released.

## For Contributors
If you're interested in contributing, I'd love to have your help!  I ask that you do the following things:
- **Comment your code:** Every line that isn't just brackets should have comments telling what it does.  All `console.log` lines should have `// ROP` at the end to indicate that they should be removed on production.
- **Use a beautifier:** If possible, use an offline text editor that supports code beautification so we can actually read your code!
- **Find security flaws:** If you see a flaw that could possibly get around the moderation system or leak user data, _please point it out_.  It's very important that we remain secure and follow the [Scratch Community Guidelines](https://scratch.mit.edu/community_guidelines).
- **Ask questions:** If you don't know what a line of code does, file an issue and other contributors can help you figure it out.  Or use Stack Overflow.  

### Notes on the codebase
- Any time you see "ROP" signifies that the line of code should be removed or commented out when the version goes into production (**R**emove **O**n **P**roduction)
- Any time you see "SV", "sv", or "sV" signifies that that line of code/variable/comment relates to [ScratchVerifier](http://scratchverifier.ddns.net:8888/site).

### Notes on hosting
- We use [Heroku](https://heroku.com) for hosting.  
- Currently the real address of the live version of Modchat is [https://modchat-app.herokuapp.com](https://modchat-app.herokuapp.com), but it is also URL masked at [https://modchat.micahlindley.com](https://modchat.micahlindley.com).
- Due to Heroku free time restrictions, the Modchat web app will shut down for a few days each month since I can't currently pay for premium dynos.
- I cannot set up a real, unmasked custom domain without setting up a credit card with Heroku, so it'll be awhile, but when we're ready for production I plan on buying https://modchat.app
