This is backbone project. 

Main file is app.js, 

all Backbone models are described in models.js; All routes are described in Router.js. 

Views use handlebars template saved in template/, JST reads all *.hbs file and compile into template to be used by Backbone.View for render(). 

The jquery, backbone folder are modified version of jquery and backbone. It is modified to support a module.exports and to be read by CommonJS. 

To compile this entire project into one js file, three steps are necessary:

1. install nodejs. 

2. use the npm (package management usually installed with nodejs) to install required packages by typing:

npm install

note this command must be typed when you are in client/ directory. 

(This commandline will read package.json and install all depencencies in a local node_modules/ foler)

3. install some global node packages

npm install -g browserify

There are ways to make this process easier, (look into watchify)

After the three steps, the entire js project can be compiled into one js file. This is simpler to be required by the browser.

Command (in compile.sh):

<new> watchify -t hbsfy app.js --full-paths -o ../common/static/js/all.js -v
<old> #browserify -t hbsfy client/js -o common/static/js/all.js

then in index.html you can simply include this one file. 