module.exports = {
  mode: 'production',
  resolve: {
    fallback: {
      "path": false,
      "crypto": false,
      "fs": false,
      // "worker_threads": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/transform-runtime'],
            sourceType: "script"
          }
        }
      }
    ]
  }
};
