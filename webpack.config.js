module.exports = {
    entry: "./static/js/main.tsx",
    output: {
        path: __dirname + "/static/dist/dev",
        filename: "bundle.js"
    },

    devtool: "eval-source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            // and then they will be handled by the babel loader to compile down to es5.
            {test: /\.tsx?$/, loader: "ts-loader"},
            {test: /\.css$/, loader: "style-loader!css-loader"}
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "jquery": "jQuery",
        "moment": "moment",
        "react-router": "ReactRouter",
        "react-router-dom": "ReactRouterDOM"
    },
    mode: "development"
};
