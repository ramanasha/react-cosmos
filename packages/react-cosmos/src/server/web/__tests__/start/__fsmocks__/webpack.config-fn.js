export default jest.fn(() => ({
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/
      }
    ]
  }
}));
