# CS50 Cookie Eater Chrome Extension

#### Video Demo: <https://www.youtube.com/watch?v=1BFmS9i6-Ik>

Or follow this link to see Cookie Eater in action: [Demo Video](https://www.youtube.com/watch?v=1BFmS9i6-Ik)

#### Description:

_The Cookie Eater extension deletes cookies when you leave a webpage that is not on your whitelist. Besides this, it also aims to find the button to allow for cookies when you arrive at a webpage, and push it, to save the user some frustration._

The user that's me, and the last thing was what I wanted in the first place.
Then the process starts: if you want to nearly unconditionally allow for cookies and push on buttons automaticly, you gotta clean the mess you leave behind. Because how ignorant these obligatory consents became after the GDPR started in 2016, it is still our data and privacy protection regulation. And then if you are making an extension it gotta be fool proof, so everyone should be able to use it whitout the extension to break down. No eror messages. Just nothing.

It was really fun creating my first extension. As was CS50.

## Cookie Eater

#### Tech

Vanilla Javascript, HTML and CSS

#### instalation

Cookie Eater can run in any Chromium Web Browser. Afer downloading this repository you can install it in the extensions tab by enabling developer mode and open it by clicking the load unziped extension button.

#### files

##### manifest.json

Declares the program to the browser, what permissions are needed, which files, in what location which icons to use, etc.

##### background.js

Is the backend of the extension. It handles the state, storage, and controls the logic of the extension: when to add a domain, inject scripts delete cookies. Pleas read the comments in the file to get a better understanding.

##### scripts/pushconfirmationButton.js

Although most functions stayed in background.js as helper functions. all logic for finding the butten is in this file which gets injected by background.js, but only on first loading of a domain and not when the domain is in the whitelist.
This is the proces:

1. Get all HTML elements with the word "cookies" in the text content
2. Iterate over these ellements, for each element:
3. Go to the parrent and search in the children (recursively) for links and buttons
4. Keep track which elements are visited already
5. If nothing found go to the parrent parrent and repeat from 3. for unvissited elements
6. If noting found go even one lever higher and repeat from 3.
7. else go to next element at 2. and repeat

#### options/options.js and -.html and browser-actions/popup.js and -.html

Are the frontend of the extension. The html's creates a userinterface and the javascript part handles the interactive component, and communicate with background.js
